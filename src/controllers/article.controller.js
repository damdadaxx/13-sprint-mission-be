// ============================================================
//  Article 컨트롤러
// - 모든 컨트롤러는 asyncHandler 로 감싸져 있어 try/catch 가 필요 없음
// - 에러는 asyncHandler 가 종류별로 알아서 처리
// ============================================================

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../schemas/article.schema.js";
import { TEMP_USER_ID } from "../utils/constants.js";
import parseId from "../utils/parse.js";

// GET /articles
export const getAllArticles = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search = "", order = "recent" } = req.query;
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const itemsPerPage = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  const keyword = search || "";
  const orderBy = order || "recent";

  let where = {};

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { content: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const sortOption = {
    recent: { createdAt: "desc" },
    like: { likeCount: "desc" },
  }[orderBy] || { createdAt: "desc" };

  const offset = (currentPage - 1) * itemsPerPage;

  const [data, totalItems] = await Promise.all([
    prisma.article.findMany({
      where,
      skip: offset,
      take: itemsPerPage,
      orderBy: sortOption,
      include: {
        user: true,
      },
    }),
    prisma.article.count({ where }),
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

// GET /articles/:id
export const getArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await prisma.article.findUniqueOrThrow({
    where: { id: parseId(id) },
    include: {
      user: true,
      articleComments: true,
    },
  });

  res.json({ success: true, data: article });
});

// POST /articles
export const createArticle = asyncHandler(async (req, res) => {
  const data = createArticleSchema.parse(req.body); // 유효성 검사 완료된 데이터

  const article = await prisma.article.create({
    data: {
      ...data,
      likeCount: 0,
      user: { connect: { id: TEMP_USER_ID } },
    },
  });

  res.status(201).json({ success: true, data: article });
});

// PATCH /articles/:id
export const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateArticleSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { title, content } = data;

  const article = await prisma.article.update({
    where: { id: parseId(id) },
    data: {
      // 기본 필드 (있으면 업데이트)
      ...(title && { title: title }),
      ...(content && { content: content }),
    },
  });

  res.json({ success: true, data: article });
});

// DELETE /articles/:id
export const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.article.delete({
    where: { id: parseId(id) },
  });

  res.json({ success: true, message: "게시글이 삭제되었습니다" });
});
