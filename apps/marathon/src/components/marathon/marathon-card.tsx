"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "./countdown-timer";
import { Marathon } from "@/types";
import {
  Heart,
  Bell,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";

interface MarathonCardProps {
  marathon: Marathon;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSetAlert?: () => void;
  isLoggedIn?: boolean;
}

function getRegistrationStatus(
  opensAt: string,
  closesAt: string | null
): "upcoming" | "open" | "closed" {
  const now = new Date();
  const openDate = parseISO(opensAt);
  const closeDate = closesAt ? parseISO(closesAt) : null;

  if (isBefore(now, openDate)) {
    return "upcoming";
  }
  if (closeDate && isAfter(now, closeDate)) {
    return "closed";
  }
  return "open";
}

export function MarathonCard({
  marathon,
  isFavorite = false,
  onToggleFavorite,
  onSetAlert,
  isLoggedIn = false,
}: MarathonCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const status = getRegistrationStatus(
    marathon.registration_opens_at,
    marathon.registration_closes_at
  );

  const handleToggleFavorite = () => {
    setFavorite(!favorite);
    onToggleFavorite?.();
  };

  const registrationDate = parseISO(marathon.registration_opens_at);
  const eventDate = parseISO(marathon.date);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight">{marathon.name}</h3>
              {marathon.is_featured && (
                <Badge variant="default" className="text-xs">
                  인기
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {marathon.location}
            </div>
          </div>
          <Badge
            variant={
              status === "open"
                ? "success"
                : status === "upcoming"
                ? "secondary"
                : "outline"
            }
          >
            {status === "open"
              ? "신청중"
              : status === "upcoming"
              ? "신청예정"
              : "마감"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {marathon.distance_options?.map((distance) => (
            <Badge key={distance} variant="outline" className="text-xs">
              {distance}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              대회일:{" "}
              <strong>
                {format(eventDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              신청 오픈:{" "}
              <strong>
                {format(registrationDate, "M월 d일 a h시", { locale: ko })}
              </strong>
            </span>
          </div>
        </div>

        {status === "upcoming" && (
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">신청 오픈까지</p>
            <CountdownTimer targetDate={registrationDate} />
          </div>
        )}

        {status === "open" && marathon.registration_url && (
          <Button asChild className="w-full">
            <a
              href={marathon.registration_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              지금 신청하기
            </a>
          </Button>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 gap-2">
        {isLoggedIn && (
          <>
            <Button
              variant={favorite ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorite}
              className="flex-1"
            >
              <Heart
                className={`h-4 w-4 mr-1 ${favorite ? "fill-current" : ""}`}
              />
              {favorite ? "관심" : "관심 등록"}
            </Button>
            {status === "upcoming" && (
              <Button variant="outline" size="sm" onClick={onSetAlert} className="flex-1">
                <Bell className="h-4 w-4 mr-1" />
                알림 설정
              </Button>
            )}
          </>
        )}
        {marathon.official_url && (
          <Button variant="ghost" size="sm" asChild>
            <a
              href={marathon.official_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
