import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  ticketId: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["open", "in_progress", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
