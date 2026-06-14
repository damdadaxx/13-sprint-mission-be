import { z } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "./errors.js";

export const errorHandler = (err, req, res, next) => {
  // Zod 검증 에러 — 컨트롤러 안 schema.parse() 가 던진 ZodError 처리
  if (err instanceof z.ZodError) {
    const errors = err.errors || err.issues || []; // undefined 방어
    return res.status(400).json({
      success: false,
      errors: errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Prisma — 행 없음
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "데이터를 찾을 수 없습니다",
    });
  }

  // P2002: UNIQUE 제약 위반
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "이미 존재하는 데이터입니다",
      field: err.meta?.target,
    });
  }

  // P2003: 외래 키 제약 위반
  if (err.code === "P2003") {
    return res.status(400).json({
      success: false,
      message: "참조 무결성 제약 조건 위반",
    });
  }

  // Prisma validation 에러 (타입 불일치 등)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Prisma validation 에러",
      detail: err.message.split("\n").slice(-2).join(" "),
    });
  }

  // 커스텀 에러 (NotFoundError 등)
  //클래스에 담아 둔 status 값을 그대로 사용
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // 그 외 알 수 없는 에러 — 콘솔에 로그 + 500 응답
  console.error(err);
  res.status(500).json({
    success: false,
    message: "서버 에러가 발생했습니다",
  });
};
