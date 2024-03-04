import { parseEnumsFromSchemas } from "./parse.enums.ts";
import { parseSchemaRelations } from "./parse.relations.ts";
import { parseSchemaModels } from "./parse.models.ts";
import type { ParsedDrizzleSchema } from "./types.ts";

export function parseDrizzleSchema(schema: Record<string, unknown>) {
    const parsedEnums = parseEnumsFromSchemas(schema);
    const parsedRelations = parseSchemaRelations(schema);
    const parsedModels = parseSchemaModels(schema, parsedRelations.relations);

    const logComment = `
===================================
Successfully parsed Drizzle schema!
===================================
MODELS (${ parsedModels.models.length }):
${ parsedModels.models.map(m => `-> ${ m.name } (${ m.columns.length } columns, ${ m.relations.length } relations)`).join("\n") }
--
ENUMS (${ parsedEnums.length }):
${ parsedEnums.map(e => `-> ${ e.name } (${ e.values.length } values)`).join("\n") }
--
RELATIONS (${ parsedRelations.relations.length }):
${ parsedRelations.relations.map(r => `* ${ r.source } <-> ${ r.reference } [kind: ${ r.kind }, type: ${ r.type }]`).join("\n") }

--
>> RESULT <<:
=> Models: ${ parsedModels.models.length }, enums: ${ parsedEnums.length }, relations: ${ parsedRelations.relations.length }.
    `;

    return {
        logComment,
        models: parsedModels.models,
        enums: parsedEnums,
        relations: parsedRelations.relations
    } satisfies ParsedDrizzleSchema;
}
