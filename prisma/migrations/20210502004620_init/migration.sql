-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcardsSets" (
    "setId" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcardsSets" ("setId", "title", "description", "userId") SELECT "setId", "title", "description", "userId" FROM "flashcardsSets";
DROP TABLE "flashcardsSets";
ALTER TABLE "new_flashcardsSets" RENAME TO "flashcardsSets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
