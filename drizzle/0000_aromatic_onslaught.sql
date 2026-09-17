CREATE TABLE `photo_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_photo_files_user_created` ON `photo_files` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `user_data` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
