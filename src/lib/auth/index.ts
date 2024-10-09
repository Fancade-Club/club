import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db, sessions, users } from "@lib/db";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: ({ name, slug }) => ({
    name,
    slug,
  }),
});

export const hashOptions = {
  memoryCost: 19456,
  timeCost: 2,
  hashLength: 32,
  parallelism: 1,
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      name: string;
      slug: string;
    };
  }
}
