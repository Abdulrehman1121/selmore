import { Request, Response } from "express";
import prisma from "../prismaClient";
import type { Campaign, Billboard, Bid } from "@prisma/client";


interface AuthUser {
    id: string;
    role: "client" | "owner" | string;
}

interface CreateCampaignBody {
    title: string;
    description?: string;
    budget?: string | number;
    startDate?: string | null;
    endDate?: string | null;
}

interface AuthRequest extends Request {
    user: AuthUser;
    body: CreateCampaignBody;
    params: Record<string, string>;
}

export const createCampaign = async (req: AuthRequest, res: Response) => {
    const { title, description, budget, startDate, endDate } = req.body;
    const campaign: Campaign = await prisma.campaign.create({
        data: {
            clientId: req.user.id,
            title,
            description,
            budget: budget ? parseFloat(String(budget)) : undefined,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            status: "active"
        }
    });
    res.json(campaign);
};

export const listCampaigns = async (req: AuthRequest, res: Response) => {
    // client sees own; owner maybe use query to see campaigns that bid on their billboards
    if (req.user.role === "client") {
        const c: Campaign[] = await prisma.campaign.findMany({ where: { clientId: req.user.id } });
        return res.json(c);
    }
    // owner view: campaigns that have bids for their billboards
    if (req.user.role === "owner") {
        const billboards: Pick<Billboard, "id">[] = await prisma.billboard.findMany({
            where: { ownerId: req.user.id },
            select: { id: true }
        });
        const bIds: Billboard["id"][] = billboards.map(b => b.id);
        const bids: (Bid & { campaign: Campaign })[] = await prisma.bid.findMany({
            where: { billboardId: { in: bIds } },
            include: { campaign: true }
        });
        return res.json(bids);
    }
    res.json([]);
};

export const getCampaign = async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const c: (Campaign & { bids: Bid[] }) | null = await prisma.campaign.findUnique({
        where: { id },
        include: { bids: true }
    });
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
};
