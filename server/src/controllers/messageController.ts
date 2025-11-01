import { Request, Response } from "express";
import prisma from "../prismaClient";

export const sendMessage = async (req: any, res: Response) => {
  const { toUserId, subject, body } = req.body;
  const msg = await prisma.message.create({
    data: { fromId: req.user.id, toId: toUserId, subject, body }
  });
  res.json(msg);
};

export const inbox = async (req: any, res: Response) => {
  const inbox = await prisma.message.findMany({ where: { toId: req.user.id }, include: { from: true }});
  res.json(inbox);
};
