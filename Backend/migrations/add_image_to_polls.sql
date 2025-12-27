-- Add image column to polls table
ALTER TABLE `polls` 
ADD COLUMN `image` LONGTEXT DEFAULT NULL AFTER `question`;








