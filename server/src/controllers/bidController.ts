import { Request, Response } from "express";
import prisma from "../prismaClient";
import { addBookingAndInvoice } from "./bookingController"; // helper we'll define

export const placeBid = async (req: any, res: Response) => {
  const { campaignId, billboardId, clientBid } = req.body;
  const b = await prisma.bid.create({
    data: { campaignId, billboardId, clientBid: parseFloat(clientBid), status: "pending" }
  });
  res.json(b);
};

export const listBidsForBillboard = async (req: any, res: Response) => {
  const billboardId = req.params.id;
  const bids = await prisma.bid.findMany({ where: { billboardId }});
  res.json(bids);
};

export const ownerRespondBid = async (req: any, res: Response) => {
  const { id } = req.params; // bid id
  const { action } = req.body; // 'accept' or 'reject'
  const bid = await prisma.bid.findUnique({ where: { id }});
  if (!bid) return res.status(404).json({ error: "Bid not found" });
  // ensure owner owns the billboard
  const billboard = await prisma.billboard.findUnique({ where: { id: bid.billboardId }});
  if (!billboard || billboard.ownerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  if (action === "accept") {
    // mark other bids for same campaign & billboard as rejected
    await prisma.bid.updateMany({ where: { campaignId: bid.campaignId, billboardId: bid.billboardId }, data: { status: "rejected" }});
    await prisma.bid.update({ where: { id }, data: { status: "accepted" }});
    const booking = await addBookingAndInvoice(bid);
    return res.json({ ok: true, booking });
  } else {
    await prisma.bid.update({ where: { id }, data: { status: "rejected" }});
    return res.json({ ok: true });
  }
};
