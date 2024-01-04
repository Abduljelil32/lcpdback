/*
  Warnings:

  - You are about to drop the `StuentEnrolled` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `StuentEnrolled` DROP FOREIGN KEY `StuentEnrolled_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `StuentEnrolled` DROP FOREIGN KEY `StuentEnrolled_studentId_fkey`;

-- DropTable
DROP TABLE `StuentEnrolled`;

-- CreateTable
CREATE TABLE `StudentEnrolled` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL DEFAULT '',
    `trxref` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentEnrolled` ADD CONSTRAINT `StudentEnrolled_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentEnrolled` ADD CONSTRAINT `StudentEnrolled_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
