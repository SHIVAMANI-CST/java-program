// components/Billing/InvoiceTemplate.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import React from "react";

export interface InvoiceData {
  // Customer Info
  customerName: string;
  customerEmail: string;

  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;

  // Transaction Details
  planName: string;
  amount: string;
  currency?: string;
  referenceId: string;
  paymentStatus: string;
  paymentMethod?: string;

  // Billing Period
  billingPeriodStart?: string;
  billingPeriodEnd?: string;

  // Breakdown
  planPrice?: string;
  platformFee?: string;
  tax?: string;
}

// PDF Styles (same as before)
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#FF855E",
  },
  companySection: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF855E",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
    marginTop: 5,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  detailsColumn: {
    width: "48%",
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
    color: "#333",
    fontWeight: "bold",
  },
  table: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    fontSize: 11,
    color: "#333",
  },
  descriptionCell: {
    width: "40%",
  },
  periodCell: {
    width: "35%",
  },
  amountCell: {
    width: "25%",
    textAlign: "right",
  },
  totalSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666",
  },
  summaryValue: {
    fontSize: 11,
    color: "#333",
    fontWeight: "bold",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
    marginTop: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF855E",
  },
  paymentInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#6A2AFF",
  },
  paymentInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginBottom: 3,
  },
  thankYou: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FF855E",
    textAlign: "center",
    marginTop: 5,
  },
});

const InvoiceTemplate: React.FC<{ invoiceData: InvoiceData }> = ({
  invoiceData,
}) => {
  const currentDate = dayjs().format("DD MMM YYYY");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companySection}>
            <Svg width={100} height={35} style={{ marginBottom: 5 }}>
              <Defs>
                <LinearGradient
                  id="companyGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="0"
                >
                  <Stop offset="0%" stopColor="#ff855e" />
                  <Stop offset="35%" stopColor="#ffa386" />
                  <Stop offset="100%" stopColor="#ad8cfa" />
                </LinearGradient>
              </Defs>
              <Text
                x="0"
                y="24"
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  fontFamily: "Helvetica-Bold",
                }}
                fill="url('#companyGradient')"
              >
                CinfyAI
              </Text>
            </Svg>
            <Text style={styles.companyDetails}>support@cinfy.ai</Text>
            <Text style={styles.companyDetails}>www.cinfy.ai</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              #{invoiceData.invoiceNumber}
            </Text>
            <Text style={styles.invoiceNumber}>{currentDate}</Text>
          </View>
        </View>

        {/* Bill To & Invoice Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.value}>{invoiceData.customerName}</Text>
            <Text style={styles.label}>{invoiceData.customerEmail}</Text>
          </View>
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Invoice Date</Text>
              <Text style={styles.value}>{invoiceData.invoiceDate}</Text>
            </View>
            <View>
              <Text style={styles.label}>Reference ID</Text>
              <Text style={styles.value}>{invoiceData.referenceId}</Text>
            </View>
          </View>
        </View>

        {/* Service Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.periodCell]}>
              Billing Period
            </Text>
            <Text style={[styles.tableHeaderCell, styles.amountCell]}>
              Amount
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.descriptionCell]}>
              {invoiceData.planName}
            </Text>
            <Text style={[styles.tableCell, styles.periodCell]}>
              {invoiceData.billingPeriodStart && invoiceData.billingPeriodEnd
                ? `${invoiceData.billingPeriodStart} - ${invoiceData.billingPeriodEnd}`
                : "N/A"}
            </Text>
            <Text style={[styles.tableCell, styles.amountCell]}>
              {invoiceData.planPrice || invoiceData.amount}
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          {invoiceData.planPrice && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{invoiceData.planPrice}</Text>
            </View>
          )}
          {invoiceData.platformFee && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee</Text>
              <Text style={styles.summaryValue}>{invoiceData.platformFee}</Text>
            </View>
          )}
          {invoiceData.tax && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{invoiceData.tax}</Text>
            </View>
          )}
          {(invoiceData.planPrice ||
            invoiceData.platformFee ||
            invoiceData.tax) && <View style={styles.divider} />}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>{invoiceData.amount}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>Payment Information</Text>
          <Text style={styles.paymentInfoText}>
            Payment Status:{" "}
            {invoiceData.paymentStatus.toLowerCase() === "captured"
              ? "Completed"
              : invoiceData.paymentStatus}
          </Text>
          {invoiceData.paymentMethod && (
            <Text style={styles.paymentInfoText}>
              Payment Method: {invoiceData.paymentMethod}
            </Text>
          )}
          <Text style={styles.paymentInfoText}>
            Transaction ID: {invoiceData.referenceId}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer-generated invoice and does not require a
            signature.
          </Text>
          <Text style={styles.footerText}>
            For any queries, please contact support@cinfy.ai
          </Text>
          <Text style={styles.thankYou}>Thank you for choosing Cinfy AI!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
