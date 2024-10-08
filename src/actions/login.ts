import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { slug } from "@lib/schema";
import { db, users } from "@lib/db";
import { lucia, hashOptions } from "@lib/auth/index";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

export const login = defineAction({
  accept: "form",
  input: z.object({
    slug: slug(),
    password: z.string(),
  }),
  handler: async ({ slug, password }, { cookies }) => {
    const authError = new ActionError({
      code: "BAD_REQUEST",
      message: "The entered slug or password is incorrect.",
    });

    const [user] = await db.select().from(users).where(eq(users.slug, slug));
    if (!user) throw authError;

    const passwordValid = await verify(user.password, password, hashOptions);
    if (!passwordValid) throw authError;

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  },
});
