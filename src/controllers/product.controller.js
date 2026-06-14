// ============================================================
// Product 컨트롤러
// - 모든 컨트롤러는 asyncHandler 로 감싸져 있어 try/catch 가 필요 없음
// - 에러는 asyncHandler 가 종류별로 알아서 처리
// ============================================================

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import { TEMP_USER_ID } from "../utils/constants.js";
import parseId from "../utils/parse.js";

// API 응답 변환: tag 필드만 추출해서 다시 문자열 배열로
export const convertToProductResponse = (product) => ({
  ...product,
  tags: product.tags?.map((tagObj) => tagObj.tag),
});

// GET /items
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search = "", order = "recent" } = req.query;
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const itemsPerPage = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  const keyword = search || "";
  const orderBy = order || "recent";

  let where = {};

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const sortOption = {
    recent: { createdAt: "desc" },
    // like: { likeCount: "desc" },
  }[orderBy] || { createdAt: "desc" };

  const offset = (currentPage - 1) * itemsPerPage;

  const [data, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: offset,
      take: itemsPerPage,
      orderBy: sortOption,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;

  res.json({
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      hasNextPage,
    },
  });
});

// GET /items:id
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id: parseId(id) },
    include: {
      user: true,
      tags: true,
      productComments: true,
    },
  });

  const responseData = convertToProductResponse(product);
  res.json({ success: true, data: responseData });
});

// POST /items
export const createProduct = asyncHandler(async (req, res, next) => {
  const data = createProductSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { tags } = data;

  const product = await prisma.product.create({
    data: {
      ...data,
      likeCount: 0,
      // Tag 모델 형식으로 변환
      tags: {
        create: tags.map((tagName) => ({
          tag: tagName,
        })),
      },
      user: { connect: { id: TEMP_USER_ID } },
    },
    include: {
      tags: true,
    },
  });

  const responseData = convertToProductResponse(product);
  res.status(201).json({ success: true, data: responseData });
});

// PATCH /items/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateProductSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { tags, ...rest } = data;

  const product = await prisma.product.update({
    where: { id: parseId(id) },
    data: {
      // tags를 제외한 기본 필드 (있으면 업데이트)
      ...rest,
      // tags (있으면 삭제 후 새로 생성)
      ...(tags && {
        tags: {
          deleteMany: {}, // 기존 tags 모두 삭제
          create: tags.map((tagName) => ({
            tag: tagName,
          })),
        },
      }),
    },
    include: { tags: true },
  });

  const responseData = convertToProductResponse(product);
  res.json({ success: true, data: responseData });
});

// DELETE /items/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id: parseId(id) },
  });

  res.json({ success: true, message: "상품이 삭제되었습니다" });
});
