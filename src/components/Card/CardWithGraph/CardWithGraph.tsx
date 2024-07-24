import { Text } from "@mantine/core";
import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  text: string | number;
  subText?: string;
  img?: {
    src: string;
    alt: string;
  };
};

export const CardWithGraph = ({ title, text, subText, img }: Props) => {
  return (
    <div className="min-h-48 w-full rounded-lg bg-stone-200 p-3">
      <Text className="mb-2 text-sm font-bold text-black/80">{title}</Text>
      <Text className="mb-1 text-xl font-bold">{text}</Text>
      <Text className="mb-2 text-xs font-bold text-black/50">{subText}</Text>
      {img && <Image src={img.src} alt={img.alt} width={500} height={500} className="text-end" />}
    </div>
  );
};
