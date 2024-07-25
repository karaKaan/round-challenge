import { useState, type ReactNode } from "react";
import {
  Avatar,
  AppShell as MantineAppShell,
  Menu,
  Text,
  Title,
} from "@mantine/core";
import { NavLink } from "../Link/NavLink/NavLink";
import {
  IconBriefcase,
  IconChartCandle,
  IconChevronLeft,
  IconChevronRight,
  IconLayout2,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const session = useSession();
  const [opened, setOpened] = useState(false);
  return (
    <MantineAppShell navbar={{ width: 250, breakpoint: "sm" }} padding={"md"}>
      <MantineAppShell.Navbar p="lg">
        <Title className="mb-10 text-5xl font-black">Round.</Title>
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-2">
            <NavLink
              href="#"
              text="Home"
              leftSection={<IconLayout2 size={"1rem"} />}
            />
            <NavLink
              href="/"
              text="Accounts"
              leftSection={<IconBriefcase size={"1rem"} />}
            />
            <NavLink
              href="#"
              text="Portfolio"
              leftSection={<IconChartCandle size={"1rem"} />}
            />
          </div>
          <Menu
            shadow="md"
            width={200}
            position="right-end"
            offset={40}
            opened={opened}
            onChange={setOpened}
          >
            <Menu.Target>
              <div className="flex cursor-pointer items-center gap-3">
                <Avatar src={session.data?.user.image} />
                <Text className="flex w-full items-center justify-between font-bold">
                  {session.data?.user.name}
                  {opened ? (
                    <IconChevronLeft size={"1rem"} />
                  ) : (
                    <IconChevronRight size={"1rem"} />
                  )}
                </Text>
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>General</Menu.Label>
              <Menu.Item>Settings</Menu.Item>
              <Menu.Item onClick={() => signOut()} className="text-red-500">
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </MantineAppShell.Navbar>
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
};
