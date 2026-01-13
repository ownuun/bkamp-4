export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  ready: boolean;
  url?: string;
}

// Port mapping for local development
const LOCAL_PORTS: Record<string, number> = {
  portal: 3000,
  marathon: 3001,
  flipbook: 3002,
  jansori: 3003,
  jobhunt: 3004,
  bluetree: 3005,
  founders: 3006,
  webtoon: 3007,
};

// Get service URL based on environment
export function getServiceUrl(serviceId: string): string {
  const isServer = typeof window === 'undefined';
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    return `http://localhost:${LOCAL_PORTS[serviceId] || 3000}`;
  }

  // Production - use Vercel project URLs
  return `https://bkamp-4-${serviceId}.vercel.app`;
}

export const services: Service[] = [
  {
    id: 'marathon',
    name: '2026 마라톤 광클 방지기',
    description: '마라톤 일정 관리 및 오픈 10분 전 알람',
    icon: '🏃',
    color: '#ef4444',
    ready: false,
  },
  {
    id: 'flipbook',
    name: '플립북 주문제작',
    description: '영상을 플립북으로 제작해서 배송',
    icon: '📚',
    color: '#8b5cf6',
    ready: false,
  },
  {
    id: 'jansori',
    name: '잔소리 AI',
    description: '친구처럼 잔소리해주는 AI',
    icon: '🗣️',
    color: '#f97316',
    ready: false,
  },
  {
    id: 'jobhunt',
    name: 'Freelancer Job Alarm',
    description: '이력서 스캔, 적합도 분석, 빠른 지원',
    icon: '💼',
    color: '#0ea5e9',
    ready: false,
  },
  {
    id: 'bluetree',
    name: 'Bluetree Foundation',
    description: '함께 걷는 치유 커뮤니티',
    icon: '💙',
    color: '#3b82f6',
    ready: false,
  },
  {
    id: 'founders',
    name: '창업가 가상 대담',
    description: '유명 창업가와 AI 대화',
    icon: '👔',
    color: '#6366f1',
    ready: true,
  },
  {
    id: 'webtoon',
    name: '웹툰 추천',
    description: '취향 맞춤 웹툰 추천',
    icon: '📖',
    color: '#22c55e',
    ready: true,
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getReadyServices(): Service[] {
  return services.filter((s) => s.ready);
}
