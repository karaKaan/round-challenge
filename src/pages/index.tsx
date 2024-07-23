import { Button, Flex, Group, Text, Title } from "@mantine/core";
import { AppShell } from "../components/AppShell/AppShell";
import { IconPlus } from "@tabler/icons-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { type GetServerSideProps } from "next";
import { api } from "@/utils/api";
import { usePlaidLink } from "react-plaid-link";
import { useCallback, useEffect, useState } from "react";
import { on } from "events";

export default function Home() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { mutate } = api.bank.createLinkToken.useMutation({
    onSuccess: (data) => setLinkToken(data?.linkToken ?? null),
    onError: (error) => console.error(error),
  });
  const { mutate: exchangePublicToken } =
    api.bank.exchangePublicToken.useMutation();
  const config = {
    token: linkToken,
    onSuccess: (publicToken: string, metadata: unknown) => {
      console.log({ publicToken, metadata });
      exchangePublicToken({ publicToken });
    },
    onExit: (err: unknown, metadata: unknown) => {
      console.log({ err, metadata });
    },
  };

  const { open, ready } = usePlaidLink(config);
  const generateToken = async () => {
    mutate();
  };

  const handleLinkBankAccount = async () => {
    if (linkToken) {
      open();
    } else {
      await generateToken();
      await open();
    }
  };

  return (
    <AppShell>
      <Flex align={"center"} justify={"space-between"}>
        <Flex direction={"column"}>
          <Title>Accounts</Title>
          <Text c="dimmed">Add or manage your linked bank accounts</Text>
        </Flex>

        <Button
          onClick={handleLinkBankAccount}
          leftSection={<IconPlus size={"1.1rem"} />}
          disabled={!ready}
        >
          Link bank account
        </Button>
      </Flex>
    </AppShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  console.log(session);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};
