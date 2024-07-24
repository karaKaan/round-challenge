import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { MantineProvider } from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@/styles/globals.css";
import { useEffect, useState } from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { mutate } = api.bank.createLinkToken.useMutation({
    onSuccess: (data) => setLinkToken(data?.linkToken ?? null),
    onError: (error) => console.error(error),
  });
  useEffect(() => {
    mutate();
  }, []);

  return (
    <SessionProvider session={session}>
      <MantineProvider>
        <div className={GeistSans.className}>
          <Component {...pageProps} linkToken={linkToken} />
        </div>
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
