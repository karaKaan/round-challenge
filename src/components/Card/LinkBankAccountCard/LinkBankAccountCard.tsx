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
      className="flex min-h-32 w-full max-w-80 cursor-pointer select-none flex-col items-center justify-center rounded-lg bg-stone-200 p-3 transition hover:shadow active:translate-y-[1px]"
      onClick={onClick}
    >
      <Text className="flex items-center justify-center font-bold">
        {icon} {title}
      </Text>
      <Text className="text-sm font-bold text-black/50">{text}</Text>
    </div>
  );
};
