-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "nameAz" TEXT,
ADD COLUMN     "nameRu" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "descriptionAz" TEXT,
ADD COLUMN     "descriptionRu" TEXT,
ADD COLUMN     "subtitleAz" TEXT,
ADD COLUMN     "subtitleRu" TEXT,
ADD COLUMN     "titleAz" TEXT,
ADD COLUMN     "titleRu" TEXT;
