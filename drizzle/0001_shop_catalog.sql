CREATE TABLE IF NOT EXISTS `categories` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `data` text NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `categories_slug_idx` ON `categories` (`slug`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `shapes` (
  `id` text PRIMARY KEY NOT NULL,
  `data` text NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  `active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `slug` text;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `active` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `products_slug_idx` ON `products` (`slug`);
