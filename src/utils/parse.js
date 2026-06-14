/** req.params로 받은 ID 문자열을 정수로 변환, 실패 시 에러 */
const parseId = (id) => {
  const parsed = parseInt(id, 10);

  if (isNaN(parsed) || parsed <= 0) {
    throw new ValidationError(`유효하지 않은 ID입니다: ${id}`);
  }

  return parsed;
};

export default parseId;
