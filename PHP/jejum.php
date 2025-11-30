<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT"]);

$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Verifica se jejum está ativo
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT u.jejum_ativo, p.pergunta3_jejum_intermitente
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmt->execute([":id" => $usuario->id]);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            enviarErro(404, "Usuário não encontrado.");
        }

        // Lógica de ativação do jejum
        $jejumAtivo = match (true) {
            $dados["jejum_ativo"] === null => $dados["pergunta3_jejum_intermitente"] === "sim",
            default => boolval($dados["jejum_ativo"])
        };

        enviarSucesso(200, [
            "mensagem" => "Status do jejum carregado com sucesso!",
            "usuario_id" => $usuario->id,
            "jejum_ativo" => $jejumAtivo
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao verificar jejum: " . $e->getMessage());
    }
}

// =======================
// PUT: Atualiza jejum manualmente
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);
    $ativar = isset($data["jejum_ativo"]) ? (int) $data["jejum_ativo"] : null;

    if (!in_array($ativar, [0, 1], true)) {
        enviarErro(400, "Valor inválido para jejum_ativo.");
    }

    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET jejum_ativo = :ativo WHERE id = :id");
        $stmt->execute([
            ":ativo" => $ativar,
            ":id" => $usuario->id
        ]);

        // Buscar dados atualizados
        $stmtGet = $pdo->prepare("
            SELECT u.jejum_ativo, p.pergunta3_jejum_intermitente, u.nome
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmtGet->execute([":id" => $usuario->id]);
        $dados = $stmtGet->fetch(PDO::FETCH_ASSOC);

        enviarSucesso(200, [
            "mensagem" => "Jejum " . ($ativar ? "ativado" : "desativado") . " com sucesso!",
            "usuario" => $dados["nome"],
            "jejum_ativo" => boolval($dados["jejum_ativo"])
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao atualizar jejum: " . $e->getMessage());
    }
}
?>