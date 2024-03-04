import {
    Index,
    PgArray,
    PgBigInt53,
    PgBoolean,
    type PgColumn,
    PgCustomColumn,
    PgEnumColumn,
    PgInteger,
    PgJsonb,
    PgNumeric,
    PgTable,
    PgText,
    PgTimestamp,
    PgVarchar
} from "drizzle-orm/pg-core";
import { is } from "drizzle-orm";
import type { Column, ColumnBase, Idx, Model, ParsedRelation } from "./types.ts";

const symbolName = Symbol.for("drizzle:BaseName");
const extraConfigSymbol = Symbol.for("drizzle:ExtraConfigBuilder");

export function parseSchemaModels(entries: Record<string, PgTable | unknown>, relations: ParsedRelation[]) {
    const models = [] as Model[];

    for (const key in entries) {
        const value = entries[key];

        if (is(value, PgTable)) {
            const modelName = (value as any)[symbolName] as string;
            const table = value as PgTable;
            const outRelations = relations
                .filter(r => r.source === modelName)
                .map(r => ({
                    ...r,
                    kind: "out"
                }) satisfies ParsedRelation);
            const inRelations = relations
                .filter(r => r.reference === modelName)
                .map(r => ({
                    ...r,
                    kind: "in"
                }) satisfies ParsedRelation);

            const cols = [] as Column[];
            const modelEntries = Object.entries(value);

            for (const modelColEntry of modelEntries) {
                const [ alias, entryData ] = modelColEntry;
                const col = entryData as PgColumn;
                const baseData = {
                    alias,
                    name: col.name,
                    isHasDefault: col.hasDefault,
                    isNullable: !col.notNull,
                    isPrimary: col.primary,
                    isUnique: col.isUnique
                } satisfies ColumnBase;

                if (is(col, PgEnumColumn)) {
                    cols.push({
                        ...baseData,
                        type: "enum",
                        enumName: col.enum.enumName
                    });
                } else if (is(col, PgTimestamp)) {
                    cols.push({
                        ...baseData,
                        type: "datetime"
                    });
                } else if (is(col, PgBoolean)) {
                    cols.push({
                        ...baseData,
                        type: "boolean",
                        defaultValue: col.default
                    });
                } else if (is(col, PgText)) {
                    cols.push({
                        ...baseData,
                        type: "text"
                    });
                } else if (is(col, PgInteger)) {
                    cols.push({
                        ...baseData,
                        type: "int",
                        defaultValue: col.default
                    })
                } else if (is(col, PgBigInt53)) {
                    cols.push({
                        ...baseData,
                        type: "bigint",
                        defaultValue: col.default
                    });
                } else if (is(col, PgJsonb)) {
                    cols.push({
                        ...baseData,
                        type: "json",
                        defaultValue: col.default
                    });
                } else if (is(col, PgVarchar)) {
                    cols.push({
                        ...baseData,
                        type: "varchar",
                        defaultValue: col.default
                    })
                } else if (is(col, PgCustomColumn)) {
                    const sqlType = col.getSQLType();

                    if (sqlType === "bytea") {
                        cols.push({
                            ...baseData,
                            type: "bytea"
                        });
                    } else {
                        throw new Error(`Cannot determine type for column ${ col.name }, data type ${ col.dataType }, sql type: ${ sqlType }`);
                    }
                } else if (is(col, PgArray)) {
                    const sqlType = col.getSQLType();
                    if (sqlType === "text[]") {
                        cols.push({
                            ...baseData,
                            type: "text",
                            isArray: true
                        });
                    } else if (sqlType === "jsonb[]") {
                        cols.push({
                            ...baseData,
                            type: "json",
                            isArray: true
                        });
                    } else {
                        throw new Error(`Cannot determine correct column type & properties for column ${ col.name }, type: ${ col.dataType }, sql type: ${ sqlType }`);
                    }
                } else if (is(col, PgNumeric)) {
                    cols.push({
                        ...baseData,
                        type: "decimal",
                        defaultValue: col.default
                    });
                } else {
                    throw new Error(`No type for col ${ col.name }, ${ col.columnType }, ${ col.dataType }`);
                }
            }

            const indexes = [] as Idx[];
            // @ts-ignore
            const extraConfFn = (table)[extraConfigSymbol];
            if (extraConfFn) {
                const indexRecords = extraConfFn(table) as Record<string, Index>;
                for (const indexKey in indexRecords) {
                    const index = indexRecords[indexKey];
                    const indexConf = index.config;

                    indexes.push({
                        type: indexConf.unique ? "unique" : "normal",
                        fields: indexConf.columns.map(c => c.name)
                    });
                }
            }

            models.push({
                name: modelName,
                columns: cols,
                relations: [
                    ...inRelations,
                    ...outRelations
                ],
                indexes
            });
        }
    }

    return {
        models
    };
}
