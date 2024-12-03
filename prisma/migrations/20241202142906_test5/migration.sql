/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `usersecret` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `usersecret` DROP COLUMN `updatedAt`;
