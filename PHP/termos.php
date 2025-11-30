<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["PUT"]);

$usuario = verificarToken($jwtSecretKey);

try {
    $stmt = $pdo->prepare("UPDATE usuarios SET termos_aceitos = 1 WHERE id = :id");
    $stmt->execute([":id" => $usuario->id]);

    enviarSucesso(200, [
    "mensagem" => "Termos aceitos com sucesso!",
        "termos_aceitos" => true
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao aceitar termos: " . $e->getMessage());
}
?>