import { ParsedDrizzleSchema } from "./parser/types.ts";
import { generatePrisma } from "./generators/to-prisma/generator.ts";
import { parseDrizzleSchema } from "./parser";

/**
 * Please parse the wildcard-imported schema file for your Drizzle schema. For example: `import * as schema from "my-drizzle-schema.ts";`
 * and then call `parseDrizzleSchema(schema)`. This function takes the schema, parses enums, models and relations.
 * @param schema
 */
export function parseDrizzle(schema: Record<string, unknown>): ParsedDrizzleSchema {
    return parseDrizzleSchema(schema);
}


export type GenerateToPrismaOptions = {
    parsed: ParsedDrizzleSchema;
    basePrisma?: string | null;
};

/**
 * This function asynchronously generates a prisma file from the parsed drizzle schema.
 */
export async function generateToPrisma(options: GenerateToPrismaOptions) {
    const generatedPrismaSchema = await generatePrisma({
        basePrisma: options.basePrisma,
        parsed: options.parsed
    });

    return {
        prismaSchemaString: generatedPrismaSchema
    };
}
