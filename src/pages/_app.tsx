import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MantineProvider>
        <div className={GeistSans.className}>
          <Component {...pageProps} />
        </div>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
