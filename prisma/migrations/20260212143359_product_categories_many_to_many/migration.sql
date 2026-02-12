-- CreateTable
CREATE TABLE "product_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

-- Migrate existing product.categoryId into product_categories
INSERT INTO "product_categories" ("productId", "categoryId")
SELECT "id", "categoryId" FROM "products" WHERE "categoryId" IS NOT NULL;

-- AddForeignKey (must be before dropping column so referenced column exists)
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropColumn
ALTER TABLE "products" DROP COLUMN "categoryId";
