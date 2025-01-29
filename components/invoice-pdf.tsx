import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { IInvoice } from '@/lib/models/invoice';
import { formatCurrency } from '@/lib/format';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  value: {
    fontSize: 12,
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
});

interface InvoicePDFProps {
  invoice: IInvoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.subtitle}>Invoice Date: {invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'Not yet invoiced'}</Text>
          {invoice.datePaid && (
            <Text style={styles.subtitle}>Paid Date: {new Date(invoice.datePaid).toLocaleDateString()}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{invoice.client}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Episode Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Episode Title:</Text>
            <Text style={styles.value}>{invoice.episodeTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{invoice.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Length:</Text>
            <Text style={styles.value}>
              {`${invoice.length.hours}h ${invoice.length.minutes}m ${invoice.length.seconds}s`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Billed Minutes:</Text>
            <Text style={styles.value}>{invoice.billedMinutes} minutes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Billing Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Rate per Minute:</Text>
            <Text style={styles.value}>{formatCurrency(invoice.ratePerMinute)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Billable Hours:</Text>
            <Text style={styles.value}>{invoice.billableHours} hours</Text>
          </View>
          {invoice.note && (
            <View style={styles.row}>
              <Text style={styles.label}>Note:</Text>
              <Text style={styles.value}>{invoice.note}</Text>
            </View>
          )}
        </View>

        <View style={[styles.section, styles.total]}>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.invoicedAmount)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
} 