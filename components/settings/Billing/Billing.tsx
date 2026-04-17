"use client";
import { Tooltip } from "@mui/material";
import { Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Button from "@/components/global-components/Button";
import GradientBackground from "@/components/global-components/GradientBackground";
import { gradientTextClass } from "@/constants/constants";
import { ROUTES } from "@/constants/routes";
import { useGetUser } from "@/hooks/useGetUser";
import { useListUserSubscriptions } from "@/hooks/useListUserSubscriptions";
import { useUserId } from "@/lib/getUserId";
import { formatDisplayDate, getBillingDate } from "@/utils/dateUtils";
import { createDate } from "@/utils/dateUtils";
import { downloadInvoiceToDevice } from "@/utils/downloadInvoice";
import logger from "@/utils/logger/browserLogger";
import {
  getPaymentStatusLabel,
  formatCurrency,
} from "@/utils/subscriptionUtils";
import { customtransactionsStyles } from "@/utils/uiStyles";

type Transaction = {
  id: number;
  plan: string;
  date: string;
  amount: string;
  referenceId: string;
  status: string;
  currency?: string;
  paymentMethod?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  planPrice?: string;
  tax?: string;
  platformFee?: string;
};

const BillingScreen = () => {
  const router = useRouter();
  const userId = useUserId();
  const { data: userSubscriptions = [] } = useListUserSubscriptions(userId);
  const { data: userData } = useGetUser(userId ?? "");
  const [isOnlyFreePlan, setIsOnlyFreePlan] = useState(false);
  const [downloadingInvoices, setDownloadingInvoices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const onlyFree = localStorage.getItem("onlyFreePlan") === "true";
    setIsOnlyFreePlan(onlyFree);
  }, []);

  const latestSub =
    [...userSubscriptions]
      .filter((s) => s.status === "ACTIVE")
      .sort(
        (a, b) =>
          createDate(b.startDate ?? b.createdAt).valueOf() -
          createDate(a.startDate ?? a.createdAt).valueOf()
      )[0] ?? null;

  const currentPlan = latestSub?.plan;
  const isPaidPlan = currentPlan?.planType === "PAID";

  const transactions = [...userSubscriptions]
    .sort((a, b) => {
      const dateA = createDate(
        a.paymentInformation?.createdAt ?? a.createdAt
      ).valueOf();
      const dateB = createDate(
        b.paymentInformation?.createdAt ?? b.createdAt
      ).valueOf();
      return dateB - dateA; // latest first
    })
    .map((sub, index) => {
      const payment = sub.paymentInformation;
      const date = payment?.createdAt || sub.createdAt;

      const isFreePlan = sub.plan?.planType === "FREE";
      const status = isFreePlan ? "Free" : (payment?.status ?? "NA");

      return {
        id: index + 1,
        plan: sub.plan?.planName ?? "N/A",
        date: formatDisplayDate(date),
        status,
        amount: formatCurrency(payment?.totalPrice, payment?.currency),
        referenceId: payment?.orderId ?? "NA",
        currency: payment?.currency ?? "NA",
        paymentMethod: payment?.method ?? "NA",
        billingPeriodStart: sub.startDate
          ? formatDisplayDate(sub.startDate)
          : undefined,
        billingPeriodEnd: sub.endDate
          ? formatDisplayDate(sub.endDate)
          : undefined,
        planPrice: formatCurrency(sub.plan?.price, payment?.currency),
        tax: payment?.tax
          ? formatCurrency(payment.tax / 100, payment?.currency)
          : undefined,
        platformFee: payment?.platformFee
          ? formatCurrency(payment.platformFee / 100, payment?.currency)
          : undefined,
      };
    });

  const handleUpgarde = () => {
    localStorage.setItem("isUpgradeClicked", "true");
    router.push(ROUTES.SUBSCRIPTION);
  };

  // Handle invoice download
  const handleInvoiceDownload = async (row: Transaction) => {
    const referenceId = row.referenceId;

    // Prevent multiple downloads of the same invoice
    if (downloadingInvoices.has(referenceId)) {
      return;
    }

    if (!userData) {
      return;
    }

    setDownloadingInvoices((prev) => new Set(prev).add(referenceId));

    try {
      await downloadInvoiceToDevice(
        {
          id: row.id,
          plan: row.plan,
          date: row.date,
          amount: row.amount,
          referenceId: row.referenceId,
          currency: row.currency,
          status: row.status,
          paymentMethod: row.paymentMethod,
          billingPeriodStart: row.billingPeriodStart,
          billingPeriodEnd: row.billingPeriodEnd,
          planPrice: row.planPrice,
          tax: row.tax,
          platformFee: row.platformFee,
        },
        {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email ?? "",
        }
      );
    } catch (error) {
      logger.error("Failed to download invoice:", error);
    } finally {
      setDownloadingInvoices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(referenceId);
        return newSet;
      });
    }
  };

  const [search, setSearch] = useState("");

  const removeSpaces = (str: string) => str.replaceAll(" ", "");
  const filteredData = transactions.filter((item) => {
    const searchStr = removeSpaces(search.toLowerCase()).replaceAll(",", "");
    const amountNum = parseFloat(search.replaceAll(",", ""));

    return (
      removeSpaces(item.plan.toLowerCase()).includes(searchStr) ||
      removeSpaces(item.date.toLowerCase()).includes(searchStr) ||
      removeSpaces(item.referenceId.toLowerCase()).includes(searchStr) ||
      removeSpaces(
        getPaymentStatusLabel(item.status).label.toLowerCase()
      ).includes(searchStr) ||
      removeSpaces(item.amount.toString())
        .replaceAll(",", "")
        .includes(searchStr) ||
      (!isNaN(amountNum) && Number(item.amount) === amountNum)
    );
  });

  const columns: TableColumn<Transaction>[] = [
    { name: "S.No", selector: (row) => row.id, sortable: true, width: "80px" },
    { name: "Plan", selector: (row) => row.plan, sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Amount", selector: (row) => row.amount, sortable: true },
    {
      name: "Reference Id",
      selector: (row) => row.referenceId,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span className={getPaymentStatusLabel(row.status).className}>
          {getPaymentStatusLabel(row.status).label}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Invoice",
      cell: (row) => {
        const isDownloading = downloadingInvoices.has(row.referenceId);

        return row.status === "Free" ? (
          <span className="text-gray-400 cursor-not-allowed">—</span>
        ) : (
          <span
            onClick={() => !isDownloading && handleInvoiceDownload(row)}
            className="text-[#6A2AFFF2] underline cursor-pointer flex items-center gap-2"
          >
            {isDownloading && (
              <div className="animate-spin h-4 w-4 border-2 border-solid border-[#6A2AFFF2] border-t-transparent rounded-full"></div>
            )}
            Invoice
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white relative overflow-hidden">
      <GradientBackground />
      {/* Header */}
      <div className="flex items-center gap-1 mb-2 md:mb-2 lg:mb-2 xl:mb-2">
        <h1 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold">
          Billing & Payment Details
        </h1>

        <Tooltip
          title="Manage your subscription, invoices, and payment methods."
          placement="right"
        >
          <Info className="text-black w-3 h-3 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3" />
        </Tooltip>
      </div>

      <p className="text-[#1D2026] mb-7 lg:mb-5 xl:mb-7 text-sm lg:text-xs xl:text-sm font-normal">
        Manage your payment methods, billing email, and view all your past
        transactions in one place.
      </p>
      {/* Current Plan Card */}
      <div className="w-full rounded-2xl lg:rounded-xl xl:rounded-2xl p-2 lg:p-1.5 xl:p-2 px-5 lg:px-4 xl:px-5 border border-[#FF855E] text-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-3 xl:gap-4 mb-8 lg:mb-6 xl:mb-8">
        <div>
          <h2
            className={`text-xl lg:text-lg xl:text-xl font-bold w-fit ${gradientTextClass}`}
          >
            {currentPlan?.planName ?? "N/A"}
          </h2>
          <p className="text-sm lg:text-xs xl:text-sm font-medium mt-1 lg:mt-0.5 xl:mt-1 text-gray-500">
            {currentPlan?.description ?? "N/A"}.
            {currentPlan?.features?.length
              ? ` Ideal for ${currentPlan.features.join(", ")}.`
              : ""}
          </p>
          <div className="mt-1 lg:mt-0.5 xl:mt-1 text-sm lg:text-xs xl:text-sm">
            <span className="text-gray-500 font-medium">
              Next billing date:
            </span>{" "}
            <span className="font-medium">
              {getBillingDate(latestSub?.endDate)}
            </span>
          </div>
          {/* <div className="mt-1 text-sm">
            <span className="text-gray-500 font-medium">Current usage:</span>{" "}
            <span className="font-medium">N/A</span>
          </div> */}
        </div>
        {!isPaidPlan && (
          <div className="relative group">
            <Button
              title={isOnlyFreePlan ? "No plans to upgrade" : "Upgrade"}
              onClick={handleUpgarde}
              disabled={isOnlyFreePlan}
              variant="gradient"
              buttonWidth="md"
            >
              Upgrade
            </Button>
            {isOnlyFreePlan && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                No plans to upgrade
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md py-2 pl-4 pr-10 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#FF855E] border-2 border-[#E5E7EB]"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border-2 border-[#E5E7EB]">
        <DataTable<Transaction>
          columns={columns}
          // data={transactions}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          responsive
          defaultSortFieldId={1}
          defaultSortAsc={true}
          customStyles={customtransactionsStyles}
        />
      </div>
    </div>
  );
};

export default BillingScreen;
