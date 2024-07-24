import BigNumber from "bignumber.js";

type CalculateTotalBalance = {
  accountBalances: {
    currentBalance: number;
    isoCurrencyCode: string;
  }[];
  isoCurrencyCode: string;
};

/**
 * Created a util function to calculate the total balance of all accounts.
 * The idea of this function is that if there is an account with a different
 * isoCurrencyCode the exchange rate will be applied.
 *
 * For now we assume we return the prev value back and go with EUR.
 */

export const calculateTotalBalance = ({
  accountBalances,
  isoCurrencyCode,
}: CalculateTotalBalance) => {
  return accountBalances.reduce((prev, curr) => {
    if (curr.isoCurrencyCode !== isoCurrencyCode) {
      return prev;
    }
    return new BigNumber(prev).plus(curr.currentBalance).toNumber();
  }, 0);
};
