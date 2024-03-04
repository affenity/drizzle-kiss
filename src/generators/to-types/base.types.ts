export type __ColumnType =
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
    | "decimal";
export type __Column = {
    alias: string
    name: string;
    type: __ColumnType;
    isNullable: boolean;
    isHasDefault: boolean;
    isPrimary: boolean;
    isUnique: boolean;
    enumName?: string;
};
export type __Enum = {
    name: string;
    values: string[];
}
export type __One = {
    type: "one";
    source: __Model;
    reference: __Model;
    sourceFields: string[];
    referenceFields: string[];
};
export type __Many = {
    type: "many";
    source: __Model;
    reference: __Model;
};
export type __Relation<O extends __One | __Many> = O;
export type __Model = {
    name: string;
    columns: Record<string, __Column>;
    relations: Record<string, __Relation<any>>;
    indexes: Record<string, string>;
};

//> Creators to help with type safety


export type __CreateColumn<O extends __Column> = O;
export type __CreateEnum<O extends __Enum> = O;
export type __CreateOne<O extends __One> = O;
export type __CreateMany<O extends __Many> = O;
export type __CreateRelation<O extends __One | __Many> = O;
export type __CreateModel<O extends __Model> = O;

export type __AllEntriesSetup = {
    models: Record<string, __Model>;
    enums: Record<string, __Enum>;
};
