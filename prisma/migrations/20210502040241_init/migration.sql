/*
  Warnings:

  - You are about to alter the column `flashcardsSetId` on the `flashcards` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `flashcardsSets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `setId` on the `flashcardsSets` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcards" (
    "flashcardId" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "flashcardsSetId" INTEGER NOT NULL,
    FOREIGN KEY ("flashcardsSetId") REFERENCES "flashcardsSets" ("setId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcards" ("flashcardId", "term", "definition", "flashcardsSetId") SELECT "flashcardId", "term", "definition", "flashcardsSetId" FROM "flashcards";
DROP TABLE "flashcards";
ALTER TABLE "new_flashcards" RENAME TO "flashcards";
CREATE TABLE "new_flashcardsSets" (
    "setId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcardsSets" ("setId", "title", "description", "userId") SELECT "setId", "title", "description", "userId" FROM "flashcardsSets";
DROP TABLE "flashcardsSets";
ALTER TABLE "new_flashcardsSets" RENAME TO "flashcardsSets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
