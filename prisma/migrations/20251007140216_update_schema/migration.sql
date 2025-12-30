-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('FOUR_SEATER', 'EIGHT_SEATER');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "password" TEXT,
ALTER COLUMN "mobile" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."fares" (
    "id" TEXT NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "vehicleType" "public"."VehicleType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fares_fromLocation_toLocation_vehicleType_key" ON "public"."fares"("fromLocation", "toLocation", "vehicleType");
