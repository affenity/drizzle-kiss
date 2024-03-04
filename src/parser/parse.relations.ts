import { createTableRelationsHelpers, is, Many, One, type RelationConfig, Relations } from "drizzle-orm";
import type { ManyRelation, OneRelation, ParsedRelation } from "./types.ts";
import { AnyPgColumn, ForeignKey, PgColumn, PgTable } from "drizzle-orm/pg-core";

const nameSymbol = Symbol.for("drizzle:BaseName");
const inlineFKSymbol = Symbol.for("drizzle:PgInlineForeignKeys");

export function parseSchemaRelations(entries: Record<string, Relations | unknown>) {
    const oneRelations = [] as OneRelation[];
    const manyRelations = [] as ManyRelation[];

    for (const key in entries) {
        const value = entries[key];
        if (is(value, Relations)) {
            const helpers = createTableRelationsHelpers(value.table);
            const relations = value.config(helpers);
            for (const relKey in relations) {
                const relData = relations[relKey];
                const sourceTable = relData.sourceTable as PgTable;
                const targetTable = relData.referencedTable as PgTable;
                const sourceTableName = (sourceTable as any)[nameSymbol];
                const targetTableName = (targetTable as any)[nameSymbol];
                const relConfig = (relData as any).config as RelationConfig<any, any, any>;
                let optional = relConfig?.fields?.some((f: PgColumn) => !f.notNull); // may change further down, depending on fks and more below

                //> Assigning standard relation fields
                let fieldsReferenced: string[] = relConfig?.references?.map((c: any) => c.name) ?? [];
                let fieldsSource: string[] = relConfig?.fields?.map((c: any) => c.name) ?? [];

                // If any of the fields are missing, we do some magic check to extract them from the foreign keys.
                if (fieldsReferenced.length < 1 || fieldsSource.length < 1) {
                    // If no referenced fields were specified in drizzle, we'll check the referenced table and check for
                    // foreign keys and construct them instead.

                    console.log(`[Model ${ sourceTableName }, relation "${ relKey }"]: Missing ref or source fields, extracting from foreign keys..`);
                    const fks = (sourceTable?.[inlineFKSymbol] as ForeignKey[] | undefined) ?? [];

                    for (const fk of fks) {
                        const ref = fk.reference();
                        const refTargetName = ref.foreignTable?.[nameSymbol] as string;

                        if (refTargetName === relData.referencedTableName) {
                            fieldsSource = ref.columns.map(c => c.name);
                            fieldsReferenced = ref.foreignColumns.map(c => c.name);
                            optional = ref.columns.some(c => !c.notNull);
                            console.log(`[Model ${ sourceTableName }, relation "${ relKey }"]: Detected source & referenced fields from FK constraints. Source: ${ fieldsSource.join(",") }, referenced: ${ fieldsReferenced.join(",") }`)
                            break;
                        }
                    }
                }

                if (is(relData, One)) {
                    oneRelations.push({
                        kind: null,
                        type: "one",
                        name: relKey,
                        alias: relKey,
                        source: sourceTableName,
                        reference: targetTableName,
                        referenceFields: fieldsReferenced,
                        sourceFields: fieldsSource,
                        optional
                    });
                } else if (is(relData, Many)) {
                    manyRelations.push({
                        type: "many",
                        name: relKey,
                        source: sourceTableName,
                        reference: targetTableName,
                        kind: null
                    });
                } else {
                    throw new Error(`Not one or many relation!`);
                }
            }
        }
    }

    const combinedRelations = [
        ...oneRelations,
        ...manyRelations
    ] satisfies ParsedRelation[];

    return {
        oneRelations,
        manyRelations,
        relations: combinedRelations
    };
}
