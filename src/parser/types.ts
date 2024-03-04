export type Enum = {
    alias: string;
    name: string;
    values: string[];
};
export type ColumnType =
    "enum"
    | "boolean"
    | "text"
    | "varchar"
    | "date"
    | "datetime"
    | "int"
    | "bigint"
    | "json"
    | "bytea"
    | "custom"
    | "buffer"
    | "decimal";
export type ColumnBase = {
    alias: string;
    name: string;
    isNullable: boolean;
    isHasDefault: boolean;
    isPrimary: boolean;
    isUnique: boolean;
    isUpdatedAt?: object;
    defaultValue?: any;
    isArray?: boolean;
    enumName?: string;
    varCharLength?: number;
};
export type Column = ColumnBase & { type: ColumnType; };
export type RelationKind = "in" | "out";
export type RelationType = "one" | "many";
export type OneRelation = {
    kind: RelationKind | null;
    type: "one";
    optional: boolean;
    alias: string | null;
    name: string | null;
    source: string;
    reference: string;
    sourceFields: string[];
    referenceFields: string[];
};
export type ManyRelation = {
    kind: RelationKind | null;
    type: "many";
    name: string | null;
    source: string;
    reference: string;
};
export type ParsedRelation = OneRelation | ManyRelation;
export type Idx = {
    type: "normal" | "unique";
    fields: string[];
};
export type Model = {
    name: string;
    columns: Column[];
    relations: ParsedRelation[];
    indexes: Idx[];
};

export type ParsedDrizzleSchema = {
    logComment: string;
    enums: Enum[];
    relations: ParsedRelation[];
    models: Model[];
};
