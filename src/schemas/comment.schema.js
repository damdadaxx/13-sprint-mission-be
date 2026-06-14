// ============================================
// Comment Zod 스키마
// - Product, Article 공통 사용
// ============================================

import { z } from "zod";

/** 공통 필드 */
const baseCommentSchema = {
  content: z.string().min(1, "content는 1자 이상이어야 합니다").trim(),
  // userId: z.number().int(), TODO: 로그인 기능 개발후 필요
};

/** 상품 댓글 */
// 생성 스키마 (사용자 입력)
export const createProductCommentSchema = z.object(baseCommentSchema);
// 수정 스키마
export const updateProductCommentSchema = z.object({
  content: z.string().min(1, "content는 1자 이상이어야 합니다").trim(),
});

/** 게시글 댓글 */
// 생성 스키마 (사용자 입력)
export const createArticleCommentSchema = z.object(baseCommentSchema);
// 수정 스키마
export const updateArticleCommentSchema = z.object({
  content: z.string().min(1, "content는 1자 이상이어야 합니다").trim(),
});
