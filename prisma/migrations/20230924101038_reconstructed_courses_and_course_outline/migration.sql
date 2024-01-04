/*
  Warnings:

  - You are about to drop the `CourseOutlineItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CourseOutlineItem` DROP FOREIGN KEY `CourseOutlineItem_courseOutlineId_fkey`;

-- AlterTable
ALTER TABLE `Course` ADD COLUMN `image` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `image_id` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `CourseOutline` ADD COLUMN `note` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `video` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `video_id` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `CourseOutlineItem`;
