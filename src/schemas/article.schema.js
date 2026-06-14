// ============================================
// Article Zod 스키마
// ============================================

import { z } from "zod";

// 생성 스키마 (사용자 입력)
export const createArticleSchema = z.object({
  // TODO: userId 추가하기
  title: z.string().min(1, "title은 1자 이상이어야 합니다").trim(),
  content: z.string().min(1, "content는 1자 이상이어야 합니다").trim(),
});

export const updateArticleSchema = createArticleSchema.partial();

