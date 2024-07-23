import { type ReactNode } from "react";
import { AppShell as MantineAppShell } from "@mantine/core";

type Props = {
  children: ReactNode;
};

export const AppShell = ({children}: Props) => {
  return (
    <MantineAppShell
      // header={{ height: 60 }}
      navbar={{ width: 400, breakpoint: "sm" }}
      padding={"md"}
    >
      {/* <AppShell.Header>header</AppShell.Header> */}
      <MantineAppShell.Navbar>NAVBAR</MantineAppShell.Navbar>
      <MantineAppShell.Main>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
};
