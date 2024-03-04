import type { __AllEntriesSetup, __Column, __Model } from "../generators/to-types/base.types.ts";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

type ModelAndAll = { model: __Model; all: __AllEntriesSetup; };
type PrimitiveColumnType = {
    "enum": unknown;
    "boolean": boolean;
    "text": string;
    "varchar": string;
    "date": Date;
    "datetime": Date;
    "int": number;
    "bigint": number;
    "decimal": number;
    "json": unknown;
    "bytea": unknown;
};
export type GetColumnType<
    O extends ModelAndAll,
    Col extends __Column
> = Col["type"] extends "enum" ?
    O["all"]["enums"][NonNullable<Col["enumName"]>]["values"][number]
    : PrimitiveColumnType[Col["type"]];
export type ColumnKeyIfAbsolutelyRequired<
    K,
    C extends __Column
> = C["isNullable"] extends false ?
    (C["isHasDefault"] extends true ? never : K)
    : never;
export type ColumnKeyIfOptional<
    K,
    C extends __Column
> = C["isNullable"] extends true ? K :
    (C["isHasDefault"] extends true ? K : never);
export type GetModelFromSchema<All extends __AllEntriesSetup, Schema extends PgTable> = {
    schema: Schema;
    model: All["models"][Schema["_"]["name"]];
    all: All;
};
export type GetModelFromModel<All extends __AllEntriesSetup, ModelName extends string> = {
    all: All;
    model: All["models"][ModelName];
};
export type GetTypeRelations<T extends "one" | "many", Rels extends Record<string, __Relation<any>>> = {
    [K in keyof Rels]: Rels[K]["type"] extends T ? Rels[K] : never;
};
export type GetKindRelations<T extends "in" | "out", Rels extends Record<string, __Relation<any>>> = {
    [K in keyof Rels]: Rels[K]["kind"] extends T ? Rels[K] : never;
};
export type GetKindAndTypeRelations<
    Kind extends "in" | "out",
    T extends "one" | "many",
    Rels extends Record<string, __Relation<any>>,
    RelsKind extends GetKindRelations<Kind, Rels> = GetKindRelations<Kind, Rels>,
    RelsType extends Record<string, __Relation<any>> = GetTypeRelations<T, RelsKind>
> = RelsType;
export type GetXFieldsForRelations<
    T extends "sourceFields" | "referenceFields",
    Rels extends Record<string, __Relation<any>>
> = {
    [K in keyof Rels]: Rels[K][T][number];
}[keyof Rels];
export type GetXFieldsForSingleRelation<T extends "sourceFields" | "referenceFields", Rel extends __Relation<any>> = Rel extends __One ? Rel[T][number] : never;

export type $CreateOneInputRaw<O extends ModelAndAll> = {
    [K in keyof O["model"]["columns"] as ColumnKeyIfAbsolutelyRequired<K, O["model"]["columns"][K]>]: GetColumnType<O, O["model"]["columns"][K]>;
} & {
    [K in keyof O["model"]["columns"] as ColumnKeyIfOptional<K, O["model"]["columns"][K]>]?: GetColumnType<O, O["model"]["columns"][K]>;
};
export type $CreateOneOutputRaw<O extends ModelAndAll> = {
    [K in keyof O["model"]["columns"]]: (O["model"]["columns"][K]["isNullable"] extends true ? undefined : never) | GetColumnType<O, O["model"]["columns"][K]>;
};
export type $_ConnectRelational<
    O extends ModelAndAll,
    Rel extends __One,
    Fields extends GetXFieldsForSingleRelation<"sourceFields", Rel> = GetXFieldsForSingleRelation<"sourceFields", Rel>
> = {
    [K in Fields]: GetColumnType<O, O["model"]["columns"][K]>;
};
export type $_GetReferencedModelFromRel<O extends ModelAndAll, Rel extends __One | __Many> = GetModelFromModel<O["all"], Rel["reference"]["name"]>;
export type $_RelationalInput<O extends ModelAndAll> = {
    [K in keyof O["model"]["relations"]]: {
        connect?: $_ConnectRelational<O, O["model"]["relations"][K]>;
        create?: $CreateOneInputRelational<
            $_GetReferencedModelFromRel<O, O["model"]["relations"][K]>
        >;
    };
};
export type $CreateOneInputRelational<
    O extends ModelAndAll,
    RawInput extends $CreateOneInputRaw<O> = $CreateOneInputRaw<O>,
    OmitKeys extends string = GetXFieldsForRelations<"sourceFields", O["model"]["relations"]>,
    OmittedRawInput extends Omit<RawInput, OmitKeys> = Omit<RawInput, OmitKeys>
> = OmittedRawInput & $_RelationalInput<O>;

export class Kiss<
    DbClient extends PostgresJsDatabase<any>,
    All extends __AllEntriesSetup,
    Models extends All["models"] = All["models"],
    Enums extends All["enums"] = All["enums"]
> {
    constructor(public client: DbClient) {
    }

    getModel<N extends keyof Models>(name: N) {
        return {} as Models[N];
    }

    getEnum<N extends keyof Enums>(name: N) {
        return {} as Enums[N];
    }

    _getOmitKeys<
        S extends PgTable,
        O extends GetModelFromSchema<All, S> = GetModelFromSchema<All, S>,
        GotRels extends Record<string, __Relation<any>> = GetKindAndTypeRelations<"out", "one", O["model"]["relations"]>,
        XFields extends string = GetXFieldsForRelations<"sourceFields", GotRels>
    >(schema: S) {
        return {} as XFields;
    }

    async createOne<
        S extends PgTable,
        O extends GetModelFromSchema<All, S> = GetModelFromSchema<All, S>,
        Input extends $CreateOneInputRelational<O> = $CreateOneInputRelational<O>
    >(schema: S, input: Input) {
        return {} as Input;
    }

    async createMany<S extends PgTable>(schema: S) {
    }

    async updateOne<S extends PgTable>(schema: S) {
    }

    async updateMany<S extends PgTable>(schema: S) {

    }

    async upsertOne<S extends PgTable>(schema: S) {
    }

    async deleteOne<S extends PgTable>(schema: S) {

    }

    async deleteMany<S extends PgTable>(schema: S) {

    }
}
