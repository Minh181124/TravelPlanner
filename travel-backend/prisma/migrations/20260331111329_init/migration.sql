/*
  Warnings:

  - You are about to alter the column `google_place_id` on the `diadiem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `ten` on the `diadiem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "diadiem" ALTER COLUMN "google_place_id" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "ten" SET DATA TYPE VARCHAR(255);
