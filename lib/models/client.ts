import mongoose, { Schema, Document } from 'mongoose';

export interface IRate {
  episodeType: 'Podcast' | 'Podcast video' | 'Other';
  rateType: 'Hourly' | 'Flat rate' | 'Per delivered minute';
  rate: number;
}

export interface IClient extends Document {
  email: string;
  name: string;
  rates: IRate[];
  createdAt: Date;
  updatedAt: Date;
}

const RateSchema = new Schema<IRate>({
  episodeType: { 
    type: String, 
    required: true,
    enum: ['Podcast', 'Podcast video', 'Other']
  },
  rateType: { 
    type: String, 
    required: true,
    enum: ['Hourly', 'Flat rate', 'Per delivered minute']
  },
  rate: { 
    type: Number, 
    required: true,
    min: 0
  }
});

const ClientSchema = new Schema<IClient>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rates: [RateSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema); 