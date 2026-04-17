// app/api/download-invoice/route.tsx 
import { renderToBuffer } from '@react-pdf/renderer';
import { NextRequest, NextResponse } from 'next/server';
import InvoiceTemplate, { InvoiceData } from "@/components/settings/Billing/InvoiceTemplate";

export async function POST(req: NextRequest) {
  try {
    const invoiceData: InvoiceData = await req.json();

    // Validate required fields
    if (!invoiceData.referenceId || !invoiceData.planName) {
      return NextResponse.json(
        { message: 'Missing required invoice data' }, 
        { status: 400 }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoiceTemplate invoiceData={invoiceData} />
    );

    // Convert Node.js Buffer to Uint8Array for NextResponse
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // Create response with proper headers for device download
    const response = new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        ["Content-Type"]: 'application/pdf',
        ["Content-Length"]: pdfUint8Array.length.toString(),
        ["Content-Disposition"]: `attachment; filename="Cinfy-AI-Invoice-${invoiceData.referenceId}.pdf"`,
        ["Cache-Control"]: 'no-cache, no-store, must-revalidate',
        ["Pragma"]: 'no-cache',
        ["Expires"]: '0',
      },
    });

    return response;
    
  } catch {
    return NextResponse.json(
      { message: "Error generating invoice" },
      { status: 500 }
    );
  }
}
