// ============================================
// asyncHandler
// - 컨트롤러를 감싸 try/catch 를 한 곳에 모아 줌
// ============================================

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
