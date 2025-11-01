import { Request, Response } from "express";
import prisma from "../prismaClient";
import PDFDocument from "pdfkit";

interface AuthUser {
  id: string;
  role: "owner" | "client" | string;
}

interface AuthRequest<TParams = any, TBody = any, TQuery = any> extends Request<TParams, any, TBody, TQuery> {
  user: AuthUser;
}

interface BookingId {
  id: string;
}

interface Booking {
  id: string;
  ownerId: string;
  clientId: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string | Date;
  bookingId?: string;
}

interface InvoiceWithBooking extends Invoice {
  booking: Booking;
}

export const listInvoices = async (req: AuthRequest, res: Response) => {
  if (req.user.role === "owner") {
    const bookings = (await prisma.booking.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    })) as BookingId[];
    const bookingIds = bookings.map((b: BookingId) => b.id);
    const invoices = await prisma.invoice.findMany({ where: { bookingId: { in: bookingIds } } });
    return res.json(invoices);
  }

  if (req.user.role === "client") {
    const bookings = (await prisma.booking.findMany({
      where: { clientId: req.user.id },
      select: { id: true },
    })) as BookingId[];
    const bookingIds = bookings.map((b: BookingId) => b.id);
    const invoices = await prisma.invoice.findMany({ where: { bookingId: { in: bookingIds } } });
    return res.json(invoices);
  }

  const invoices = await prisma.invoice.findMany();
  res.json(invoices);
};

export const downloadInvoice = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const invoice = (await prisma.invoice.findUnique({
    where: { id },
    include: { booking: true },
  })) as InvoiceWithBooking | null;
  if (!invoice) return res.status(404).json({ error: "Not found" });

  const booking = invoice.booking;
  if (req.user.role === "owner" && booking.ownerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  if (req.user.role === "client" && booking.clientId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber}.pdf`);
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
  doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Date: ${invoice.createdAt}`);
  doc.pipe(res);
  doc.end();
};

export const markPaid = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const inv = (await prisma.invoice.update({ where: { id }, data: { status: "paid" } })) as Invoice;
  res.json(inv);
};
