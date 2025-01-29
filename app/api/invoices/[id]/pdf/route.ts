import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice } from '@/lib/models/invoice';
import { formatCurrency } from '@/lib/format';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const invoice = await Invoice.findById(params.id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return new Promise<NextResponse>((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        // Collect the PDF data chunks
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="invoice-${invoice._id}.pdf"`,
            },
          }));
        });

        // Header
        doc.fontSize(24).text('Invoice', { align: 'left' });
        doc.moveDown();
        doc.fontSize(14).text(`Invoice Date: ${invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'Not yet invoiced'}`);
        if (invoice.datePaid) {
          doc.text(`Paid Date: ${new Date(invoice.datePaid).toLocaleDateString()}`);
        }
        doc.moveDown();

        // Client Information
        doc.fontSize(16).text('Client Information');
        doc.fontSize(12).text(`Client: ${invoice.client}`);
        doc.moveDown();

        // Episode Details
        doc.fontSize(16).text('Episode Details');
        doc.fontSize(12);
        doc.text(`Episode Title: ${invoice.episodeTitle}`);
        doc.text(`Type: ${invoice.type}`);
        doc.text(`Length: ${invoice.length.hours}h ${invoice.length.minutes}m ${invoice.length.seconds}s`);
        doc.text(`Billed Minutes: ${invoice.billedMinutes} minutes`);
        doc.moveDown();

        // Billing Details
        doc.fontSize(16).text('Billing Details');
        doc.fontSize(12);
        doc.text(`Rate per Minute: ${formatCurrency(invoice.ratePerMinute)}`);
        doc.text(`Billable Hours: ${invoice.billableHours} hours`);
        if (invoice.note) {
          doc.text(`Note: ${invoice.note}`);
        }
        doc.moveDown();

        // Total
        doc.fontSize(16).text('Total Amount', { continued: true });
        doc.text(`${formatCurrency(invoice.invoicedAmount)}`, { align: 'right' });
        doc.moveDown();

        // Footer
        doc.fontSize(10)
          .text('Thank you for your business!', 0, doc.page.height - 50, {
            align: 'center'
          });

        // End the document
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 
