import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { emptyString, slug } from "@lib/schema";
import { db, users } from "@lib/db";
import { hashOptions } from "@lib/auth/index";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

export const settings = defineAction({
  accept: "form",
  input: z.object({
    name: emptyString().nullable().or(z.string()),
    slug: emptyString().nullable().or(slug()),
    password: emptyString().nullable().or(z.string()),
  }),
  handler: async ({ name, slug, password }, { locals: { user } }) => {
    if (!user)
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You need to be logged in to edit your preferences.",
      });

    if (name == user.name) name = null;
    if (slug == user.slug) slug = null;
    if (!(name || slug || password)) return;

    await db
      .update(users)
      .set({
        name: name ?? undefined,
        slug: slug ?? undefined,
        password: password ? await hash(password, hashOptions) : undefined,
      })
      .where(eq(users.id, user.id));
  },
});
