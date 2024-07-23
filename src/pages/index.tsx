import { Button, Flex, Group, Text, Title } from "@mantine/core";
import { AppShell } from "../components/AppShell/AppShell";
import { IconPlus } from "@tabler/icons-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { type GetServerSideProps } from "next";

export default function Home() {
  return (
    <AppShell>
      <Flex align={"center"} justify={"space-between"}>
        <Flex direction={"column"}>
          <Title>Accounts</Title>
          <Text c="dimmed">Add or manage your linked bank accounts</Text>
        </Flex>

        <Button leftSection={<IconPlus size={"1.1rem"} />}>
          Link bank account
        </Button>
      </Flex>
    </AppShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  console.log(session);
  if(!session){
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  return {
    props: {
      session
    },
  };
};
