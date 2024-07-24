type TransactionTableProps = {
  dateRange: [Date | null, Date | null];
  setDateRange: (data: [Date | null, Date | null]) => void;
  data: any;
  selectedAccountId: string | null;
  setSelectedAccountId: (value: string | null) => void;
  transactionIsFetching: boolean;
  getTransactions: any;
};

const TransactionsTable = (props: TransactionTableProps) => {
  return <div>TransactionsTable</div>;
};
