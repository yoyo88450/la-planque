/*
  Warnings:

  - You are about to drop the column `spotifyAccessToken` on the `Settings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artistsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "boutiqueEnabled" BOOLEAN NOT NULL DEFAULT true,
    "spotifyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "spotifyRefreshToken" TEXT,
    "spotifyPlaylistId" TEXT,
    "spotifyClientId" TEXT,
    "spotifyClientSecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("artistsEnabled", "boutiqueEnabled", "createdAt", "id", "spotifyClientId", "spotifyClientSecret", "spotifyEnabled", "spotifyPlaylistId", "spotifyRefreshToken", "updatedAt") SELECT "artistsEnabled", "boutiqueEnabled", "createdAt", "id", "spotifyClientId", "spotifyClientSecret", "spotifyEnabled", "spotifyPlaylistId", "spotifyRefreshToken", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
