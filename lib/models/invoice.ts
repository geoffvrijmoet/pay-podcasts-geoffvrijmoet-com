import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  client: string;
  clientId: mongoose.Types.ObjectId;
  episodeTitle: string;
  type: string;
  earnedAfterFees: number;
  invoicedAmount: number;
  billedMinutes: number;
  length: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  paymentMethod: string;
  editingTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  billableHours: number;
  runningHourlyTotal: number;
  ratePerMinute: number;
  dateInvoiced: Date;
  datePaid: Date;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  client: { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  episodeTitle: { type: String, required: true },
  type: { type: String, required: true },
  earnedAfterFees: { type: Number, required: true },
  invoicedAmount: { type: Number, required: true },
  billedMinutes: { type: Number, required: true },
  length: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true }
  },
  paymentMethod: { type: String },
  editingTime: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true }
  },
  billableHours: { type: Number, required: true },
  runningHourlyTotal: { type: Number, required: true },
  ratePerMinute: { type: Number, required: true },
  dateInvoiced: { type: Date },
  datePaid: { type: Date },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema); 