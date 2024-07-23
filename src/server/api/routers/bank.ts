import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { CountryCode, Products } from "plaid";

export const bankRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createLinkToken: protectedProcedure.mutation(async ({ ctx, input }) => {
    if (!ctx.session) throw new Error("No session found");

    const linkToken = await ctx.plaidClient.linkTokenCreate({
      user: { client_user_id: ctx.session.user.id },
      client_name: "Round Challenge",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.De],
      language: "en",
    });

    console.log(linkToken);

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
