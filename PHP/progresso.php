<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT", "PATCH"]);

$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Buscar dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $usuarioId = (int)$usuario->id;
        
        // Buscar dados principais
        $stmt = $pdo->prepare("
            SELECT 
                m.tipo_meta AS meta,
                m.valor_desejado,
                m.faixa_recomendada,
                u.peso_inicial,
                u.imc_inicial,
                u.peso AS peso_atual,
                u.imc AS imc_atual,
                u.altura,
                u.total_registros_peso
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            JOIN pergunta5_meta m ON m.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmt->execute(['usuario_id' => $usuarioId]);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            enviarErro(404, "Perfil não encontrado");
        }

        // Buscar última atualização separadamente
        $stmtUltimaData = $pdo->prepare("
            SELECT MAX(data_registro) as ultima_atualizacao
            FROM historico_peso
            WHERE usuario_id = :usuario_id
        ");
        $stmtUltimaData->execute(['usuario_id' => $usuarioId]);
        $resultUltimaData = $stmtUltimaData->fetch(PDO::FETCH_ASSOC);
        $dados['ultima_atualizacao'] = $resultUltimaData['ultima_atualizacao'] ?? null;

        // Buscar histórico de peso
        $stmtHistorico = $pdo->prepare("
            SELECT peso, DATE_FORMAT(data_registro, '%d/%m') as data_formatada
            FROM historico_peso
            WHERE usuario_id = :usuario_id
            ORDER BY data_registro ASC
            LIMIT 20
        ");
        $stmtHistorico->execute(['usuario_id' => $usuarioId]);
        $historico = $stmtHistorico->fetchAll(PDO::FETCH_ASSOC);

        // Se não houver histórico mas tiver peso inicial e atual, criar pontos
        if (empty($historico) && $dados['peso_inicial'] > 0 && $dados['peso_atual'] > 0) {
            $historico = [
                ['peso' => $dados['peso_inicial'], 'data_formatada' => 'Início'],
                ['peso' => $dados['peso_atual'], 'data_formatada' => 'Atual']
            ];
        }

        // Calcular se bateu a meta
        $bateu_meta = false;
        $valor_desejado = $dados['valor_desejado'];
        $peso_atual = $dados['peso_atual'];
        $meta = $dados['meta'];

        if ($valor_desejado && $peso_atual > 0) {
            if ($meta === 'perder' && $peso_atual <= $valor_desejado) {
                $bateu_meta = true;
            } elseif ($meta === 'ganhar' && $peso_atual >= $valor_desejado) {
                $bateu_meta = true;
            } elseif ($meta === 'manter' && abs($peso_atual - $valor_desejado) <= 1) {
                $bateu_meta = true;
            }
        }

        enviarSucesso(200, [
            "mensagem" => "Dados de progresso carregados com sucesso!",
            "meta" => $dados["meta"],
            "peso_inicial" => $dados["peso_inicial"],
            "imc_inicial" => $dados["imc_inicial"],
            "peso_atual" => $dados["peso_atual"],
            "imc_atual" => $dados["imc_atual"],
            "altura" => $dados["altura"],
            "historico" => $historico,
            "valor_desejado" => $dados["valor_desejado"],
            "bateu_meta" => $bateu_meta,
            "total_registros_peso" => (int)$dados["total_registros_peso"],
            "ultima_atualizacao" => $dados["ultima_atualizacao"]
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar dados: " . $e->getMessage());
    }
}

// =======================
// PUT: Atualizar progresso (peso e IMC)
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["peso"]) || $data["peso"] <= 0) {
        enviarErro(400, "Peso inválido. Não é permitido registrar peso igual a 0.");
    }

    try {
        $peso = floatval($data["peso"]);
        $usuarioId = (int)$usuario->id;

        // 1. Buscar dados do usuário
        $stmt = $pdo->prepare("SELECT altura, peso FROM usuarios WHERE id = :uid");
        $stmt->bindValue(':uid', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dadosUsuario || !$dadosUsuario['altura']) {
            enviarErro(404, "Altura não encontrada para o usuário.");
        }

        // 2. Buscar última data do histórico
        $stmt2 = $pdo->prepare("SELECT MAX(data_registro) as ultima_data FROM historico_peso WHERE usuario_id = :uid2");
        $stmt2->bindValue(':uid2', $usuarioId, PDO::PARAM_INT);
        $stmt2->execute();
        $resultadoData = $stmt2->fetch(PDO::FETCH_ASSOC);
        $ultimaDataRegistro = $resultadoData['ultima_data'] ?? null;

        // 3. Verificar se pode atualizar (7 dias)
        if ($ultimaDataRegistro) {
            $ultimaData = new DateTime($ultimaDataRegistro);
            $hoje = new DateTime();
            $diferenca = $hoje->diff($ultimaData)->days;

            if ($diferenca < 7) {
                $diasRestantes = 7 - $diferenca;
                enviarErro(400, "Você só pode atualizar seu peso uma vez por semana. Faltam {$diasRestantes} dia(s).");
            }
        }

        // 4. Validação de peso zero
        if ($dadosUsuario['peso'] > 0 && $peso == 0) {
            enviarErro(400, "Não é permitido registrar peso igual a 0 após já ter registrado um peso.");
        }

        // 5. Calcular IMC
        $alturaCm = floatval($dadosUsuario['altura']);
        $alturaM = $alturaCm / 100;
        $imc = ($alturaM > 0) ? ($peso / ($alturaM * $alturaM)) : null;

        // 6. Atualizar usuário
        $stmt3 = $pdo->prepare("
            UPDATE usuarios
            SET peso = :p,
                imc = :i,
                total_registros_peso = total_registros_peso + 1
            WHERE id = :uid3
        ");
        $stmt3->bindValue(':p', $peso, PDO::PARAM_STR);
        $stmt3->bindValue(':i', $imc, PDO::PARAM_STR);
        $stmt3->bindValue(':uid3', $usuarioId, PDO::PARAM_INT);
        $stmt3->execute();

        // 7. Inserir no histórico
        $stmt4 = $pdo->prepare("
            INSERT INTO historico_peso (usuario_id, peso, imc, data_registro)
            VALUES (:uid4, :p2, :i2, NOW())
        ");
        $stmt4->bindValue(':uid4', $usuarioId, PDO::PARAM_INT);
        $stmt4->bindValue(':p2', $peso, PDO::PARAM_STR);
        $stmt4->bindValue(':i2', $imc, PDO::PARAM_STR);
        $stmt4->execute();

        enviarSucesso(200, ["mensagem" => "Peso e IMC atualizados com sucesso!"]);
        
    } catch (PDOException $e) {
        error_log("ERRO PDO: " . $e->getMessage());
        error_log("TRACE: " . $e->getTraceAsString());
        enviarErro(500, "Erro ao atualizar progresso: " . $e->getMessage());
    }
}

// =======================
// PATCH: Alterar meta
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PATCH") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["tipo_meta"])) {
        enviarErro(400, "Tipo de meta é obrigatório");
    }

    try {
        $tipo_meta = $data["tipo_meta"];
        $valor_desejado = $data["valor_desejado"] ?? null;
        $usuarioId = (int)$usuario->id;

        // Buscar perguntas_id do usuário
        $stmt = $pdo->prepare("SELECT perguntas_id FROM usuarios WHERE id = :uid");
        $stmt->bindValue(':uid', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dadosUsuario || !$dadosUsuario['perguntas_id']) {
            enviarErro(404, "Usuário sem questionário preenchido");
        }

        // Atualizar meta
        $stmt2 = $pdo->prepare("
            UPDATE pergunta5_meta
            SET tipo_meta = :tm,
                valor_desejado = :vd
            WHERE perguntas_id = :pid
        ");
        $stmt2->bindValue(':tm', $tipo_meta, PDO::PARAM_STR);
        $stmt2->bindValue(':vd', $valor_desejado, PDO::PARAM_STR);
        $stmt2->bindValue(':pid', $dadosUsuario['perguntas_id'], PDO::PARAM_INT);
        $stmt2->execute();

        enviarSucesso(200, ["mensagem" => "Meta alterada com sucesso!"]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao alterar meta: " . $e->getMessage());
    }
}
?>