ALTER TABLE `refresh_tokens`
  ADD COLUMN `family_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `expires_at`;

CREATE INDEX `idx_family_id` ON `refresh_tokens` (`family_id`);
