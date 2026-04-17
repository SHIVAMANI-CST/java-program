"use client";

import dayjs from "dayjs";
import { Receipt } from "lucide-react";
import React, { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminTableStyles } from "@/constants/adminConstants";
import { paymentInformation } from "@/graph/API";
import { useAdminTransactions } from "@/hooks/admin/useAdminTransactions";
import CustomDataTable from "@/utils/CustomDataTable";

export default function TransactionsPage() {
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, error } = useAdminTransactions();

  const transactionsList = data?.transactions || [];
  const totalCount = data?.totalCount || 0;

  const filteredTransactions = transactionsList.filter(
    (item): item is paymentInformation =>
      !!item &&
      ((item.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.orderId || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.method || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.status || "").toLowerCase().includes(searchText.toLowerCase()) ||
        String(item.amount || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (item.paymentInfoId || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()))
  );

  const columns = [
    {
      name: "Order ID",
      selector: (row: paymentInformation) => row.orderId || "",
      sortable: true,
      cell: (row: paymentInformation) => (
        <span className="text-sm font-medium text-gray-900">
          {row.orderId || "N/A"}
        </span>
      ),
      width: "18%",
    },
    {
      name: "User",
      selector: (row: paymentInformation) => row.email || "",
      sortable: true,
      cell: (row: paymentInformation) => (
        <span
          className="font-semibold text-gray-900 truncate"
          title={row.email || ""}
        >
          {row.email}
        </span>
      ),
      width: "22%",
    },
    {
      name: "Amount",
      selector: (row: paymentInformation) => row.amount || 0,
      sortable: true,
      cell: (row: paymentInformation) => (
        <span className="text-sm font-bold text-gray-900">
          {row.currency || "USD"} {((row.amount || 0) / 100).toFixed(2)}
        </span>
      ),
      width: "12%",
    },
    {
      name: "Method",
      selector: (row: paymentInformation) => row.method || "",
      sortable: true,
      cell: (row: paymentInformation) => (
        <span className="capitalize text-gray-600 text-sm">
          {(row.method || row.card || "N/A").toLowerCase() === "upi"
            ? "UPI" : (row.method || row.card || "N/A").toLowerCase() === "netbanking"
            ? "Net Banking"
            : row.method || row.card || "N/A"}
        </span>
      ),
      width: "12%",
    },
    {
      name: "Status",
      selector: (row: paymentInformation) => row.status || "",
      sortable: true,
      cell: (row: paymentInformation) => (
        <StatusBadge status={row.status || ""} />
      ),
      width: "12%",
    },
    {
      name: "Date",
      selector: (row: paymentInformation) => row.createdAt || "",
      sortable: true,
      cell: (row: paymentInformation) => (
        <span className="text-gray-500 text-sm">
          {row.createdAt
            ? dayjs(row.createdAt).format("MMM D, YYYY h:mm A")
            : "N/A"}
        </span>
      ),
      width: "24%",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transactions"
        count={totalCount}
        searchPlaceholder="Search order ID or email..."
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <CustomDataTable
        columns={columns}
        data={filteredTransactions}
        isLoading={isLoading}
        error={
          error ? "Error loading transactions. Please try again later." : null
        }
        noDataMessage={
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Receipt size={48} className="mb-4 opacity-20" />
            <p>No transactions found</p>
          </div>
        }
        customStyles={adminTableStyles}
      />
    </div>
  );
}
