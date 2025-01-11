import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema); 