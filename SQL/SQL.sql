CREATE DATABASE IF NOT EXISTS `dietase_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `dietase_db`;

DROP TABLE IF EXISTS `alimentos`;
CREATE TABLE `alimentos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `umidade_porcentagem` varchar(255) DEFAULT NULL,
  `energia_kcal` varchar(255) DEFAULT NULL,
  `proteina_g` varchar(255) DEFAULT NULL,
  `lipideos_g` varchar(255) DEFAULT NULL,
  `colesterol_g` varchar(255) DEFAULT NULL,
  `carboidrato_g` varchar(255) DEFAULT NULL,
  `fibra_g` varchar(255) DEFAULT NULL,
  `cinzas_g` varchar(255) DEFAULT NULL,
  `calcio_g` varchar(255) DEFAULT NULL,
  `magnesio_g` varchar(255) DEFAULT NULL,
  `manganes_mg` varchar(255) DEFAULT NULL,
  `fosforo_mg` varchar(255) DEFAULT NULL,
  `ferro_mg` varchar(255) DEFAULT NULL,
  `sodio_mg` varchar(255) DEFAULT NULL,
  `potassio_mg` varchar(255) DEFAULT NULL,
  `cobre_mg` varchar(255) DEFAULT NULL,
  `zinco_mg` varchar(255) DEFAULT NULL,
  `retinol_mcg` varchar(255) DEFAULT NULL,
  `re_mcg` varchar(255) DEFAULT NULL,
  `rae_mcg` varchar(255) DEFAULT NULL,
  `tiamina_mg` varchar(255) DEFAULT NULL,
  `riboflavina_mg` varchar(255) DEFAULT NULL,
  `piridoxina_mg` varchar(255) DEFAULT NULL,
  `niacina_mg` varchar(255) DEFAULT NULL,
  `vitamina_c_mg` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `alimentos_permitidos`;
CREATE TABLE `alimentos_permitidos` (
  `usuario_id` bigint NOT NULL,
  `alimento_id` bigint NOT NULL,
  PRIMARY KEY (`usuario_id`,`alimento_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `alimentos_permitidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alimentos_permitidos_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `calorias`;
CREATE TABLE `calorias` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `data_registro` date NOT NULL,
  `passos` int DEFAULT '0',
  `calorias_gastas` decimal(6,2) DEFAULT '0.00',
  `calorias_ingeridas` decimal(6,2) DEFAULT '0.00',
  `saldo_calorico` decimal(6,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_calorias_usuario_data` (`usuario_id`,`data_registro`),
  KEY `idx_calorias_data` (`data_registro`),
  CONSTRAINT `calorias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `dieta`;
CREATE TABLE `dieta` (
  `usuario_id` bigint NOT NULL,
  `alimento_id` bigint NOT NULL,
  PRIMARY KEY (`usuario_id`,`alimento_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `dieta_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dieta_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `historico_peso`;
CREATE TABLE `historico_peso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `peso` decimal(4,1) NOT NULL,
  `imc` decimal(4,1) NOT NULL,
  `data_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `historico_peso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `pergunta5_meta`;
CREATE TABLE `pergunta5_meta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `perguntas_id` bigint NOT NULL,
  `tipo_meta` enum('perder','ganhar','manter','massa') NOT NULL,
  `valor_desejado` decimal(4,1) DEFAULT NULL,
  `faixa_recomendada` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `perguntas_id` (`perguntas_id`),
  CONSTRAINT `pergunta5_meta_ibfk_1` FOREIGN KEY (`perguntas_id`) REFERENCES `perguntas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `perguntas`;
CREATE TABLE `perguntas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pergunta1_objetivo` enum('perder','ganhar','manter','massa') NOT NULL,
  `pergunta2_contagem_calorica` enum('sim','nao') NOT NULL,
  `pergunta3_jejum_intermitente` enum('sim','nao') NOT NULL,
  `pergunta4_nivel_atividade` enum('sedentario','baixo','medio','alto') NOT NULL,
  `pergunta6_tipo_dieta` enum('low_carb','cetogenica','mediterranea','vegana','vegetariana','paleolitica','dieta_das_zonas','nenhuma') DEFAULT NULL,
  `pergunta7_comer_fds` enum('sim','nao') NOT NULL,
  `pergunta8_disturbios` varchar(400) NOT NULL,
  `pergunta9_possui_dieta` enum('sim','nao') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `refeicoes`;
CREATE TABLE `refeicoes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `data_registro` date NOT NULL,
  `tipo_refeicao` enum('cafe','almoco','janta','lanche') NOT NULL,
  `sintoma` enum('nenhum','azia','enjoo','diarreia','dor_estomago') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `refeicoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `refeicoes_alimentos`;
CREATE TABLE `refeicoes_alimentos` (
  `refeicao_id` bigint NOT NULL,
  `alimento_id` bigint NOT NULL,
  PRIMARY KEY (`refeicao_id`,`alimento_id`),
  KEY `alimento_id` (`alimento_id`),
  CONSTRAINT `refeicoes_alimentos_ibfk_1` FOREIGN KEY (`refeicao_id`) REFERENCES `refeicoes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `refeicoes_alimentos_ibfk_2` FOREIGN KEY (`alimento_id`) REFERENCES `alimentos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nome` varchar(40) NOT NULL,
  `email` varchar(40) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `sexo_biologico` enum('m','f') DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `altura` tinyint unsigned DEFAULT NULL,
  `peso_inicial` decimal(4,1) DEFAULT NULL,
  `imc_inicial` decimal(4,1) DEFAULT NULL,
  `peso` decimal(4,1) DEFAULT NULL,
  `imc` decimal(4,1) DEFAULT NULL,
  `ordenacao_home` varchar(50) DEFAULT 'carboidrato_g',
  `total_registros_peso` int DEFAULT '0',
  `jejum_ativo` tinyint(1) DEFAULT NULL,
  `perguntas_id` bigint DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `termos_aceitos` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `perguntas_id` (`perguntas_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`perguntas_id`) REFERENCES `perguntas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;