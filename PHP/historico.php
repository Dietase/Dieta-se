<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET"]);

$usuario = verificarToken($jwtSecretKey);

try {
    // 1. Buscar todas as refeições do usuário
    $stmt = $pdo->prepare("
        SELECT r.id AS refeicao_id, r.data_registro, r.tipo_refeicao, r.sintoma
        FROM refeicoes r
        WHERE r.usuario_id = :usuario_id
        ORDER BY r.data_registro DESC, r.id DESC
    ");
    $stmt->execute([":usuario_id" => $usuario->id]);
    $refeicoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Se não houver refeições, retornar sucesso com array vazio
    if (empty($refeicoes)) {
        enviarSucesso(200, [
            "mensagem" => "Nenhuma refeição encontrada",
            "refeicoes" => []
        ]);
        exit(); 
    }

    // 3. Buscar alimentos de cada refeição
    $ids = array_column($refeicoes, 'refeicao_id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmtAlimentos = $pdo->prepare("
        SELECT ra.refeicao_id, a.id, a.nome, a.energia_kcal, a.carboidrato_g, a.proteina_g, ra.gramas
        FROM refeicoes_alimentos ra
        JOIN alimentos a ON a.id = ra.alimento_id
        WHERE ra.refeicao_id IN ($placeholders)
    ");

    $stmtAlimentos->execute($ids);
    $alimentosPorRefeicao = $stmtAlimentos->fetchAll(PDO::FETCH_ASSOC);

    // 4. Agrupar alimentos por refeição
    $mapaAlimentos = [];
    foreach ($alimentosPorRefeicao as $alimento) {
        $id = $alimento["refeicao_id"];
        unset($alimento["refeicao_id"]);
        $mapaAlimentos[$id][] = $alimento;
    }

    // 5. Montar resposta final
    foreach ($refeicoes as &$refeicao) {
        $id = $refeicao["refeicao_id"];
        $refeicao["alimentos"] = $mapaAlimentos[$id] ?? [];
    }

    enviarSucesso(200, [
        "mensagem" => "Histórico de refeições carregado com sucesso!",
        "refeicoes" => $refeicoes
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao buscar histórico: " . $e->getMessage());
}
?>