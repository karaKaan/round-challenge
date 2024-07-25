import { Menu, Text } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import React, { useState } from "react";

type AccountCardProps = {
  account: {
    accountId?: string | null;
    bankName?: string | null;
    currentBalance?: number | null;
    isoCurrencyCode?: string | null;
    name?: string | null;
    mask?: string | null;
  };
  onEdit?: () => void;
  onDelete?: () => void;
};

export const AccountCard = ({
  account,
  onEdit,
  onDelete,
}: AccountCardProps) => {
  const [opened, setOpened] = useState(false);
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

      <Menu opened={opened} onChange={setOpened}>
        <Menu.Target>
          <IconDots
            className={`ml-auto cursor-pointer rounded-full p-[.125rem] text-black/80 transition hover:bg-stone-300 hover:shadow active:translate-y-[1px] ${opened && "bg-stone-300"}`}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={onEdit}>Edit</Menu.Item>
          <Menu.Item onClick={onDelete} className="font-bold text-red-500">
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};
