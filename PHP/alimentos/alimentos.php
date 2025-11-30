<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');
require_once(__DIR__ . DIRECTORY_SEPARATOR . 'alimentos_filtros.php');

permitirMetodos(["GET"]);
$usuario = verificarToken($jwtSecretKey);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        // 1. Buscar dieta e distúrbios do usuário
        $stmt = $pdo->prepare("
            SELECT p.pergunta6_tipo_dieta, p.pergunta8_disturbios
            FROM perguntas p
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmt->execute([":usuario_id" => $usuario->id]);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            enviarErro(404, "Dados de dieta e distúrbios não encontrados.");
        }

        $tipoDieta = strtolower($dados["pergunta6_tipo_dieta"]);
        $disturbios = strtolower($dados["pergunta8_disturbios"]);

        // 2. Aplicar filtros combinados
        $condicoes = aplicarFiltros($tipoDieta, $disturbios);
        $where = count($condicoes) ? "WHERE " . implode(" AND ", $condicoes) : "";

        // 3. Buscar alimentos permitidos
        $query = "SELECT id, nome, categoria, energia_kcal, carboidrato_g, proteina_g, lipideos_g FROM alimentos $where ORDER BY nome ASC";
        $stmt = $pdo->query($query);
        $alimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Salvar alimentos permitidos na tabela alimentos_permitidos
        $stmtInsert = $pdo->prepare("
            INSERT IGNORE INTO alimentos_permitidos (usuario_id, alimento_id)
            VALUES (:usuario_id, :alimento_id)
        ");

        foreach ($alimentos as $alimento) {
            $stmtInsert->execute([
                ":usuario_id" => $usuario->id,
                ":alimento_id" => $alimento["id"]
            ]);
        }

        enviarSucesso(201, [
            "mensagem" => "Alimentos filtrados com sucesso!",
            "total_alimentos" => count($alimentos),
            "alimentos" => $alimentos
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar alimentos: " . $e->getMessage());
    }
}
?>