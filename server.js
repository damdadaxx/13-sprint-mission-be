import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import itemRouter from "./src/routes/item.routes.js";
import articleRouter from "./src/routes/article.routes.js";
import { errorHandler } from "./src/utils/errorHandler.js";

// 환경 변수 로드
const env = process.env.NODE_ENV || "development";

// Render 환경에서는 .env 파일 사용 안 함 (Dashboard에서 설정)
if (env === "development") {
  dotenv.config({ path: ".env.development" });
} else if (env === "production") {
  const result = dotenv.config({ path: ".env.production" });
  if (result.error && result.error.code !== "ENOENT") {
    console.warn("⚠️ .env.production 파일을 찾을 수 없습니다");
  }
}

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

// CORS 설정
app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

// JSON 파싱
app.use(express.json());

// 헬스 체크 엔드포인트 (Render의 health check용)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 비동기 서버 시작
async function start() {
  try {
    // 라우터 등록
    app.use("/items", itemRouter);
    app.use("/articles", articleRouter);
    
    // 에러 핸들러 등록
    app.use(errorHandler);

    // 서버 실행
    app.listen(PORT, () => {
      console.log(
        `🚀 서버가 http://localhost:${PORT} 에서 실행 중 (✅ ${env})`,
      );
    });
  } catch (error) {
    console.error("❌ 서버 시작 실패:", error.message);
    process.exit(1);
  }
}

start();

export default app;
