import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { CountryCode, Products } from "plaid";

// For now I will be using publicProcedure because I won't be using authentication.
// Of course this introduces vulnarabilities and should be avoided in production.

export const bankRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createLinkToken: publicProcedure.mutation(async ({ ctx, input }) => {
    const linkToken = await ctx.plaidClient.linkTokenCreate({
      user: { client_user_id: "dsfsdf" },
      client_name: "Round Challenge",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.De],
      language: "en",
    });

    return {};
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
