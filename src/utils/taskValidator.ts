import { Task } from '@/types/task';

/**
 * AI가 생성한 할 일 제목이 명명 규칙을 준수하는지 검증하고 자동 수정합니다.
 */
export const validateAndFixTaskTitle = (title: string): string => {
  let fixedTitle = title.trim();

  // 1. 불필요한 조사 및 서술어 제거/변환 패턴
  const patterns = [
    { regex: /(해야겠다|해야 해|하고 싶다|해줘)$/, replacement: '' },
    { regex: /(하기로 함|하는 중|해야함|해야 함)$/, replacement: '하기' },
    { regex: /야하겠음$/, replacement: '하기' },
  ];

  patterns.forEach(({ regex, replacement }) => {
    fixedTitle = fixedTitle.replace(regex, replacement);
  });

  // 2. 동사 기본형 또는 명사형 어미 체크 (간단한 규칙 기반 수정)
  // '~다'로 끝나는 경우 '~기'로 변환 시도 (한국어 특성상 완벽하진 않지만 보조 수단으로 활용)
  if (fixedTitle.endsWith('다') && !fixedTitle.endsWith('마다')) {
    // '하다' -> '하기', '가다' -> '가기' 등
    fixedTitle = fixedTitle.slice(0, -1) + '기';
  }

  // 3. 문장 성분 생략 (앞부분의 '오늘', '내일' 등 제거)
  fixedTitle = fixedTitle.replace(/^(오늘|내일|모레|어제)\s+/, '');

  return fixedTitle;
};

/**
 * 할 일 객체 배열 전체를 검증하고 수정합니다.
 */
export const validateTasks = (tasks: any[]): any[] => {
  return tasks.map(task => ({
    ...task,
    title: validateAndFixTaskTitle(task.title),
    // duration이 숫자가 아니거나 0 이하인 경우 최소값 5로 보정
    duration: typeof task.duration === 'number' && task.duration > 0 ? task.duration : 5,
    // aiPriority 범위 보정 (1~10)
    aiPriority: Math.min(Math.max(Number(task.aiPriority) || 5, 1), 10)
  }));
};
