import type { Column, Enum, Model, ParsedDrizzleSchema, ParsedRelation } from "../../parser/types.ts";
import * as fs from "fs";

export const generateEnumType = (input: Enum) => {
    return `
    export type ${ input.alias } = __CreateEnum<{
        name: "${ input.name }",
        values: [${ input.values.map(f => `"${ f }"`).join(", ") }]
    }>
    `;
};

export const generateRelationType = (input: ParsedRelation) => {
    if (input.type === "one") {
        return `
        ${ input.alias }: __CreateRelation<{
            type: "one",
            kind: "${ input.kind }",
            source: ${ input.source },
            reference: ${ input.reference },
            sourceFields: [${ input.sourceFields.map(f => `"${ f }"`).join(", ") }],
            referenceFields: [${ input.referenceFields.map(f => `"${ f }"`).join(", ") }]
        }>
        `;
    } else {
        return "";
        return `
        ${ input.name }: __CreateRelation<{
            type: "many",
            source: "${ input.source }",
            reference: "${ input.reference }"
        }>
        `;
    }
};

export const generateColType = (input: Column) => {
    return `
        ${ input.alias }: __CreateColumn<{
            alias: "${ input.alias }",
            name: "${ input.name }",
            type: "${ input.type }",
            isNullable: ${ input.isNullable },
            isHasDefault: ${ input.isHasDefault },
            isPrimary: ${ input.isPrimary },
            isUnique: ${ input.isUnique },
            enumName: ${ input.enumName ? `"${ input.enumName }"` : undefined }
        }>
    `;
};

export const generateModelType = (input: Model) => {
    const filteredRelations = input.relations
        .filter(r => r.kind === "out" && r.type === "one");

    return `
    export type ${ input.name } = __CreateModel<{
        name: "${ input.name }",
        columns: {
            ${ input.columns.map(c => generateColType(c)) }
        },
        relations: {
            ${ filteredRelations.map(r => generateRelationType(r)) }
        },
        indexes: {}
    }>;
    `;
};

export const generateToTypes = async (data: ParsedDrizzleSchema) => {
    const baseTypesString = fs.readFileSync("./src/generators/to-types/base.types.ts", "utf8");
    let outStr = baseTypesString + "";

    for (const _enum of data.enums) {
        outStr += generateEnumType(_enum);
    }

    for (const model of data.models) {
        outStr += generateModelType(model);
    }

    outStr += `
    export type __AllModels = {
        ${ data.models.map(m => `${ m.name }: ${ m.name }`).join(",\n") }
    };
    export type __AllEnums = {
        ${ data.enums.map(e => `${ e.name }: ${ e.alias }`).join(",\n") }
    };
    
    export type __AllEntries = {
        models: __AllModels;
        enums: __AllEnums;
    };
    `;

    await Bun.write("./src/out.types.ts", outStr);
};
