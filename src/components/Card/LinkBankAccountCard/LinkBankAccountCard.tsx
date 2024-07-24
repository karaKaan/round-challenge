import { Text } from "@mantine/core";
import { IconDots, IconDotsCircleHorizontal } from "@tabler/icons-react";
import { type ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  text: string;
  onClick?: () => void;
};

export const LinkBankAccountCard = ({ icon, title, text, onClick }: Props) => {
  return (
    <div
      key={`${title}-${text}`}
      className="flex w-full max-w-80 cursor-pointer min-h-32 select-none flex-col items-center justify-center rounded-lg bg-stone-200 p-3 transition hover:shadow"
      onClick={onClick}
    >
      <Text className="flex items-center justify-center font-bold ">
        {icon} {title}
      </Text>
      <Text className="font-bold text-sm text-black/50">{text}</Text>
    </div>
  );
};
