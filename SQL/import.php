<?php
// import.php - Versão InfinityFree
set_time_limit(300); // 5 minutos para importar

require_once(__DIR__ . '/../PHP/config/config.php');

$arquivo = __DIR__ . '/tabela_alimentos.csv';

if (!file_exists($arquivo)) {
    die("❌ Arquivo CSV não encontrado em: " . $arquivo);
}

echo "📂 Arquivo encontrado! Iniciando importação...<br><br>";

// Função para tratar valores
function trata($valor) {
    $valor = trim($valor);
    if ($valor === '' || strtoupper($valor) === 'NA' || strtoupper($valor) === 'TR') {
        return null;
    }
    return str_replace(',', '.', $valor);
}

$csv = fopen($arquivo, 'r');
$header = fgetcsv($csv, 0, ';'); // Lê o cabeçalho

$contador = 0;
$erros = 0;

while (($linha = fgetcsv($csv, 0, ';')) !== false) {
    if (count($linha) < 28) {
        echo "⚠️ Linha ignorada (colunas insuficientes)<br>";
        continue;
    }

    array_shift($linha); // Ignora a primeira coluna (ID do CSV)

    list(
        $nome, $categoria, $umidade_porcentagem, $energia_kcal, $proteina_g, $lipideos_g, $colesterol_g,
        $carboidrato_g, $fibra_g, $cinzas_g, $calcio_g, $magnesio_g, $manganes_mg, $fosforo_mg,
        $ferro_mg, $sodio_mg, $potassio_mg, $cobre_mg, $zinco_mg, $retinol_mcg, $re_mcg, $rae_mcg,
        $tiamina_mg, $riboflavina_mg, $piridoxina_mg, $niacina_mg, $vitamina_c_mg
    ) = $linha;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO alimentos (
                nome, categoria, umidade_porcentagem, energia_kcal, proteina_g, lipideos_g, colesterol_g,
                carboidrato_g, fibra_g, cinzas_g, calcio_g, magnesio_g, manganes_mg, fosforo_mg,
                ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg, retinol_mcg, re_mcg, rae_mcg,
                tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            trata($nome), trata($categoria), trata($umidade_porcentagem), trata($energia_kcal), 
            trata($proteina_g), trata($lipideos_g), trata($colesterol_g), trata($carboidrato_g), 
            trata($fibra_g), trata($cinzas_g), trata($calcio_g), trata($magnesio_g), 
            trata($manganes_mg), trata($fosforo_mg), trata($ferro_mg), trata($sodio_mg), 
            trata($potassio_mg), trata($cobre_mg), trata($zinco_mg), trata($retinol_mcg),
            trata($re_mcg), trata($rae_mcg), trata($tiamina_mg), trata($riboflavina_mg), 
            trata($piridoxina_mg), trata($niacina_mg), trata($vitamina_c_mg)
        ]);
        
        $contador++;
        
        // Mostra progresso a cada 50 itens
        if ($contador % 50 === 0) {
            echo "✅ $contador alimentos importados...<br>";
            flush();
            ob_flush();
        }
        
    } catch (PDOException $e) {
        $erros++;
        echo "❌ Erro ao importar '$nome': " . $e->getMessage() . "<br>";
    }
}

fclose($csv);

echo "<br><br>";
echo "🎉 <strong>Importação concluída!</strong><br>";
echo "✅ Total importado: $contador alimentos<br>";
echo "❌ Erros: $erros<br>";
echo "<br>";
echo "⚠️ <strong>IMPORTANTE:</strong> Delete este arquivo (import.php) e o CSV agora por segurança!";
?>