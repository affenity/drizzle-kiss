import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const User = pgTable(
    "User",
    {
        oldNames: text("oldNames")
            .array(),
        id: text("id")
            .primaryKey(),
        settingsId: text("settingsId")
            .references(() => UserSettings.id)
    }
);

export const _UserRelations = relations(
    User,
    r => ({
        settings: r.one(UserSettings)
    })
);

export const UserSettings = pgTable(
    "UserSettings",
    {
        id: text("id")
            .primaryKey()
    }
);

export const _UserSettingsRelations = relations(
    UserSettings,
    r => ({
        user: r.many(User)
    })
);
