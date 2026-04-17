// utils/downloadInvoice.ts

import logger from "./logger/browserLogger";
import { InvoiceData } from "@/components/settings/Billing/InvoiceTemplate";

interface TransactionData {
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
  platformFee?: string;
  tax?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export const downloadInvoiceToDevice = async (
  transactionData: TransactionData,
  userData: UserData
) => {
  try {
    // Prepare customer name
    const customerName =
      userData.firstName || userData.lastName
        ? `${userData.firstName} ${userData.lastName}`.trim()
        : userData.email;

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      // Customer Info
      customerName,
      customerEmail: userData.email,

      // Invoice Details
      invoiceNumber: transactionData.referenceId,
      invoiceDate: transactionData.date,

      // Transaction Details
      planName: transactionData.plan,
      amount: transactionData.amount,
      currency: transactionData.currency,
      referenceId: transactionData.referenceId,
      paymentStatus: transactionData.status,
      paymentMethod: transactionData.paymentMethod,

      // Billing Period
      billingPeriodStart: transactionData.billingPeriodStart,
      billingPeriodEnd: transactionData.billingPeriodEnd,

      // Breakdown
      planPrice: transactionData.planPrice,
      platformFee: transactionData.platformFee,
      tax: transactionData.tax,
    };

    // Make API request to generate PDF
    const response = await fetch("/api/download-invoice", {
      method: "POST",
      headers: {
        ["Content-Type"]: "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // Check if response is actually a PDF
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/pdf")) {
      throw new Error("Invalid response format. Expected PDF file.");
    }

    // Get the PDF blob from response
    const blob = await response.blob();

    // Ensure we have a valid blob
    if (blob.size === 0) {
      throw new Error("Received empty file. Please try again.");
    }

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element for download
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cinfy-AI-Invoice-${invoiceData.referenceId}.pdf`;

    // Make the link invisible
    link.style.display = "none";

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    logger.error("Error downloading invoice:", error);
  }
};
