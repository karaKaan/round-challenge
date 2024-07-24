import { Text } from "@mantine/core";
import { IconDots, IconDotsCircleHorizontal } from "@tabler/icons-react";
import React from "react";

type Props = {
  account: {
    accountId?: string | null;
    bankName?: string | null;
    currentBalance?: number | null;
    isoCurrencyCode?: string | null;
    name?: string | null;
    mask?: string | null;
  };
};

export const AccountCard = ({ account }: Props) => {
  return (
    <div
      key={account.accountId}
      className="min-h-32 w-full max-w-80 rounded-lg bg-stone-200 p-3"
    >
      <Text className="mb-2 text-sm font-bold">{account.bankName}</Text>
      <Text className="text-xl font-bold">
        {account.currentBalance} {account.isoCurrencyCode}
      </Text>
      <Text className="text-xs font-bold text-black/50">
        {account.name} (**{account.mask})
      </Text>
    </div>
  );
};
