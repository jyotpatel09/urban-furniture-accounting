import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { formatDocumentNumber } from '../../utils/accounting.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export const salesOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  taxRate: z.number().nonnegative().default(18),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1),
  date: z.string().or(z.date()).optional().default(() => new Date()),
  notes: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1),
});

export async function getSalesOrders(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

  const where: any = {};
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  const [total, salesOrders] = await Promise.all([
    prisma.salesOrder.count({ where }),
    prisma.salesOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return sendPaginated(res, salesOrders, { page, limit, total, totalPages });
}

export async function getSalesOrderById(req: Request, res: Response) {
  const id = String(req.params.id);
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      invoices: true,
    },
  });

  if (!order) {
    return sendError(res, 'Sales order not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, order);
}

export async function createSalesOrder(req: AuthenticatedRequest, res: Response) {
  const { customerId, date, notes, items } = req.body;
  const userId = req.user!.userId;

  const customer = await prisma.contact.findUnique({ where: { id: customerId } });
  if (!customer) {
    return sendError(res, 'Customer not found', 'NOT_FOUND', 404);
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

  const count = await prisma.salesOrder.count();
  const number = formatDocumentNumber('SO', count);

  const order = await prisma.salesOrder.create({
    data: {
      number,
      customerId,
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
      customer: true,
      items: true,
    },
  });

  return sendSuccess(res, order, 'Sales order created in DRAFT state.', 201);
}

export async function confirmSalesOrder(req: Request, res: Response) {
  const id = String(req.params.id);

  const order = await prisma.salesOrder.findUnique({ where: { id } });
  if (!order) {
    return sendError(res, 'Sales order not found', 'NOT_FOUND', 404);
  }

  if (order.status === 'CANCELLED') {
    return sendError(res, 'Cannot confirm a cancelled sales order.', 'INVALID_STATUS', 400);
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: { status: 'CONFIRMED' },
  });

  return sendSuccess(res, updated, 'Sales order confirmed.');
}

export async function cancelSalesOrder(req: Request, res: Response) {
  const id = String(req.params.id);

  const order = await prisma.salesOrder.findUnique({ where: { id } });
  if (!order) {
    return sendError(res, 'Sales order not found', 'NOT_FOUND', 404);
  }

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  return sendSuccess(res, updated, 'Sales order cancelled.');
}

export async function createInvoiceFromOrder(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  const userId = req.user!.userId;

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      items: true,
      invoices: true,
    }
  });

  if (!order) {
    return sendError(res, 'Sales order not found', 'NOT_FOUND', 404);
  }

  if (order.invoices && order.invoices.length > 0) {
    return sendError(res, 'Invoice already exists for this Sales Order.', 'DUPLICATE_INVOICE', 400);
  }

  // Create Invoice inside a transaction
  const invoice = await prisma.$transaction(async (tx) => {
    const count = await tx.invoice.count();
    const number = formatDocumentNumber('INV', count);

    const newInvoice = await tx.invoice.create({
      data: {
        number,
        customerId: order.customerId,
        salesOrderId: order.id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 days
        status: 'DRAFT',
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        paidAmount: 0,
        remainingAmount: order.totalAmount,
        createdById: userId,
        items: {
          create: order.items.map(item => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            lineSubtotal: item.lineSubtotal,
            lineTotal: item.lineTotal,
          }))
        }
      },
      include: {
        items: true,
        customer: true,
      }
    });

    return newInvoice;
  });

  return sendSuccess(res, invoice, 'Invoice created successfully from Sales Order.', 201);
}
