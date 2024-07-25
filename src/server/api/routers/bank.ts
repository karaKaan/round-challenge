import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { decrypt, encrypt } from "@/utils/crypto";
import { plaidClient } from "@/utils/plaid";
import { CountryCode, Products } from "plaid";
import { z } from "zod";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { getAccessTokenWithUser } from "@/utils/getAccessTokenWithUser";

const DATE_FORMAT = "YYYY-MM-DD";

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
    } catch (error) {
      console.log(error);
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
        /**
         * Here we use the prisma transaction for bulk creation and edit.
         * This approach is way faster and recommended than doing it in a loop.
         */
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
      } catch (error) {
        console.log(error);
      }
    }),
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { accessToken, user } = await getAccessTokenWithUser({
        db: ctx.db,
        userId: ctx.session.user.id,
      });

      const { data } = await plaidClient.accountsBalanceGet({
        access_token: accessToken,
        options: {
          account_ids: user.bankAccounts.map((account) => account.accountId),
        },
      });

      const accounts = data.accounts.map((account) => {
        const storedAccount = user.bankAccounts.find(
          (bankAccount) => bankAccount.accountId === account.account_id,
        );

        return {
          accountId: storedAccount?.accountId,
          bankName: storedAccount?.bankInstitution?.name,
          name: storedAccount?.name,
          mask: storedAccount?.mask,
          type: storedAccount?.type,
          subtype: storedAccount?.subtype,
          currentBalance: account.balances.current,
          isoCurrencyCode: account.balances.iso_currency_code,
        };
      });

      return { accounts };
    } catch (error) {
      console.log(error);
    }
  }),

  getTransactions: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().nullish(),
          endDate: z.string().nullish(),
          accountId: z.string().nullish(),
        })
        .nullish(),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { accessToken, user } = await getAccessTokenWithUser({
          db: ctx.db,
          userId: ctx.session.user.id,
        });

        const startDate = input?.startDate
          ? dayjs(input.startDate).format(DATE_FORMAT)
          : dayjs(new Date()).subtract(1, "month").format(DATE_FORMAT);

        const endDate = input?.endDate
          ? dayjs(input.endDate).format(DATE_FORMAT)
          : dayjs(new Date()).format(DATE_FORMAT);

        const transactions = await plaidClient.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: {
            account_ids: input?.accountId
              ? [input.accountId]
              : user.bankAccounts.map((account) => account.accountId),
          },
        });
        const transactionsFormatted: (string | number | null | undefined)[][] =
          [];

        transactions.data.transactions.forEach((transaction) => {
          const date = dayjs(transaction.date).format("DD MMM YYYY");
          const toFrom = transaction.name;
          /**
           * The amount from the response of plaidApi returns a
           * positive amount and a negative amount.
           * The positive amount means that the account was charged.
           * The negative amount means that the account was credited.
           *
           * For better user experience we switch it with multiplying it by -1.
           * So that minus actually means minus and plus means plus.
           */
          const amountWithIsoCurrencyCode = `${new BigNumber(transaction.amount).times(-1).toNumber()} ${transaction.iso_currency_code}`;
          const paymentMethod = transaction.payment_channel;

          const findAccount = user.bankAccounts.find(
            (account) => account.accountId === transaction.account_id,
          );

          const bank = findAccount?.bankInstitution?.name;
          const account = `${findAccount?.name} (**${findAccount?.mask})`;

          transactionsFormatted.push([
            date,
            toFrom,
            amountWithIsoCurrencyCode,
            paymentMethod,
            bank,
            account,
          ]);
        });

        return transactionsFormatted;
      } catch (error) {
        console.log(error);
      }
    }),
  getMonthlyIncomeAndSpend: protectedProcedure.query(async ({ ctx }) => {
    try {
      const startDate = dayjs(new Date()).startOf("month").format(DATE_FORMAT);
      const endDate = dayjs(new Date()).endOf("month").format(DATE_FORMAT);
      const { accessToken, user } = await getAccessTokenWithUser({
        db: ctx.db,
        userId: ctx.session.user.id,
      });

      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          account_ids: user.bankAccounts.map((account) => account.accountId),
        },
      });

      let totalIncome = 0;
      let totalSpend = 0;
      let totalBalance = 0;

      response.data.transactions.forEach((transaction) => {
        if (transaction.amount < 0) {
          totalIncome += Math.abs(transaction.amount);
        } else {
          totalSpend += transaction.amount;
        }
      });

      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken,
        options: {
          account_ids: user.bankAccounts.map((account) => account.accountId),
        },
      });

      accountsResponse.data.accounts.forEach((account) => {
        totalBalance += account.balances.current ?? 0;
      });

      const runway =
        totalSpend > 0
          ? new BigNumber(totalBalance).dividedBy(totalSpend).toNumber()
          : Infinity;

      return { runway, totalIncome, totalSpend };
    } catch (error) {
      console.log(error);
    }
  }),
});
