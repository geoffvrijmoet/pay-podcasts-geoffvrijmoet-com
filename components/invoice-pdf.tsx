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
  gridContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
  },
  gridCol1: {
    flex: 2,
  },
  gridCol2: {
    flex: 1,
    textAlign: 'right',
  },
  gridCol3: {
    flex: 1,
    textAlign: 'right',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cellText: {
    fontSize: 12,
    color: '#444',
  },
  clientInfo: {
    marginBottom: 30,
  },
  totalContainer: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
          <Text style={styles.subtitle}>Invoice #{invoice.id}</Text>
          <Text style={styles.subtitle}>Invoice Date: {invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'Not yet invoiced'}</Text>
          {invoice.datePaid && (
            <Text style={styles.subtitle}>Paid Date: {new Date(invoice.datePaid).toLocaleDateString()}</Text>
          )}
        </View>

        <View style={styles.clientInfo}>
          <Text style={styles.subtitle}>Bill To:</Text>
          <Text style={styles.cellText}>{invoice.client}</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridHeader}>
            <View style={styles.gridCol1}>
              <Text style={styles.headerText}>Description</Text>
            </View>
            <View style={styles.gridCol2}>
              <Text style={styles.headerText}>Quantity</Text>
            </View>
            <View style={styles.gridCol3}>
              <Text style={styles.headerText}>Amount</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol1}>
              <Text style={styles.cellText}>{invoice.episodeTitle}</Text>
              <Text style={styles.cellText}>{invoice.type}</Text>
              <Text style={styles.cellText}>Length: {`${invoice.length.hours}h ${invoice.length.minutes}m ${invoice.length.seconds}s`}</Text>
            </View>
            <View style={styles.gridCol2}>
              <Text style={styles.cellText}>{invoice.billedMinutes} minutes</Text>
            </View>
            <View style={styles.gridCol3}>
              <Text style={styles.cellText}>{formatCurrency(invoice.ratePerMinute * invoice.billedMinutes)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: '#eee' }]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.invoicedAmount)}</Text>
          </View>
        </View>

        {invoice.note && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.subtitle}>Notes:</Text>
            <Text style={styles.cellText}>{invoice.note}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
} 