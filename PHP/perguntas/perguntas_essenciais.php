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

// Validação básica
$peso = floatval($data["peso"] ?? 0);
$altura = floatval($data["altura"] ?? 0); 

if ($peso <= 0 || $altura <= 0) {
    enviarErro(400, "Peso ou altura inválidos para cálculo de IMC.");
}

// Cálculo do IMC
$alturaMetros = $altura / 100;
$imc = ($alturaMetros > 0) ? $peso / ($alturaMetros * $alturaMetros) : null;

// =======================
// POST: salva informações essenciais no banco de dados
// =======================
try {
    $stmt = $pdo->prepare("
        UPDATE usuarios SET
            sexo_biologico = :sexo,
            data_nascimento = :nascimento,
            altura = :altura,
            peso_inicial = :peso,
            imc_inicial = :imc
        WHERE id = :id
    ");

    $stmt->bindParam(":sexo", $data["sexo_biologico"]);
    $stmt->bindParam(":nascimento", $data["data_nascimento"]);
    $stmt->bindParam(":altura", $data["altura"]);
    $stmt->bindParam(":peso", $data["peso"]);
    $stmt->bindParam(":imc", $imc);
    $stmt->bindParam(":id", $usuario->id);

    $stmt->execute();

    enviarSucesso(201, [
    "mensagem" => "Informações essenciais salvas com sucesso!",
    "dados_salvos" => [
        "sexo_biologico" => $data["sexo_biologico"],
        "data_nascimento" => $data["data_nascimento"],
        "altura" => $data["altura"],
        "peso_inicial" => $data["peso"],
        "imc_inicial" => $imc
    ]
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao salvar informações essenciais: " . $e->getMessage());
}
?>