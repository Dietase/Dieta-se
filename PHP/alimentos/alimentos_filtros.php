<?php
function aplicarFiltros($tipoDieta, $disturbios) {
    $condicoes = [];
    
    // Verificação de distúrbios 
    $listaDisturbios = ['celíaca', 'diabetes', 'hipercolesterolemia', 'hipertensão', 'sii', 'intolerancia_lactose'];
    $countDisturbios = 0;
    
    if (!empty($disturbios)) {
        foreach ($listaDisturbios as $d) {
            if (str_contains($disturbios, $d)) {
                $countDisturbios++;
            }
        }
    }
    
    // Se tem 3+ distúrbios, usa modo ADAPTATIVO (filtros mais leves)
    $modoAdaptativo = ($countDisturbios >= 3);

    // FILTROS MAIS FLEXÍVEIS
    $filtros = [
        "carboidrato_baixo" => $modoAdaptativo 
        ? "CAST(carboidrato_g AS DECIMAL) <= 90"  // ← AUMENTAR de 80 para 90
        : "CAST(carboidrato_g AS DECIMAL) <= 60", // ← AUMENTAR de 50 para 60
        
    "energia_baixa" => $modoAdaptativo
        ? "CAST(energia_kcal AS DECIMAL) <= 450" // ← AUMENTAR de 400 para 450
        : "CAST(energia_kcal AS DECIMAL) <= 300", // ← AUMENTAR de 250 para 300
        
    "lipideos_baixos" => $modoAdaptativo
        ? "CAST(lipideos_g AS DECIMAL) <= 18"   // ← AUMENTAR de 15 para 18
        : "CAST(lipideos_g AS DECIMAL) <= 12",   // ← AUMENTAR de 10 para 12
        
        "carboidrato_muito_baixo" => "CAST(carboidrato_g AS DECIMAL) <= 30",
        "lipideos_altos" => "CAST(lipideos_g AS DECIMAL) >= 10",
        "sodio_baixo" => "CAST(sodio_mg AS DECIMAL) <= 300",
        "fibra_alta" => "CAST(fibra_g AS DECIMAL) >= 1.5",
        "proteina_alta" => "CAST(proteina_g AS DECIMAL) >= 8",
        "excluir_frito" => "nome NOT LIKE '%frito%'",
        
        "excluir_gluten" => [
            "nome NOT LIKE '%trigo%'",
            "nome NOT LIKE '%centeio%'",
            "nome NOT LIKE '%cevada%'",
            "nome NOT LIKE '%glúten%'",
        ],
        "excluir_acucar" => [
            "nome NOT LIKE '%açúcar%'",
            "nome NOT LIKE '%recheado%'",
            "nome NOT LIKE '%xarope%'",
        ],
        "excluir_embutidos" => [
            "nome NOT LIKE '%linguiça%'",
            "nome NOT LIKE '%presunto%'",
            "nome NOT LIKE '%mortadela%'",
            "nome NOT LIKE '%bacon%'",
            "nome NOT LIKE '%salame%'"
        ],
        "excluir_estimulantes" => [
            "nome NOT LIKE '%refrigerante%'"
        ],
        "excluir_lactose" => [
                "nome NOT LIKE '%leite%'",
                "nome NOT LIKE '%queijo%'",
                "nome NOT LIKE '%iogurte%'",
                "nome NOT LIKE '%manteiga%'",
                "nome NOT LIKE '%creme de leite%'",
                "nome NOT LIKE '%requeijão%'",
                "nome NOT LIKE '%sorvete%'"
            ]
        ];

    // FILTROS POR DIETA
    if (!empty($tipoDieta)) {
        switch ($tipoDieta) {
            case "low_carb":
                $condicoes[] = $filtros["carboidrato_baixo"];
                break;
                
            case "cetogenica":
                $condicoes[] = $filtros["carboidrato_muito_baixo"];
                $condicoes[] = $filtros["lipideos_altos"];
                break;
                
            case "mediterranea":
                $condicoes[] = $filtros["lipideos_baixos"];
                $condicoes[] = $filtros["excluir_frito"];
                break;
                
            case "vegana":
                $condicoes[] = "nome NOT LIKE '%carne%'";
                $condicoes[] = "nome NOT LIKE '%frango%'";
                $condicoes[] = "nome NOT LIKE '%peixe%'";
                $condicoes[] = "nome NOT LIKE '%ovo%'";
                $condicoes[] = "nome NOT LIKE '%leite%'";
                break;
                
            case "vegetariana":
                $condicoes[] = "nome NOT LIKE '%carne%'";
                $condicoes[] = "nome NOT LIKE '%frango%'";
                $condicoes[] = "nome NOT LIKE '%peixe%'";
                break;
                
            case "paleolitica":
                $condicoes[] = "nome NOT LIKE '%farinha refinada%'";
                break;
                
            case "dieta_das_zonas":
                $condicoes[] = $filtros["carboidrato_baixo"];
                $condicoes[] = $filtros["proteina_alta"];
                break;
        }
    }

    // FILTROS POR DISTÚRBIOS (MAIS FLEXÍVEIS)
    if (!empty($disturbios)) {
        if (str_contains($disturbios, "celíaca")) {
            $condicoes = array_merge($condicoes, $filtros["excluir_gluten"]);
        }
        
        if (str_contains($disturbios, "diabetes")) {
            $condicoes[] = $filtros["carboidrato_baixo"];
            $condicoes[] = $filtros["fibra_alta"];
            $condicoes = array_merge($condicoes, $filtros["excluir_acucar"]);
            $condicoes[] = $filtros["excluir_frito"];
        }
        
        if (str_contains($disturbios, "hipercolesterolemia")) {
            $condicoes[] = $filtros["lipideos_baixos"];
            $condicoes[] = $filtros["excluir_frito"];
            $condicoes = array_merge($condicoes, $filtros["excluir_embutidos"]);
        }
        
        if (str_contains($disturbios, "hipertensão")) {
            $condicoes[] = $filtros["sodio_baixo"];
            $condicoes[] = $filtros["excluir_frito"];
            $condicoes = array_merge($condicoes, $filtros["excluir_embutidos"]);
        }
        
        if (str_contains($disturbios, "sii")) {
            $condicoes = array_merge($condicoes, $filtros["excluir_estimulantes"]);
            $condicoes[] = $filtros["excluir_frito"];
        }

        if (str_contains($disturbios, "intolerancia_lactose")) {
            $condicoes = array_merge($condicoes, $filtros["excluir_lactose"]);
        }
    }
    
    return $condicoes;
}
?>