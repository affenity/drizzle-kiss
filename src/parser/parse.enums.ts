import { isPgEnum, type PgEnum } from "drizzle-orm/pg-core";
import type { Enum } from "./types.ts";

export function parseEnumsFromSchemas(entries: Record<string, PgEnum<any> | unknown>) {
    const outEnums = [] as Enum[];

    for (const key in entries) {
        const value = entries[key];
        if (isPgEnum(value)) {
            outEnums.push({
                alias: key,
                name: value.enumName,
                values: value.enumValues
            });
        }
    }

    return outEnums;
}
