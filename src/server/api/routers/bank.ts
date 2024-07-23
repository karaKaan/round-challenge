import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { CountryCode, Products } from "plaid";
import { z } from "zod";

export const bankRouter = createTRPCRouter({
  createLinkToken: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session) throw new Error("No session found");
    try {
      const linkTokenResponse = await ctx.plaidClient.linkTokenCreate({
        user: { client_user_id: ctx.session.user.id },
        client_name: "Round Challenge",
        products: [Products.Auth, Products.Transactions],
        country_codes: [CountryCode.De],
        language: "en",
      });

      return {
        linkToken: linkTokenResponse.data.link_token,
      };
    } catch (err) {
      console.log(err);
    }
  }),
  exchangePublicToken: protectedProcedure
    .input(z.object({ publicToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // if (!ctx.session) throw new Error("No session found");
      try {
        const tokenExchangeResponse =
          await ctx.plaidClient.itemPublicTokenExchange({
            public_token: input.publicToken,
          });

        const accessToken = tokenExchangeResponse.data.access_token;
        const itemId = tokenExchangeResponse.data.item_id;
        console.log({ accessToken, itemId });
        return {};
      } catch (err) {
        console.log(err);
      }
    }),
});
