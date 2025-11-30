<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["POST"]);

$usuario = verificarToken($jwtSecretKey);
$data = json_decode(file_get_contents("php://input"), true);

$passos = max(0, intval($data["passos"] ?? 0));
$dataRegistro = date("Y-m-d");

try {
    // Buscar dados de hoje PRIMEIRO
    $stmtHoje = $pdo->prepare("
        SELECT calorias_ingeridas, calorias_gastas, saldo_calorico
        FROM calorias
        WHERE usuario_id = :usuario_id AND data_registro = :data
    ");
    $stmtHoje->execute([
        ":usuario_id" => $usuario->id,
        ":data" => $dataRegistro
    ]);
    $dadosHoje = $stmtHoje->fetch(PDO::FETCH_ASSOC);

    // 1. Buscar dados do usuário
    $stmt = $pdo->prepare("
        SELECT u.peso, u.peso_inicial, u.altura, u.sexo_biologico, u.data_nascimento, p.pergunta4_nivel_atividade
        FROM usuarios u
        JOIN perguntas p ON u.perguntas_id = p.id
        WHERE u.id = :id
    ");
    $stmt->bindParam(":id", $usuario->id);
    $stmt->execute();
    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    $peso = floatval($info["peso"] ?? $info["peso_inicial"] ?? 0);
    $altura = intval($info["altura"]);
    $sexo = $info["sexo_biologico"];
    $nivel = $info["pergunta4_nivel_atividade"];

    // 2. Calcular idade
    $dataNascimento = new DateTime($info["data_nascimento"]);
    $hoje = new DateTime();
    $idade = $dataNascimento->diff($hoje)->y;

    // 3. Calcular TMB (Taxa Metabólica Basal)
    $tmb = ($sexo === "m")
        ? (10 * $peso) + (6.25 * $altura) - (5 * $idade) + 5
        : (10 * $peso) + (6.25 * $altura) - (5 * $idade) - 161;

    // 4. Definir fator de atividade
    $fatorAtividade = match ($nivel) {
        "sedentario" => 1.2,
        "baixo" => 1.375,
        "medio" => 1.55,
        "alto" => 1.725,
        default => 1.55
    };

    // 5. Estimar gasto calórico diário
    $estimativaGastoDiario = round($tmb * $fatorAtividade, 2);

    // 6. Calcular calorias gastas com base nos passos
    $fatorPassos = match ($nivel) {
        "sedentario" => 0.0003,
        "baixo" => 0.0004,
        "medio" => 0.0005,
        "alto" => 0.0006,
        default => 0.0005
    };
    $caloriasGastas = round($passos * $peso * $fatorPassos, 2);

    // 7. Calcular calorias ingeridas com base nas refeições do dia
    $stmt = $pdo->prepare("
        SELECT SUM(CAST(a.energia_kcal AS DECIMAL(6,2))) AS total_calorias
        FROM refeicoes r
        JOIN refeicoes_alimentos ra ON r.id = ra.refeicao_id
        JOIN alimentos a ON a.id = ra.alimento_id
        WHERE r.usuario_id = :usuario_id AND r.data_registro = :data
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    $caloriasIngeridas = is_numeric($resultado["total_calorias"]) ? floatval($resultado["total_calorias"]) : 0;

    // Se já existir registro hoje, usar as calorias ingeridas de lá (mais confiável)
    if ($dadosHoje && $dadosHoje['calorias_ingeridas'] > 0) {
        $caloriasIngeridas = floatval($dadosHoje['calorias_ingeridas']);
    }

    // 8. Calcular saldo calórico
    $saldoCalorico = $caloriasIngeridas - $caloriasGastas;

    // 9. Definir limites mínimos seguros
    $limiteMinimoSeguro = $sexo === "f" ? 1200 : 1500;

    // 10. Definir objetivo de perda de peso (déficit de 500 a 1000 kcal)
    $objetivoMinimo = max($estimativaGastoDiario - 500, $limiteMinimoSeguro);
    $objetivoMaximo = max($estimativaGastoDiario - 1000, $limiteMinimoSeguro);

    // 11. Verifica se já existe registro para hoje
    $stmt = $pdo->prepare("
        SELECT id FROM calorias 
        WHERE usuario_id = :usuario_id AND data_registro = :data
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->execute();
    $existe = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existe) {
        // Atualiza registro existente
        $stmt = $pdo->prepare("
            UPDATE calorias SET 
                passos = :passos,
                calorias_gastas = :gastas,
                calorias_ingeridas = :ingeridas,
                saldo_calorico = :saldo
            WHERE id = :id
        ");
        $stmt->bindParam(":passos", $passos);
        $stmt->bindParam(":gastas", $caloriasGastas);
        $stmt->bindParam(":ingeridas", $caloriasIngeridas);
        $stmt->bindParam(":saldo", $saldoCalorico);
        $stmt->bindParam(":id", $existe["id"]);
        $stmt->execute();
    } else {
        // Insere novo registro
        $stmt = $pdo->prepare("
            INSERT INTO calorias (
                usuario_id, data_registro, passos, calorias_gastas, calorias_ingeridas, saldo_calorico
            ) VALUES (
                :usuario_id, :data, :passos, :gastas, :ingeridas, :saldo
            )
        ");
        $stmt->bindParam(":usuario_id", $usuario->id);
        $stmt->bindParam(":data", $dataRegistro);
        $stmt->bindParam(":passos", $passos);
        $stmt->bindParam(":gastas", $caloriasGastas);
        $stmt->bindParam(":ingeridas", $caloriasIngeridas);
        $stmt->bindParam(":saldo", $saldoCalorico);
        $stmt->execute();
    }

    // 12. Retorno completo
    enviarSucesso(201, [
        "mensagem" => "Dados de calorias atualizados com sucesso!",
        "peso" => $peso,
        "altura" => $altura,
        "idade" => $idade,
        "sexo" => $sexo,
        "nivel_atividade" => $nivel,
        "tmb" => round($tmb, 2),
        "fator_atividade" => $fatorAtividade,
        "passos" => $passos, // 🆕 ADICIONAR
        "calorias_ingeridas" => $caloriasIngeridas,
        "calorias_gastas" => $caloriasGastas,
        "saldo_calorico" => $saldoCalorico,
        "estimativa_gasto_diario" => $estimativaGastoDiario,
        "limite_minimo_seguro" => $limiteMinimoSeguro,
        "objetivo_minimo" => $objetivoMinimo,
        "objetivo_maximo" => $objetivoMaximo
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao registrar calorias: " . $e->getMessage());
}
?>