import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';
import { parsePagination } from '../../utils/pagination.js';
import { ProductType } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['GOODS', 'SERVICE', 'COMBO']).default('GOODS'),
  category: z.string().min(2),
  salesPrice: z.number().positive(),
  purchasePrice: z.number().positive(),
  taxRate: z.number().nonnegative().default(18),
  sku: z.string().min(2),
  description: z.string().optional(),
  openingStock: z.number().int().nonnegative().optional().default(100),
  reorderLevel: z.number().int().nonnegative().optional().default(10),
});

export const updateProductSchema = createProductSchema.partial();

export async function getProducts(req: Request, res: Response) {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search).trim() : '';
  const category = req.query.category ? String(req.query.category) : undefined;
  const type = req.query.type ? (String(req.query.type).toUpperCase() as ProductType) : undefined;
  const isArchived = req.query.isArchived === 'true';

  const where: any = { isArchived };

  if (type) where.type = type;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return sendPaginated(res, products, { page, limit, total, totalPages });
}

export async function getProductById(req: Request, res: Response) {
  const id = String(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return sendError(res, 'Product not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, product);
}

export async function createProduct(req: Request, res: Response) {
  const data = req.body;

  const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existing) {
    return sendError(res, 'A product with this SKU already exists.', 'SKU_EXISTS', 400);
  }

  const currentStock = data.openingStock ?? 100;
  const product = await prisma.product.create({
    data: {
      ...data,
      currentStock,
    },
  });

  return sendSuccess(res, product, 'Product created successfully.', 201);
}

export async function updateProduct(req: Request, res: Response) {
  const id = String(req.params.id);
  const data = req.body;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Product not found', 'NOT_FOUND', 404);
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
  });

  return sendSuccess(res, updated, 'Product updated successfully.');
}

export async function archiveProduct(req: Request, res: Response) {
  const id = String(req.params.id);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return sendError(res, 'Product not found', 'NOT_FOUND', 404);
  }

  const archived = await prisma.product.update({
    where: { id },
    data: { isArchived: true, status: 'Archived' },
  });

  return sendSuccess(res, archived, 'Product archived successfully.');
}

export async function getStockReport(req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { isArchived: false, type: 'GOODS' },
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      openingStock: true,
      stockIn: true,
      stockOut: true,
      currentStock: true,
      reorderLevel: true,
      salesCount: true,
      purchaseCount: true,
    },
    orderBy: { name: 'asc' },
  });

  return sendSuccess(res, products);
}

export async function getProductStockById(req: Request, res: Response) {
  const id = String(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      sku: true,
      name: true,
      openingStock: true,
      stockIn: true,
      stockOut: true,
      currentStock: true,
      reorderLevel: true,
    },
  });

  if (!product) {
    return sendError(res, 'Product not found', 'NOT_FOUND', 404);
  }

  return sendSuccess(res, product);
}
