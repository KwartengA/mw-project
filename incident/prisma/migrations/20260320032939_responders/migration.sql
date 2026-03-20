-- CreateEnum
CREATE TYPE "ResponderType" AS ENUM ('ambulance', 'fire', 'police', 'ems');

-- CreateEnum
CREATE TYPE "ResponderStatus" AS ENUM ('available', 'dispatched', 'off_duty');

-- CreateTable
CREATE TABLE "Responder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResponderType" NOT NULL,
    "status" "ResponderStatus" NOT NULL DEFAULT 'available',
    "location" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Responder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "totalBeds" INTEGER NOT NULL DEFAULT 0,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "totalAmbulances" INTEGER NOT NULL DEFAULT 0,
    "availableAmbulances" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Responder_status_idx" ON "Responder"("status");
