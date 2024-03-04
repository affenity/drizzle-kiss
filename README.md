# drizzle-kiss

A multi-purpose package for drizzle.

Features:

* generate prisma schema from your drizzle schema
* generate an abstraction client for your drizzle schema.

## Drizzle to Prisma generator

I like making my models using Prisma schema, however it's severely limited. It forces you to repeat yourself if you want
a common structure for all models (i.e. createdAt, updatedAt, etc.), and you cannot split your models into different
files.

This package allows you to use the flexibility of defining models using drizzle, and then converting that to a
single-file
prisma schema.

**NOTE:** This package currently only supports postgres.

### Usage:

1. Make your drizzle schemas, relations & enums
2. Create a new file for generating prisma schema. In there, import your drizzle schema
3. Have the following code in your file:

```typescript
// file: prisma-generator.ts
import * as schema from "./my-drizzle-schema.ts"
import { parseDrizzle, generateToPrisma } from "drizzle-kiss";

const parsed = parseDrizzle(schema);
console.log(parsed);

const generated = await generateToPrisma({
    parsed
});

console.log(generated);
await Bun.write("./schema.prisma", generated.prismaSchemaString);
```

4. Run `bun run prisma-generator.ts`

### Note:
* Due to an issue with prisma, ensure all your model names, field names, enum names, enum values are appropriate. You cannot start with _, and cannot use dots in your naming.

## Drizzle KISS (keep it simple, stupid)

**Note: Currently not implemented**

Do you miss the abstraction layer Prisma provided you with? I do. That's why I made this package.

You're probably asking why, when drizzle is meant for a lower level. Well, simply because:

**I want** a basic crud abstraction layer. I don't want to mess with transactions and boilerplate for super simple use
cases.

### Installation

```bash
bun add drizzle-kiss
```

### Usage

1. Create a file called "drizzle.kiss.ts" (or whatever, really)
2. Include the following in the "drizzle.kiss.ts" file

```typescript
import * as schema from "./your/drizzle/schema.ts";
import { genTypes } from "drizzle-kiss";

console.log("Generating types using drizzle-kiss for my drizzle db ♥");

genTypes({
    schema,
    out: "./src/kiss.types.ts"
});
```

3. Run drizzle.kiss.ts every time you make changes to your schema. The package will parse your drizzle schema and
   generate types in the `kiss.types.ts` file.
4. Use drizzle-kiss for your basic CRUD needs:

```typescript
import type * as kissTypes from "./kiss.types.ts";
import * as schema from "./your/drizzle/schema.ts";

const db = drizlle();
const kiss = kiss<kissTypes>();

//> Using drizzle-kiss
const user = await kiss.createOne(schema.User, {
    data: {
        name: "Username",
        email: "user@example.com",
        workspace: {
            create: {
                name: "Test Workspace",
                stripeCustomerId: "123"
            }
        }
    }
});
console.log(`Created user with id ${ user.id }, and workspace with id ${ user.workspace.id }`);

//> Using drizzle-orm directly
const result = await db.transaction(async tx => {
    const createdUser = await db.insert(schema.User)
        .values({
            name: "Username",
            email: "user@example.com"
        })
        .returning()
        .onConflictDoNothing()
        .execute()
        .then(r => r.at(0));

    if (!createdUser) {
        throw new Error(`Failed to create user!`);
    }

    const createdWorkspace = await db.insert(schema.Workspace)
        .values({
            userId: createdUser.id,
            name: "Test Workspace",
            stripeCustomerId: "123"
        })
        .returning()
        .onConflictDoNothing()
        .execute()
        .then(r => r.at(0));

    if (!createdWorkspace) {
        throw new Error(`Failed to create workspace!`);
    }

    return {
        user: createdUser,
        workspace: createdWorkspace
    };
});
console.log(user.id, workspace.id);
```

## Roadmap

- [ ] Avoid the generation step. Preferably, it should just use types to infer all the models.
- [ ] Support other dialects databases than just Postgres
