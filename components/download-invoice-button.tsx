'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface DownloadInvoiceButtonProps {
  invoiceId: string;
}

export function DownloadInvoiceButton({ invoiceId }: DownloadInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isLoading ? 'Downloading...' : 'Download PDF'}
    </Button>
  );
} 