import { Request, Response } from "express";
import prisma from "../prismaClient";


// list bookings: owner sees their bookings, client their bookings, admin all
export const listBookings = async (req: any, res: Response) => {
  if (req.user.role === "owner") {
    const b = await prisma.booking.findMany({ where: { ownerId: req.user.id }});
    return res.json(b);
  }
  if (req.user.role === "client") {
    const b = await prisma.booking.findMany({ where: { clientId: req.user.id }});
    return res.json(b);
  }
  const b = await prisma.booking.findMany();
  return res.json(b);
};

export const createBooking = async (req: any, res: Response) => {
  const { campaignId, billboardId, ownerId, clientId, price, startDate, endDate } = req.body;
  const booking = await prisma.booking.create({ data: {
    campaignId: campaignId || null,
    billboardId,
    ownerId,
    clientId,
    price: parseFloat(price),
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    status: "confirmed"
  }});
  // create invoice
  const inv = await prisma.invoice.create({
    data: { bookingId: booking.id, invoiceNumber: `INV-${booking.id.slice(0,8)}`, amount: booking.price, status: "unpaid" }
  });
  res.json({ booking, invoice: inv });
};

// helper for adding booking & invoice when bid accepted
export const addBookingAndInvoice = async (bid: any) => {
  // find campaign client and billboard owner
  const campaign = await prisma.campaign.findUnique({ where: { id: bid.campaignId }});
  const billboard = await prisma.billboard.findUnique({ where: { id: bid.billboardId }});
  const booking = await prisma.booking.create({
    data: {
      campaignId: bid.campaignId,
      billboardId: bid.billboardId,
      ownerId: billboard!.ownerId,
      clientId: campaign!.clientId,
      price: bid.clientBid,
      status: "confirmed"
    }
  });
  const invoice = await prisma.invoice.create({
    data: { bookingId: booking.id, invoiceNumber: `INV-${booking.id.slice(0,8)}`, amount: booking.price, status: "unpaid" }
  });
  return { booking, invoice };
};

export const addBookingAndInvoiceEndpoint = async (req: any, res: Response) => {
  const bidId = req.params.bidId;
  const bid = await prisma.bid.findUnique({ where: { id: bidId }});
  if (!bid) return res.status(404).json({ error: "Bid not found" });
  const data = await addBookingAndInvoice(bid);
  res.json(data);
};
