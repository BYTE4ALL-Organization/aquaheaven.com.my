-- CreateTable
CREATE TABLE "media_config" (
    "id" TEXT NOT NULL,
    "imagekitUrlEndpoint" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_config_pkey" PRIMARY KEY ("id")
);
