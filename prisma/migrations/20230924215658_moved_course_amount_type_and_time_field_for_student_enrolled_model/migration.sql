/*
  Warnings:

  - You are about to alter the column `amount` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Course` MODIFY `amount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `StudentEnrolled` ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
