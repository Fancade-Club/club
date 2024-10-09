import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { slug } from "@lib/schema";
import { db, users } from "@lib/db";
import { lucia, hashOptions } from "@lib/auth/index";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";

export const signup = defineAction({
  accept: "form",
  input: z.object({
    name: z.string(),
    slug: slug(),
    password: z.string(),
  }),
  handler: async ({ name, slug, password }, { cookies }) => {
    const id = generateIdFromEntropySize(10);
    await db.insert(users).values({
      id,
      name,
      slug,
      password: await hash(password, hashOptions),
    });

    const session = await lucia.createSession(id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  },
});
