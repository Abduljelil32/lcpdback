/*
  Warnings:

  - You are about to alter the column `note` on the `CourseOutline` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10000)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `CourseOutline` ADD COLUMN `customNote` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `note_id` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `videoLink` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `note` VARCHAR(191) NULL DEFAULT '';
