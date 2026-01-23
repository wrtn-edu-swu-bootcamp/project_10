/**
 * 고유 ID 생성을 위한 유틸리티
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
