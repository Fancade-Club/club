import { ActionError, defineAction } from "astro:actions";
import { lucia } from "@lib/auth/index";

export const logout = defineAction({
  accept: "form",
  handler: async (_, { locals: { user, session } }) => {
    if (!user || !session)
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to log out.",
      });

    await lucia.invalidateSession(session.id);
  },
});
