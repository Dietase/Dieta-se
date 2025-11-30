<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["POST", "GET"]); 

$usuario = verificarToken($jwtSecretKey);
$data = json_decode(file_get_contents("php://input"), true);

// GET para buscar alimentos permitidos
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $usuario = verificarToken($jwtSecretKey);
    
    try {
        // Buscar alimentos permitidos (NÃO da dieta)
        $stmt = $pdo->prepare("
            SELECT a.id, a.nome, a.categoria, a.energia_kcal, a.carboidrato_g, a.proteina_g, a.lipideos_g
            FROM alimentos a
            JOIN alimentos_permitidos ap ON ap.alimento_id = a.id
            WHERE ap.usuario_id = :usuario_id
            ORDER BY a.nome ASC
        ");
        $stmt->execute([":usuario_id" => $usuario->id]);
        $alimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        enviarSucesso(200, [
            "mensagem" => "Alimentos permitidos carregados com sucesso!",
            "alimentos" => $alimentos
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar alimentos: " . $e->getMessage());
    }
    exit();
}

$tipo = $data["tipo_refeicao"] ?? null;
$sintoma = $data["sintoma"] ?? "nenhum";
$alimentos = $data["alimentos"] ?? [];
$dataRegistro = date("Y-m-d");

if (!$tipo || !is_array($alimentos) || empty($alimentos)) {
    enviarErro(400, "Campos obrigatórios não preenchidos.");
}

try {
    // 1. Validar se todos os alimentos estão em alimentos_permitidos
    $alimentoIds = array_column($alimentos, "id");
    $placeholders = implode(',', array_fill(0, count($alimentoIds), '?'));

    $stmtValidar = $pdo->prepare("
        SELECT alimento_id FROM alimentos_permitidos
        WHERE usuario_id = ? AND alimento_id IN ($placeholders)
    ");
    $stmtValidar->execute(array_merge([$usuario->id], $alimentoIds));
    $permitidos = $stmtValidar->fetchAll(PDO::FETCH_COLUMN);

    if (count($permitidos) !== count($alimentoIds)) {
        enviarErro(403, "Alguns alimentos não são permitidos para este usuário.");
    }

    // 2. Inserir refeição
    $stmt = $pdo->prepare("
        INSERT INTO refeicoes (usuario_id, data_registro, tipo_refeicao, sintoma)
        VALUES (:usuario_id, :data, :tipo, :sintoma)
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->bindParam(":tipo", $tipo);
    $stmt->bindParam(":sintoma", $sintoma);
    $stmt->execute();

    $refeicaoId = $pdo->lastInsertId();

    // 3. Associar alimentos
    $stmtAlimento = $pdo->prepare("
        INSERT INTO refeicoes_alimentos (refeicao_id, alimento_id, gramas)
        VALUES (:refeicao_id, :alimento_id, :gramas)
    ");

    foreach ($alimentos as $item) {
        $alimentoId = $item["id"] ?? null;
        $gramas = $item["gramas"] ?? 100;
        
        if ($alimentoId) {
            $stmtAlimento->bindParam(":refeicao_id", $refeicaoId);
            $stmtAlimento->bindParam(":alimento_id", $alimentoId);
            $stmtAlimento->bindParam(":gramas", $gramas);
            $stmtAlimento->execute();
        }
    }

    // 4. Buscar detalhes da refeição registrada
    $stmtDetalhes = $pdo->prepare("
        SELECT a.id, a.nome, a.energia_kcal, a.carboidrato_g, a.proteina_g, a.lipideos_g, ra.gramas
        FROM refeicoes_alimentos ra
        JOIN alimentos a ON a.id = ra.alimento_id
        WHERE ra.refeicao_id = :refeicao_id
    ");
    $stmtDetalhes->execute([":refeicao_id" => $refeicaoId]);
    $alimentosDetalhes = $stmtDetalhes->fetchAll(PDO::FETCH_ASSOC);

    // 5. Calcular totais
    $totalCalorias = 0;
    $totalCarbo = 0;
    $totalProteina = 0;
    $totalGordura = 0;

    foreach ($alimentosDetalhes as $alimento) {
        $fatorGramas = floatval($alimento["gramas"]) / 100;
        $totalCalorias += floatval($alimento["energia_kcal"]) * $fatorGramas;
        $totalCarbo += floatval($alimento["carboidrato_g"]) * $fatorGramas;
        $totalProteina += floatval($alimento["proteina_g"]) * $fatorGramas;
        $totalGordura += floatval($alimento["lipideos_g"]) * $fatorGramas;
    }

    enviarSucesso(201, [
        "mensagem" => "Refeição registrada com sucesso!",
        "refeicao_id" => $refeicaoId,
        "data" => $dataRegistro,
        "tipo" => $tipo,
        "sintoma" => $sintoma,
        "total_alimentos" => count($alimentosDetalhes),
        "alimentos" => $alimentosDetalhes,
        "totais" => [
            "calorias" => round($totalCalorias, 2),
            "carboidratos_g" => round($totalCarbo, 2),
            "proteinas_g" => round($totalProteina, 2),
            "gorduras_g" => round($totalGordura, 2)
        ]
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao registrar refeição: " . $e->getMessage());
}
?>