/*
  Warnings:

  - You are about to drop the column `favoriteCount` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `articles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_articleId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_productId_fkey";

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "favoriteCount",
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "comments";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "product_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_comments_userId_idx" ON "product_comments"("userId");

-- CreateIndex
CREATE INDEX "product_comments_productId_createdAt_idx" ON "product_comments"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "article_comments_userId_idx" ON "article_comments"("userId");

-- CreateIndex
CREATE INDEX "article_comments_articleId_createdAt_idx" ON "article_comments"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "articles_userId_idx" ON "articles"("userId");

-- CreateIndex
CREATE INDEX "articles_createdAt_idx" ON "articles"("createdAt");

-- CreateIndex
CREATE INDEX "products_userId_idx" ON "products"("userId");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_comments" ADD CONSTRAINT "product_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_comments" ADD CONSTRAINT "product_comments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
