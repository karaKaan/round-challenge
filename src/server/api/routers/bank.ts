import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { decrypt, encrypt } from "@/utils/crypto";
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
    .input(
      z.object({
        publicToken: z.string(),
        accounts: z.array(
          z.object({
            id: z.string(),
            mask: z.string(),
            name: z.string(),
            subtype: z.string(),
            type: z.string(),
          }),
        ),
        institutionId: z.string().nullish(),
        institutionName: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tokenExchangeResponse =
          await ctx.plaidClient.itemPublicTokenExchange({
            public_token: input.publicToken,
          });

        const accessToken = tokenExchangeResponse.data.access_token;
        const encryptedAccessToken = encrypt(accessToken);
        const sessionUserId = ctx.session.user.id;

        const user = await ctx.db.user.findUnique({
          where: { id: sessionUserId },
        });

        if (
          !user?.accessToken ||
          user.accessToken !== decrypt(user.accessToken)
        ) {
          await ctx.db.user.update({
            where: { id: sessionUserId },
            data: { accessToken: encryptedAccessToken },
          });
        }

        await ctx.db.$transaction(
          input.accounts.map((account) => {
            const institutionId = input.institutionId ?? undefined;
            const institutionName = input.institutionName ?? undefined;

            return ctx.db.bankAccount.upsert({
              where: { accountId: account.id },
              include: { bankInstitution: true },
              create: {
                accountId: account.id,
                mask: account.mask,
                name: account.name,
                subtype: account.subtype,
                type: account.type,
                user: { connect: { id: sessionUserId } },
                bankInstitution: {
                  connectOrCreate: {
                    where: { institutionId },
                    create: { institutionId, name: institutionName },
                  },
                },
              },
              update: {
                accountId: account.id,
                mask: account.mask,
                name: account.name,
                subtype: account.subtype,
                type: account.type,
                userId: ctx.session.user.id,
              },
            });
          }),
        );

        return { status: "success" };
      } catch (err) {
        console.log(err);
      }
    }),
});
