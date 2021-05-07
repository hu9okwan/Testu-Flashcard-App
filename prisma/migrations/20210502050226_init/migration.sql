-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcardsSets" (
    "setId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcardsSets" ("setId", "title", "description", "tags", "userId") SELECT "setId", "title", "description", "tags", "userId" FROM "flashcardsSets";
DROP TABLE "flashcardsSets";
ALTER TABLE "new_flashcardsSets" RENAME TO "flashcardsSets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
