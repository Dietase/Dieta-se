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

$usuario = verificarToken($jwtSecretKey);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    function gerarResumoNutricional($disturbios) {
        if (empty($disturbios)) {
            return [
                "restricoes" => [],
                "recomendados" => []
            ];
        }
        
        $disturbios = mb_strtolower($disturbios, 'UTF-8');
        $resumo = [
            "restricoes" => [],
            "recomendados" => []
        ];

        if (mb_stripos($disturbios, "celiac") !== false) {
            $resumo["restricoes"][] = "Pães, massas, alimentos com glúten";
            $resumo["recomendados"][] = "Carnes, ovos, azeites, castanhas";
        }
        if (mb_stripos($disturbios, "diabetes") !== false) {
            $resumo["restricoes"][] = "Açúcares, doces, massas refinadas";
            $resumo["recomendados"][] = "Alimentos com baixo índice glicêmico";
        }
        if (mb_stripos($disturbios, "hipertens") !== false) {
            $resumo["restricoes"][] = "Alimentos ricos em sódio, embutidos";
            $resumo["recomendados"][] = "Frutas, vegetais frescos";
        }
        if (mb_stripos($disturbios, "hipercolesterol") !== false) {
            $resumo["restricoes"][] = "Frituras, gorduras saturadas";
            $resumo["recomendados"][] = "Peixes, azeite de oliva, frutas";
        }
        if (mb_stripos($disturbios, "sii") !== false) {
            $resumo["restricoes"][] = "Laticínios, leguminosas";
            $resumo["recomendados"][] = "Carnes magras, arroz, cenoura";
        }

        return $resumo;
    }

    try {
        // 1. Buscar meta do usuário
        $stmtMeta = $pdo->prepare("
            SELECT m.tipo_meta, u.ordenacao_home
            FROM pergunta5_meta m
            JOIN perguntas p ON m.perguntas_id = p.id
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmtMeta->execute([":usuario_id" => $usuario->id]);
        $dadosMeta = $stmtMeta->fetch(PDO::FETCH_ASSOC);

        if (!$dadosMeta) {
            enviarErro(404, "Meta não encontrada para este usuário.");
        }

        // 1.1 Buscar distúrbios para gerar resumo nutricional
        $stmtDisturbios = $pdo->prepare("
            SELECT p.pergunta8_disturbios
            FROM perguntas p
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmtDisturbios->execute([":usuario_id" => $usuario->id]);
        $dadosDisturbios = $stmtDisturbios->fetch(PDO::FETCH_ASSOC);

        $resumo = gerarResumoNutricional($dadosDisturbios["pergunta8_disturbios"] ?? "");

        $ordenacaoHome = $dadosMeta['ordenacao_home'] ?? 'carboidrato_g';

        // 2. Buscar top 5 alimentos da dieta ordenados pela preferência do usuário
        $stmtTopAlimentos = $pdo->prepare("
            SELECT a.nome, a.energia_kcal, a.carboidrato_g, a.proteina_g, a.lipideos_g
            FROM alimentos a
            JOIN dieta d ON d.alimento_id = a.id
            WHERE d.usuario_id = :usuario_id
            ORDER BY CAST(a.$ordenacaoHome AS DECIMAL(10,2)) DESC
            LIMIT 5
        ");
        $stmtTopAlimentos->execute([":usuario_id" => $usuario->id]);
        $topAlimentos = $stmtTopAlimentos->fetchAll(PDO::FETCH_ASSOC);

        // Formatar os top alimentos com valor e unidade
        $topAlimentosFormatados = [];
        foreach ($topAlimentos as $alimento) {
            $valor = '';
            $unidade = '';
            
            switch ($ordenacaoHome) {
                case 'carboidrato_g':
                    $valor = $alimento['carboidrato_g'];
                    $unidade = 'g carb';
                    break;
                case 'proteina_g':
                    $valor = $alimento['proteina_g'];
                    $unidade = 'g prot';
                    break;
                case 'energia_kcal':
                    $valor = $alimento['energia_kcal'];
                    $unidade = 'kcal';
                    break;
                case 'lipideos_g':
                    $valor = $alimento['lipideos_g'];
                    $unidade = 'g gord';
                    break;
            }

            $topAlimentosFormatados[] = [
                'nome' => $alimento['nome'],
                'valor' => $valor,
                'unidade' => $unidade
            ];
        }

        // 3. Buscar dados do usuário para calcular calorias gastas
        $stmtUsuario = $pdo->prepare("
            SELECT u.peso, u.peso_inicial, u.altura, u.sexo_biologico, u.data_nascimento, p.pergunta4_nivel_atividade
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmtUsuario->execute([":usuario_id" => $usuario->id]);
        $infoUsuario = $stmtUsuario->fetch(PDO::FETCH_ASSOC);

        // Pegar passos e calorias ingeridas da tabela calorias
        $stmtCalorias = $pdo->prepare("
            SELECT passos, calorias_ingeridas
            FROM calorias
            WHERE usuario_id = :usuario_id AND data_registro = CURDATE()
        ");
        $stmtCalorias->execute([":usuario_id" => $usuario->id]);
        $dadosCalorias = $stmtCalorias->fetch(PDO::FETCH_ASSOC);

        $passos = $dadosCalorias ? intval($dadosCalorias["passos"]) : 0;
        $caloriasIngeridas = $dadosCalorias ? floatval($dadosCalorias["calorias_ingeridas"]) : 0;

        // Calcular calorias gastas com base no perfil do usuário (igual no calorias.php)
        $peso = floatval($infoUsuario["peso"] ?? $infoUsuario["peso_inicial"] ?? 0);
        $nivel = $infoUsuario["pergunta4_nivel_atividade"];

        $fatorPassos = match ($nivel) {
            "sedentario" => 0.0003,
            "baixo" => 0.0004,
            "medio" => 0.0005,
            "alto" => 0.0006,
            default => 0.0005
        };

        $caloriasGastas = round($passos * $peso * $fatorPassos, 2);
        $saldoCalorico = $caloriasIngeridas - $caloriasGastas;

        // 4. Buscar última refeição
        $stmtUltimaRefeicao = $pdo->prepare("
            SELECT r.id, r.tipo_refeicao, r.data_registro, r.sintoma
            FROM refeicoes r
            WHERE r.usuario_id = :usuario_id
            ORDER BY r.data_registro DESC, r.id DESC
            LIMIT 1
        ");
        $stmtUltimaRefeicao->execute([":usuario_id" => $usuario->id]);
        $ultimaRefeicao = $stmtUltimaRefeicao->fetch(PDO::FETCH_ASSOC);

        // 5. Buscar total de refeições de HOJE
        $dataHoje = date("Y-m-d");
        $stmtHoje = $pdo->prepare("
            SELECT 
                COUNT(DISTINCT r.id) as total_refeicoes,
                SUM(CAST(a.energia_kcal AS DECIMAL(6,2))) as calorias_total
            FROM refeicoes r
            JOIN refeicoes_alimentos ra ON r.id = ra.refeicao_id
            JOIN alimentos a ON a.id = ra.alimento_id
            WHERE r.usuario_id = :usuario_id 
            AND r.data_registro = :data
        ");
        $stmtHoje->execute([
            ":usuario_id" => $usuario->id,
            ":data" => $dataHoje
        ]);
        $refeicoesHoje = $stmtHoje->fetch(PDO::FETCH_ASSOC);

        // 6. Sugerir próxima refeição (respeita sequência, mas ajusta se horário avançou demais)
        $proximaRefeicao = 'Café da Manhã'; // padrão
        $horaAtual = (int)date('H');

        // Mapear tipo de refeição para nome legível
        $nomeRefeicoes = [
            'cafe' => 'Café da Manhã',
            'almoco' => 'Almoço',
            'lanche' => 'Lanche',
            'janta' => 'Jantar'
        ];

        // Ordem das refeições
        $sequenciaRefeicoes = ['cafe', 'almoco', 'lanche', 'janta'];

        // Determinar refeição apropriada pelo horário atual
        $refeicaoAtualPorHorario = 'janta'; 
        if ($horaAtual >= 6 && $horaAtual < 11) {
            $refeicaoAtualPorHorario = 'cafe';
        } elseif ($horaAtual >= 11 && $horaAtual < 15) {
            $refeicaoAtualPorHorario = 'almoco';
        } elseif ($horaAtual >= 15 && $horaAtual < 19) {
            $refeicaoAtualPorHorario = 'lanche';
        }

        if ($ultimaRefeicao) {
            $ultimoTipo = $ultimaRefeicao['tipo_refeicao'];
            
            // Determinar próxima refeição na sequência
            $indiceAtual = array_search($ultimoTipo, $sequenciaRefeicoes);
            $proximoIndice = ($indiceAtual + 1) % 4; // cicla de volta ao café
            $proximaLogica = $sequenciaRefeicoes[$proximoIndice];
            
            // Calcular quantas refeições de "distância" estão uma da outra
            $indiceProximaLogica = array_search($proximaLogica, $sequenciaRefeicoes);
            $indiceRefeicaoHorario = array_search($refeicaoAtualPorHorario, $sequenciaRefeicoes);
            
            // Se o horário "pulou" 2 ou mais refeições à frente, usar a refeição do horário
            $diferencaRefeicoes = ($indiceRefeicaoHorario - $indiceProximaLogica + 4) % 4;
            
            if ($diferencaRefeicoes >= 2) {
                // Pulou 2 ou mais refeições, usar horário atual
                $proximaRefeicao = $nomeRefeicoes[$refeicaoAtualPorHorario];
            } else {
                // Seguir sequência normal
                $proximaRefeicao = $nomeRefeicoes[$proximaLogica];
            }
        } else {
            // Sem refeição registrada, usar horário
            $proximaRefeicao = $nomeRefeicoes[$refeicaoAtualPorHorario];
        }

        $ultimaRefeicaoData = null;
        if ($ultimaRefeicao) {
            // Buscar alimentos da última refeição
            $stmtAlimentosRefeicao = $pdo->prepare("
                SELECT a.id, a.nome, a.energia_kcal
                FROM alimentos a
                JOIN refeicoes_alimentos ra ON ra.alimento_id = a.id
                WHERE ra.refeicao_id = :refeicao_id
            ");
            $stmtAlimentosRefeicao->execute([":refeicao_id" => $ultimaRefeicao['id']]);
            $alimentosRefeicao = $stmtAlimentosRefeicao->fetchAll(PDO::FETCH_ASSOC);

            // Calcular total de calorias
            $totalCalorias = 0;
            foreach ($alimentosRefeicao as $alimento) {
                $totalCalorias += floatval($alimento['energia_kcal']);
            }

            $ultimaRefeicaoData = [
                'tipo' => $ultimaRefeicao['tipo_refeicao'],
                'data' => $ultimaRefeicao['data_registro'],
                'sintoma' => $ultimaRefeicao['sintoma'],
                'alimentos' => $alimentosRefeicao,
                'total_calorias' => $totalCalorias
            ];
        }

        // 7. Buscar últimos 5 registros de peso para o gráfico
        $stmtProgresso = $pdo->prepare("
            SELECT peso, data_registro, DATE_FORMAT(data_registro, '%d/%m') as data_formatada
            FROM historico_peso
            WHERE usuario_id = :usuario_id
            ORDER BY data_registro DESC
            LIMIT 5
        ");
        $stmtProgresso->execute([":usuario_id" => $usuario->id]);
        $historicoProgresso = $stmtProgresso->fetchAll(PDO::FETCH_ASSOC);

        // Inverter ordem para mostrar do mais antigo ao mais recente
        $historicoProgresso = array_reverse($historicoProgresso);

        // 8. Montar resposta final
        enviarSucesso(200, [
            "mensagem" => "Dados da tela inicial carregados com sucesso!",
            "dieta" => [
                "meta" => $dadosMeta["tipo_meta"] ?? null,
                "top_alimentos" => $topAlimentosFormatados,
                "restricoes" => $resumo["restricoes"],
                "recomendados" => $resumo["recomendados"]
            ],
            "atividade" => [
                "passos" => $passos,  
                "calorias_gastas" => $caloriasGastas,  
                "calorias_ingeridas" => $caloriasIngeridas,  
                "saldo_calorico" => $saldoCalorico  
            ],
            "refeicoes_hoje" => [
                "total" => (int)($refeicoesHoje["total_refeicoes"] ?? 0),
                "calorias_total" => (float)($refeicoesHoje["calorias_total"] ?? 0)
            ],
            "proxima_refeicao" => $proximaRefeicao,
            "ultima_refeicao" => $ultimaRefeicaoData,
            "progresso" => $historicoProgresso
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar dados da tela inicial: " . $e->getMessage());
    }
}
?>