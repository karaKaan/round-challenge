import {
  Box,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Select,
  Skeleton,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { AppShell } from "../components/AppShell/AppShell";
import { IconCalendar, IconCreditCard, IconPlus } from "@tabler/icons-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { type GetServerSideProps } from "next";
import { api } from "@/utils/api";
import {
  type PlaidLinkOnSuccessMetadata,
  usePlaidLink,
} from "react-plaid-link";
import { useEffect, useState } from "react";
import { calculateTotalBalance } from "@/utils/calculateTotalBalance";
import { useQueryClient } from "@tanstack/react-query";
import { formatRunway } from "@/utils/formatRunway";
import { AccountCard } from "@/components/Card/AccountCard/AccountCard";
import { LinkBankAccountCard } from "@/components/Card/LinkBankAccountCard/LinkBankAccountCard";
import { CardWithGraph } from "@/components/Card/CardWithGraph/CardWithGraph";
import dayjs from "dayjs";

type Props = {
  linkToken: string;
};

export default function Home({ linkToken }: Props) {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const { mutate: exchangePublicToken } =
    api.bank.exchangePublicToken.useMutation({
      onSuccess: () => {
        void queryClient.invalidateQueries("getAccounts");
      },
    });

  const { data, isLoading, refetch } = api.bank.getAccounts.useQuery();

  const { data: getTransactions, isFetching: transactionIsFetching } =
    api.bank.getTransactions.useQuery({
      accountId: selectedAccountId,
      startDate: dateRange[0]?.toString(),
      endDate: dateRange[1]?.toString(),
    });
  const { data: getMonthlyIncomeAndSpend } =
    api.bank.getMonthlyIncomeAndSpend.useQuery();

  useEffect(() => {
    void queryClient.invalidateQueries("getTransactions");
  }, [selectedAccountId, dateRange, queryClient]);

  const config = {
    token: linkToken,
    onSuccess: async (
      publicToken: string,
      metadata: PlaidLinkOnSuccessMetadata,
    ) => {
      exchangePublicToken({
        publicToken,
        accounts: metadata.accounts,
        institutionId: metadata.institution?.institution_id,
        institutionName: metadata.institution?.name,
      });
    },
    onExit: (err: unknown, metadata: unknown) => {
      console.log({ err, metadata });
    },
  };
  console.log(data);
  const { open, ready } = usePlaidLink(config);

  const handleLinkBankAccount = () => {
    open();
  };
  console.log(ready);

  return (
    <AppShell>
      <div className="relative">
        {isLoading && (
          <LoadingOverlay
            visible={true}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 8 }}
          />
        )}

        <Flex align={"center"} justify={"space-between"} className="pb-10">
          <Flex direction={"column"}>
            <Title>Accounts</Title>
            <Text c="dimmed">Add or manage your linked bank accounts</Text>
          </Flex>

          <Button
            onClick={handleLinkBankAccount}
            disabled={!ready}
            leftSection={<IconPlus size={"1.1rem"} />}
          >
            Link bank account
          </Button>
        </Flex>
        {data?.accounts && (
          <>
            <Box className="pb-5">
              <Text className="font-bold text-black/80">
                Total account balance ({data?.accounts.length} accounts)
              </Text>
              <Text className="text-2xl font-bold">
                {data?.accounts &&
                  calculateTotalBalance({
                    accountBalances: data.accounts.map((account) => {
                      return {
                        currentBalance: account.currentBalance ?? 0,
                        isoCurrencyCode: account.isoCurrencyCode ?? "",
                      };
                    }),
                    isoCurrencyCode: "EUR",
                  })}{" "}
                EUR
              </Text>
            </Box>
            <Flex gap={"lg"} className="mb-5">
              {data?.accounts?.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  onOptionClick={() => {
                    console.log();
                  }}
                />
              ))}
              <LinkBankAccountCard
                onClick={handleLinkBankAccount}
                icon={<IconPlus size={"1rem"} />}
                title="Link bank account"
                text="Click to link another bank account"
              />
            </Flex>

            <Group grow className="mb-5">
              {getMonthlyIncomeAndSpend?.runway && (
                <CardWithGraph
                  title="Runway & Cash Zero"
                  text={formatRunway(getMonthlyIncomeAndSpend.runway)}
                  subText={dayjs()
                    .add(getMonthlyIncomeAndSpend.runway, "month")
                    .format("D MMM YYYY")}
                />
              )}
              <CardWithGraph
                title="Monthly Spend"
                text={`${getMonthlyIncomeAndSpend?.totalSpend} EUR`}
                subText="10% from last month"
                img={{ src: "/sampleBarChart.svg", alt: "Sample alt text" }}
              />
              <CardWithGraph
                title="Monthly Income"
                text={`${getMonthlyIncomeAndSpend?.totalIncome} EUR`}
                subText="10% from last month"
                img={{ src: "/sampleBarChart.svg", alt: "Sample alt text" }}
              />
            </Group>
            <div className="rounded-lg bg-stone-200 p-3">
              <Flex className="mb-4 gap-2">
                <DatePickerInput
                  type="range"
                  label="Date"
                  clearable
                  placeholder="Pick a Date"
                  leftSection={<IconCalendar size={"1rem"} />}
                  value={dateRange}
                  onChange={(data) => {
                    setDateRange(data);
                  }}
                />
                <Select
                  data={data?.accounts.map((account) => {
                    return {
                      label: account.name ?? "",
                      value: account.accountId ?? "",
                    };
                  })}
                  clearable
                  leftSection={<IconCreditCard size={"1rem"} />}
                  label="Account"
                  placeholder="Choose your Account"
                  value={selectedAccountId}
                  onChange={setSelectedAccountId}
                />
              </Flex>
              <Table
                data={{
                  head: [
                    "Date",
                    "To/From",
                    "Amount",
                    "Payment Method",
                    "Bank",
                    "Account",
                  ],
                  body: transactionIsFetching
                    ? [
                        [
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                        ],
                        [
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                        ],
                        [
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                          <Skeleton key={1} height={20} />,
                        ],
                      ]
                    : getTransactions,
                }}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
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
