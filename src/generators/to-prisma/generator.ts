import { fileURLToPath } from "url";
import * as path from "path";
import { dirname } from "path";
import { Column, Enum, Idx, ManyRelation, Model, OneRelation, ParsedDrizzleSchema } from "../../parser/types.ts";
import * as fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sortByName = (a: string, b: string) => {
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }

    return 0;
};

export type GeneratePrismaOptions = {
    parsed: ParsedDrizzleSchema;
    basePrisma?: string | null;
}
export const generatePrisma = async (options: GeneratePrismaOptions) => {
    const { parsed: data, basePrisma } = options;
    const models = data.models.sort((a, b) => sortByName(a.name, b.name));
    const enums = data.enums.sort((a, b) => sortByName(a.name, b.name));
    const readBase = basePrisma || fs.readFileSync(path.join(__dirname, "./base.prisma"), "utf8");
    const generatedEnums = enums.map(e => generateEnum(e));
    const generatedModels = models.map(m => generateModel(m));

    const generatedContent =
        `
    ${ readBase }
    ${ ASCII_ENUMS }
    // ENUMS:
    ${ generatedEnums.join("\n") }
    
    ${ ASCII_MODELS }
    // MODELS:
    ${ generatedModels.join("\n") }
    `;

    return generatedContent;
};

export const generateEnum = (_enum: Enum) => {
    return `
    enum ${ _enum.name } {
        ${ _enum.values.join("\n") }
    }
    `;
};

export const genRel = (rel: OneRelation | ManyRelation) => {
    if (rel.type === "one" && rel.kind === "out") {
        return `${ rel.alias || rel.name } ${ rel.reference }${ rel.optional ? "?" : "" } @relation("${ rel.reference }_${ rel.source }", fields: [ ${ rel.sourceFields.join(",") } ], references: [ ${ rel.referenceFields.join(",") } ]) // 1: TYPE=ONE KIND=OUT`;
    } else if (rel.type === "one" && rel.kind === "in") {
        return `${ rel.source || rel.name } ${ rel.source }[] @relation("${ rel.reference }_${ rel.source }") // 2: TYPE=ONE KIND=IN`;
    } else if (rel.type === "many" && rel.kind === "in") {
        // return `${ rel.name } ${ rel.source } // 3: TYPE=MANY KIND=IN`;
    } else if (rel.type === "many" && rel.kind === "out") {
        //return `${ rel.name } ${ rel.reference } // 4: TYPE=MANY KIND=OUT`;
    }

    return "";
};

export const genIdx = (idx: Idx) => {
    if (idx.type === "unique") {
        return `@@unique([ ${ idx.fields.join(",") } ])`;
    } else if (idx.type === "normal") {
        return `@@index([ ${ idx.fields.join(",") } ])`;
    }

    throw new Error("No idx func expected here!");
};

export const generateCol = (col: Column) => {
    const uniquely = col.isUnique ? "@unique" : "";
    const arr = col.isArray ? "[]" : "";
    const nullable = col.isNullable ? col.isArray ? "" : "?" : "";
    const def = (col.defaultValue !== undefined && col.defaultValue !== null) ? `@default(${ col.defaultValue })` : "";
    const idDef = (col.type === "text" && col.isPrimary) ? "@default(cuid())" : null;

    if (col.type === "enum") {
        return `${ col.alias } ${ col.enumName! }${ arr }${ nullable } ${ def }`;
    } else if (col.type === "datetime" || col.type === "date") {
        return `${ col.alias } DateTime${ arr }${ nullable } ${ col.isUpdatedAt ? "@updatedAt" : "" } ${ col.isHasDefault ? "@default(now())" : "" } @db.Timestamptz()`;
    } else if (col.type === "text") {
        return `${ col.alias } String${ arr }${ nullable } ${ col.isPrimary ? "@id" : "" } ${ idDef ? idDef : (col.isHasDefault ? `@default("${ col.defaultValue }")` : "") }`;
    } else if (col.type === "boolean") {
        return `${ col.alias } Boolean${ nullable } ${ def }`;
    } else if (col.type === "decimal") {
        return `${ col.alias } Decimal${ arr }${ nullable } ${ def }`;
    } else if (col.type === "int") {
        return `${ col.alias } Int${ arr }${ nullable } ${ def }`;
    } else if (col.type === "bigint") {
        return `${ col.alias } BigInt${ arr }${ nullable } ${ def }`;
    } else if (col.type === "json") {
        return `${ col.alias } Json${ arr }${ nullable } ${ def }`;
    } else if (col.type === "varchar") {
        return `${ col.alias } String${ arr }${ nullable } @db.VarChar(${ col.varCharLength ? col.varCharLength : "" })`;
    } else if (col.type === "bytea") {
        return `${ col.alias } Bytes${ nullable } @db.ByteA()`;
    }
};

export const generateModel = (mod: Model) => {
    const generatedCols = mod.columns
        .map(c => generateCol(c))
        .filter(c => !!c);
    const generatedRels = mod.relations
        .map(r => genRel(r))
        .filter(c => !!c);
    const generatedIdxs = mod.indexes
        .map(i => genIdx(i))
        .filter(i => !!i);

    return `
    model ${ mod.name } {
    //> Definition
    ${ generatedCols.join("\n") }
    
    //> Relations
    ${ generatedRels.join("\n") }
    
    //> Constraints & indexes
    ${ generatedIdxs.join("\n") }
    }
    `;
};

export const ASCII_ENUMS = `
// ######################################
// #                                    #
// #                                    #
// #   _____ _   _ _   _ __  __ ____    #
// #  | ____| \\ | | | | |  \\/  / ___|   #
// #  |  _| |  \\| | | | | |\\/| \\___ \\   #
// #  | |___| |\\  | |_| | |  | |___) |  #
// #  |_____|_| \\_|\\___/|_|  |_|____/   #
// #                                    #
// #                                    #
// ###################################### 
`;

export const ASCII_MODELS = `
// ############################################
// #                                          #
// #                                          #
// #   __  __  ___  ____  _____ _     ____    #
// #  |  \\/  |/ _ \\|  _ \\| ____| |   / ___|   #
// #  | |\\/| | | | | | | |  _| | |   \\___ \\   #
// #  | |  | | |_| | |_| | |___| |___ ___) |  #
// #  |_|  |_|\\___/|____/|_____|_____|____/   #
// #                                          #
// #                                          #
// ############################################

`;
