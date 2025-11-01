/*
  Warnings:

  - Added the required column `clientBid` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Billboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "clientBid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Billboard" ADD COLUMN     "type" TEXT NOT NULL;
