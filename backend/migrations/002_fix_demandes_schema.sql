ALTER TABLE `demandes_techniciens`
  CHANGE COLUMN `nom` `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  ADD COLUMN `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER `nom`,
  ADD COLUMN `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' AFTER `prenom`,
  ADD COLUMN `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `email`;
