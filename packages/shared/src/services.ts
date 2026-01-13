export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ready: boolean;
}

export const services: Service[] = [
  {
    id: 'marathon',
    name: '2026 마라톤 광클 방지기',
    description: '마라톤 일정 관리 및 오픈 10분 전 알람',
    icon: '🏃',
    color: '#ef4444', // red
    ready: false,
  },
  {
    id: 'flipbook',
    name: '플립북 주문제작',
    description: '영상을 플립북으로 제작해서 배송',
    icon: '📚',
    color: '#8b5cf6', // purple
    ready: false,
  },
  {
    id: 'jansori',
    name: '잔소리 AI',
    description: '친구처럼 잔소리해주는 AI',
    icon: '🗣️',
    color: '#f97316', // orange
    ready: false,
  },
  {
    id: 'jobhunt',
    name: 'Freelancer Job Alarm',
    description: '이력서 스캔, 적합도 분석, 빠른 지원',
    icon: '💼',
    color: '#0ea5e9', // sky
    ready: false,
  },
  {
    id: 'bluetree',
    name: 'Bluetree Foundation',
    description: '함께 걷는 치유 커뮤니티',
    icon: '💙',
    color: '#3b82f6', // blue
    ready: false,
  },
  {
    id: 'founders',
    name: '창업가 가상 대담',
    description: '유명 창업가와 AI 대화',
    icon: '👔',
    color: '#6366f1', // indigo
    ready: false,
  },
  {
    id: 'webtoon',
    name: '웹툰 추천',
    description: '취향 맞춤 웹툰 추천',
    icon: '📖',
    color: '#22c55e', // green
    ready: false,
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getReadyServices(): Service[] {
  return services.filter((s) => s.ready);
}
