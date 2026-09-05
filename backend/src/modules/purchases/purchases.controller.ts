import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().nonnegative().default(18),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1),
  date: z.string().or(z.date()).optional().default(() => new Date()),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
});

export async function getPurchaseOrders(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

  const where: any = {};
  if (vendorId) where.vendorId = vendorId;
  if (status) where.status = status;

  const [total, purchaseOrders] = await Promise.all([
    prisma.purchaseOrder.count({ where }),
    prisma.purchaseOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        vendor: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, purchaseOrders, { page, limit, total, totalPages });
}

export async function getPurchaseOrderById(req: Request, res: Response) {
  const id = String(req.params.id);
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      items: { include: { product: true } },
      vendorBills: true,
    },
  });

  if (!order) {
    return sendError(res, 'Purchase order not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, order);
}

export async function createPurchaseOrder(req: AuthenticatedRequest, res: Response) {
  const { vendorId, date, notes, items } = req.body;
  const userId = req.user!.userId;

  const vendor = await prisma.contact.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return sendError(res, 'Vendor not found', 'NOT_FOUND', 404);
  }

  let subtotal = 0;
  let taxAmount = 0;

  const processedItems = items.map((item: any) => {
    const lineSubtotal = item.quantity * item.unitPrice;
    const lineTax = (lineSubtotal * item.taxRate) / 100;
    const lineTotal = lineSubtotal + lineTax;

    subtotal += lineSubtotal;
    taxAmount += lineTax;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      taxAmount: lineTax,
      lineSubtotal,
      lineTotal,
    };
  });

  const totalAmount = subtotal + taxAmount;

  const count = await prisma.purchaseOrder.count();
  const number = formatDocumentNumber('PO', count);

  const order = await prisma.purchaseOrder.create({
    data: {
      number,
      vendorId,
      date: new Date(date),
      status: 'DRAFT',
      subtotal,
      taxAmount,
      totalAmount,
      notes,
      createdById: userId,
      items: {
        create: processedItems,
      },
    },
    include: {
      vendor: true,
      items: true,
    },
  });

  return sendSuccess(res, order, 'Purchase order created in DRAFT state.', 201);
}

export async function confirmPurchaseOrder(req: Request, res: Response) {
  const id = String(req.params.id);
  const order = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!order) {
    return sendError(res, 'Purchase order not found', 'NOT_FOUND', 404);
  }
  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: 'CONFIRMED' },
  });
  return sendSuccess(res, updated, 'Purchase order confirmed.');
}

export async function receivePurchaseOrder(req: Request, res: Response) {
  const id = String(req.params.id);
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    return sendError(res, 'Purchase order not found', 'NOT_FOUND', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED' },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          purchaseCount: { increment: item.quantity },
          stockIn: { increment: item.quantity },
          currentStock: { increment: item.quantity },
        },
      });
    }

    return updatedOrder;
  });

  return sendSuccess(res, result, 'Goods received and inventory updated.');
}
