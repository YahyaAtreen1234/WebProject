-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'StonesLand',
    "siteTagline" TEXT NOT NULL DEFAULT 'Premium Gems & Minerals',
    "logo" TEXT,
    "favicon" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#facc15',
    "backgroundColor" TEXT NOT NULL DEFAULT '#000000',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "facebookUrl" TEXT,
    "linkedinUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contact" ("createdAt", "email", "id", "message", "name", "phone", "read", "status", "subject", "updatedAt") SELECT "createdAt", "email", "id", "message", "name", "phone", "read", "status", "subject", "updatedAt" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE INDEX "Contact_read_idx" ON "Contact"("read");
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Contact_status_idx" ON "Contact"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_id_key" ON "SiteSettings"("id");
