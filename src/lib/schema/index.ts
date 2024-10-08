import { z } from "astro:schema";
import slugify from "@sindresorhus/slugify";
import zxcvbn from "zxcvbn";

export const emptyString = () => z.literal("").transform(() => null);

export const slug = () =>
  z.preprocess(
    (val) => slugify(z.string().parse(val)),
    z.string().min(3).max(16),
  );

export const password = () => z.string().refine((val) => zxcvbn(val).score > 4);
