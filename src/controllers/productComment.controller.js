// ============================================================
// ProductComment 컨트롤러
// - 모든 컨트롤러는 asyncHandler 로 감싸져 있어 try/catch 가 필요 없음
// - 에러는 asyncHandler 가 종류별로 알아서 처리
// ============================================================

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import {
  createProductCommentSchema,
  updateProductCommentSchema,
} from "../schemas/comment.schema.js";
import parseId from "../utils/parse.js";
import { TEMP_USER_ID } from "../utils/constants.js";

// GET /items/:productId/comments
export const getAllProductComments = asyncHandler(async (req, res) => {
  const { orderBy = "recent", limit = 10, cursor = null } = req.query;
  const { productId } = req.params;

  // product 댓글만 가져오기
  const parsedProductId = parseId(productId);

  // 상품 존재 확인
  const product = await prisma.product.findUnique({
    where: { id: parsedProductId },
  });

  if (!product) {
    throw new NotFoundError(
      `ID가 '${parsedProductId}'인 상품을 찾을 수 없습니다`,
    );
  }

  const whereCondition = {
    productId: parsedProductId,
  };

  const sortOption = {
    recent: { createdAt: "desc" },
  }[orderBy] || { createdAt: "desc" };

  const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const cursorId = parseInt(cursor) || null;

  const [data, totalItems] = await Promise.all([
    prisma.productComment.findMany({
      where: whereCondition,
      take: pageSize + 1,
      ...(cursorId && {
        skip: 1,
        cursor: {
          id: cursorId,
        },
      }),
      orderBy: sortOption,
    }),
    prisma.productComment.count({ where: whereCondition }),
  ]);

  const hasNextPage = data.length > pageSize;
  const newData = hasNextPage ? data.slice(0, pageSize) : data;
  const nextCursor = hasNextPage ? newData[newData.length - 1].id : null;

  res.json({
    data: newData,
    pagination: {
      totalItems,
      hasNextPage,
      nextCursor,
    },
  });
});

// POST /items/:productId/comments
export const createProductComment = asyncHandler(async (req, res) => {
  const data = createProductCommentSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { productId } = req.params;
  const { content } = data;
  // TODO: 추후 로그인 인증 기능 작업 시 추가 : const userId = req.user.id

  console.log();
  // 생성
  const comment = await prisma.productComment.create({
    data: {
      content,
      user: { connect: { id: TEMP_USER_ID } }, // TODO: 임시 user 데이터
      product: { connect: { id: parseId(productId) } },
    },
  });

  res.status(201).json({ success: true, data: comment });
});

// PATCH /items/:productId/comments/:commentId
export const updateProductComment = asyncHandler(async (req, res) => {
  const { productId, commentId } = req.params;
  const data = updateProductCommentSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { content } = data;

  const parsedProductId = parseId(productId);
  const parsedCommentId = parseId(commentId);

  // comment 존재 확인
  const comment = await prisma.productComment.findUnique({
    where: { id: parsedCommentId },
  });

  if (!comment) {
    throw new NotFoundError(`${parsedCommentId} 댓글을 찾을 수 없습니다`);
  }

  // 해당 상품의 comment인지 확인
  if (comment.productId !== parsedProductId) {
    throw new ValidationError(`${parsedProductId} 상품의 댓글이 아닙니다`);
  }

  // 수정
  const updated = await prisma.productComment.update({
    where: { id: parsedCommentId },
    data: {
      content,
    },
  });

  res.json({ success: true, data: updated });
});

// DELETE /items/:productId/comments/:commentId
export const deleteProductComment = asyncHandler(async (req, res) => {
  const { commentId, productId } = req.params;

  const parsedProductId = parseId(productId);
  const parsedCommentId = parseId(commentId);

  // comment 존재 확인
  const comment = await prisma.productComment.findUnique({
    where: { id: parsedCommentId },
  });

  if (!comment) {
    throw new NotFoundError(`${parsedCommentId} 댓글을 찾을 수 없습니다`);
  }

  // 해당 상품의 comment인지 확인
  if (comment.productId !== parsedProductId) {
    throw new ValidationError(`${parsedProductId} 상품의 댓글이 아닙니다`);
  }

  // 삭제
  await prisma.productComment.delete({
    where: { id: parsedCommentId },
  });

  res.json({ success: true, message: "댓글이 삭제되었습니다" });
});
