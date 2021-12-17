DROP TABLE IF EXISTS `inscriptions`;
DROP TABLE IF EXISTS `membership_prices`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `memberships`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `full_name` text ,
  `first_name` text ,
  `second_name` text ,
  `first_lastname` text ,
  `second_lastname` text ,
  `password` text ,
  `email` varchar(200)  DEFAULT NULL,
  `phone` text ,
  `status` int NOT NULL DEFAULT '1',
  `completed` int DEFAULT '0',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator` int DEFAULT NULL,
  `editor` int DEFAULT NULL,
  `role` int NOT NULL DEFAULT 2,
  UNIQUE KEY `unique_email` (`email`),
  KEY `creator` (`creator`),
  KEY `editor` (`editor`),
  CONSTRAINT  FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`editor`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `clients` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `doc_type` text ,
  `doc_number` text ,
  `first_name` text ,
  `second_name` text ,
  `first_lastname` text ,
  `second_lastname` text ,
  `email` varchar(200)  DEFAULT NULL,
  `phone` text ,
  `gender` text ,
  `birthdate` date,
  `status` int NOT NULL DEFAULT '1',
  `completed` int DEFAULT '0',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator` int DEFAULT NULL,
  `editor` int DEFAULT NULL,
  UNIQUE KEY `unique_doc_type_number` (`doc_type`,`doc_number`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `creator` (`creator`),
  KEY `editor` (`editor`),
  CONSTRAINT  FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`editor`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `memberships` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` text ,
  `description` text ,
  `access_days` int NOT NULL,
  `personalized_days` int DEFAULT 0,
  `price` double NOT NULL DEFAULT 0,
  `status` int NOT NULL DEFAULT '1',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator` int DEFAULT NULL,
  `editor` int DEFAULT NULL,
  KEY `creator` (`creator`),
  KEY `editor` (`editor`),
  CONSTRAINT  FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`editor`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `inscriptions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `client` int NOT NULL,
  `membership` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` int NOT NULL DEFAULT '1',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator` int DEFAULT NULL,
  `editor` int DEFAULT NULL,
  KEY `creator` (`creator`),
  KEY `editor` (`editor`),
  KEY `client` (`client`),
  KEY `membership` (`membership`),
  CONSTRAINT  FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`editor`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`client`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`membership`) REFERENCES `memberships` (`id`) ON UPDATE CASCADE  
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci  ;

-- Consultar días restantes del cliente
-- SELECT DATEDIFF(i.end_date, now()) as remaining_days FROM inscriptions i INNER JOIN clients c ON i.client = c.id WHERE c.doc_number = '1234567890';

CREATE TABLE IF NOT EXISTS `client_auth` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `client` int NOT NULL,
  `inscription` int NOT NULL,
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator` int DEFAULT NULL,
  `editor` int DEFAULT NULL,
  KEY `creator` (`creator`),
  KEY `editor` (`editor`),
   KEY `client` (`client`),
  KEY `inscription` (`inscription`),
  CONSTRAINT  FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`editor`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`client`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT  FOREIGN KEY (`inscription`) REFERENCES `inscriptions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci  ;