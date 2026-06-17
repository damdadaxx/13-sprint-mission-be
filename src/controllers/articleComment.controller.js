// ============================================================
// ArticleComment 컨트롤러
// - 모든 컨트롤러는 asyncHandler 로 감싸져 있어 try/catch 가 필요 없음
// - 에러는 asyncHandler 가 종류별로 알아서 처리
// ============================================================

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import {
  createArticleCommentSchema,
  updateArticleCommentSchema,
} from "../schemas/comment.schema.js";
import parseId from "../utils/parse.js";
import { TEMP_USER_ID } from "../utils/constants.js";

// GET /articles/:articleId/comments
export const getAllArticleComments = asyncHandler(async (req, res) => {
  const { orderBy = "recent", limit = 10, cursor = null } = req.query;
  const { articleId } = req.params;

  // article 댓글만 가져오기
  const parsedArticleId = parseId(articleId);

  // 상품 존재 확인
  const article = await prisma.article.findUnique({
    where: { id: parsedArticleId },
  });

  if (!article) {
    throw new NotFoundError(
      `게시글 ID가 '${parsedArticleId}'인 게시글을 찾을 수 없습니다`,
    );
  }

  const whereCondition = {
    articleId: parsedArticleId,
  };

  const sortOption = {
    recent: { createdAt: "desc" },
  }[orderBy] || { createdAt: "desc" };

  const pageSize = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const cursorId = parseInt(cursor) || null;

  const [data, totalItems] = await Promise.all([
    prisma.articleComment.findMany({
      where: whereCondition,
      take: pageSize + 1,
      ...(cursorId && {
        skip: 1,
        cursor: {
          id: cursorId,
        },
      }),
      orderBy: sortOption,
      include: {
        user: true,
      },
    }),
    prisma.articleComment.count({ where: whereCondition }),
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

// POST /articles/:articleId/comments
export const createArticleComment = asyncHandler(async (req, res) => {
  const data = createArticleCommentSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { articleId } = req.params;
  const { content } = data;
  // TODO: 추후 로그인 인증 기능 추가시 변경 : const userId = req.user.id

  // 생성
  const comment = await prisma.articleComment.create({
    data: {
      content,
      user: { connect: { id: TEMP_USER_ID } }, // TODO: 임시 user 데이터
      article: { connect: { id: parseId(articleId) } },
    },
  });

  res.status(201).json({ success: true, data: comment });
});

// PATCH /articles/:articleId/comments/:commentId
export const updateArticleComment = asyncHandler(async (req, res) => {
  const { articleId, commentId } = req.params;
  const data = updateArticleCommentSchema.parse(req.body); // 유효성 검사 완료된 데이터
  const { content } = data;

  const parsedArticleId = parseId(articleId);
  const parsedCommentId = parseId(commentId);

  // comment 존재 확인
  const comment = await prisma.articleComment.findUnique({
    where: { id: parsedCommentId },
  });

  if (!comment) {
    throw new NotFoundError(`${commentId} 댓글을 찾을 수 없습니다`);
  }

  // 해당 게시글의 comment인지 확인
  if (comment.articleId !== parsedArticleId) {
    throw new ValidationError(`${parsedArticleId} 게시글의 댓글이 아닙니다`);
  }

  // 수정
  const updated = await prisma.articleComment.update({
    where: { id: parsedCommentId },
    data: {
      content,
    },
  });

  res.json({ success: true, data: updated });
});

// DELETE /articles/:articleId/comments/:commentId
export const deleteArticleComment = asyncHandler(async (req, res) => {
  const { commentId, articleId } = req.params;

  const parsedArticleId = parseId(articleId);
  const parsedCommentId = parseId(commentId);

  // comment 존재 확인
  const comment = await prisma.articleComment.findUnique({
    where: { id: parsedCommentId },
  });

  if (!comment) {
    throw new NotFoundError(`${parsedCommentId} 댓글을 찾을 수 없습니다`);
  }

  // 해당 게시글의 comment인지 확인
  if (comment.articleId !== parsedArticleId) {
    throw new ValidationError(`${parsedArticleId} 게시글의 댓글이 아닙니다`);
  }

  // 삭제
  await prisma.articleComment.delete({
    where: { id: parsedCommentId },
  });

  res.json({ success: true, message: "댓글이 삭제되었습니다" });
});
