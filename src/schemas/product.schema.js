// ============================================
// Product Zod 스키마
// ============================================

import { z } from "zod";

// 생성 스키마 (사용자 입력)
export const createProductSchema = z.object({
  // TODO: userId 추가하기
  name: z
    .string()
    .min(1, "name은 1자 이상이어야 합니다")
    .max(10, "name은 10자 이내로 입력해주세요")
    .trim(),
  price: z.coerce
    .number()
    .int()
    .positive("price는 양의 정수여야 합니다")
    .min(0, "price는 0 이상이어야 합니다")
    .default(0),
  description: z.string().min(1, "description은 1자 이상이어야 합니다").trim(),
  tags: z
    .array(
      z
        .string()
        .min(1, "tag는 1자 이상이어야 합니다")
        .max(5, "tag는 5자 이내로 입력해주세요")
        .trim(),
    )
    .min(1, "최소 1개의 태그가 필요합니다"),
});

export const updateProductSchema = createProductSchema.partial();
