import Link from "next/link";
import { useRouter } from "next/router";
import { type ReactNode } from "react";

type Props = {
  text: string;
  href: string;
  leftSection?: ReactNode;
};

export const NavLink = ({ text, href, leftSection }: Props) => {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg p-4 font-bold transition hover:bg-slate-200 ${router.pathname === href && "bg-slate-200"}`}
    >
      {leftSection}
      {text}
    </Link>
  );
};
