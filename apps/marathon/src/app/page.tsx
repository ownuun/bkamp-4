import { MarathonList } from "@/components/marathon/marathon-list";
import { Marathon } from "@/types";
import { Timer, Bell, Heart, ExternalLink } from "lucide-react";

// Mock data for development - Replace with Supabase fetch
const mockMarathons: Marathon[] = [
  {
    id: "1",
    name: "서울마라톤",
    name_en: "Seoul Marathon",
    slug: "seoul-marathon",
    date: "2026-03-15",
    registration_opens_at: "2025-11-01T10:00:00+09:00",
    registration_closes_at: "2025-12-15T23:59:59+09:00",
    location: "서울 광화문",
    distance_options: ["Full", "Half", "10K"],
    official_url: "https://www.seoul-marathon.com",
    registration_url: "https://www.seoul-marathon.com/register",
    image_url: null,
    description:
      "대한민국 대표 마라톤 대회. 광화문에서 출발하여 서울 도심을 달리는 코스.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "JTBC 마라톤",
    name_en: "JTBC Marathon",
    slug: "jtbc-marathon",
    date: "2026-04-05",
    registration_opens_at: "2026-01-15T10:00:00+09:00",
    registration_closes_at: "2026-02-28T23:59:59+09:00",
    location: "서울 상암",
    distance_options: ["Full", "Half", "10K", "5K"],
    official_url: "https://www.jtbcmarathon.com",
    registration_url: "https://www.jtbcmarathon.com/register",
    image_url: null,
    description: "상암월드컵경기장을 중심으로 한강변을 달리는 봄 마라톤.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "경주 벚꽃마라톤",
    name_en: "Gyeongju Cherry Blossom Marathon",
    slug: "gyeongju-marathon",
    date: "2026-04-04",
    registration_opens_at: "2026-01-10T10:00:00+09:00",
    registration_closes_at: "2026-03-01T23:59:59+09:00",
    location: "경주 보문호",
    distance_options: ["Full", "Half", "10K"],
    official_url: "https://www.gyeongjumarathon.com",
    registration_url: "https://www.gyeongjumarathon.com/register",
    image_url: null,
    description: "벚꽃이 만개한 경주에서 달리는 아름다운 봄 마라톤.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "춘천마라톤",
    name_en: "Chuncheon Marathon",
    slug: "chuncheon-marathon",
    date: "2026-10-25",
    registration_opens_at: "2026-07-01T10:00:00+09:00",
    registration_closes_at: "2026-09-30T23:59:59+09:00",
    location: "춘천 의암호",
    distance_options: ["Full", "Half", "10K"],
    official_url: "https://www.chuncheonmarathon.com",
    registration_url: "https://www.chuncheonmarathon.com/register",
    image_url: null,
    description: "아름다운 의암호를 따라 달리는 가을 마라톤의 대명사.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "대구국제마라톤",
    name_en: "Daegu International Marathon",
    slug: "daegu-marathon",
    date: "2026-04-12",
    registration_opens_at: "2026-01-20T10:00:00+09:00",
    registration_closes_at: "2026-03-15T23:59:59+09:00",
    location: "대구 두류공원",
    distance_options: ["Full", "Half", "10K"],
    official_url: "https://www.daegumarathon.com",
    registration_url: "https://www.daegumarathon.com/register",
    image_url: null,
    description: "대구를 대표하는 국제 마라톤 대회.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "부산마라톤",
    name_en: "Busan Marathon",
    slug: "busan-marathon",
    date: "2026-05-03",
    registration_opens_at: "2026-02-01T10:00:00+09:00",
    registration_closes_at: "2026-04-01T23:59:59+09:00",
    location: "부산 광안리",
    distance_options: ["Full", "Half", "10K", "5K"],
    official_url: "https://www.busanmarathon.com",
    registration_url: "https://www.busanmarathon.com/register",
    image_url: null,
    description: "광안대교와 해운대 해변을 달리는 부산의 대표 마라톤.",
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function HomePage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">
          2026 마라톤 <span className="text-primary">광클 방지기</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          인기 마라톤 대회 참가 신청, 더 이상 놓치지 마세요!
          <br />
          신청 오픈 10분 전 알림으로 완벽한 타이밍을 잡아드립니다.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <span>실시간 카운트다운</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <span>푸시 & 이메일 알림</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <span>관심 대회 관리</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <span>바로가기 링크</span>
          </div>
        </div>
      </section>

      {/* Marathon List */}
      <section>
        <MarathonList marathons={mockMarathons} />
      </section>
    </div>
  );
}
