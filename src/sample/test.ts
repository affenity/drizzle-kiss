import * as schema from "./schema.ts";
import { generateToPrisma, parseDrizzle } from "../index.ts";
import { writeFile } from "node:fs/promises";

const parsed = parseDrizzle(schema);
const generatedPrisma = await generateToPrisma({ parsed });
await writeFile("./test.prisma", generatedPrisma.prismaSchemaString);

console.log(parsed.logComment);
