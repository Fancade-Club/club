import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { slug } from "@lib/schema";
import { db, users } from "@lib/db";
import { lucia, hashOptions } from "@lib/auth/index";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { eq } from "drizzle-orm";

export const signup = defineAction({
  accept: "form",
  input: z.object({
    name: z.string(),
    slug: slug(),
    password: z.string(),
  }),
  handler: async ({name, slug, password}, {cookies}) => {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.slug, slug));

    if (existingUser)
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "The provided slug already exists.",
      });

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
