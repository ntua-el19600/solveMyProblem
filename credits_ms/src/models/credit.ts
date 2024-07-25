import { Schema, model, Document } from 'mongoose';

interface ICredit extends Document {
  userId: string;
  credits: number;
}

const creditSchema = new Schema<ICredit>({
  userId: { type: String, required: true },
  credits: { type: Number, required: true },
});

const Credit = model<ICredit>('Credit', creditSchema);

export default Credit;
