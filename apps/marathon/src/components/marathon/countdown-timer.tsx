"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (!mounted) {
    return (
      <div className="flex gap-2 text-lg font-mono">
        <span className="bg-muted px-2 py-1 rounded">--</span>:
        <span className="bg-muted px-2 py-1 rounded">--</span>:
        <span className="bg-muted px-2 py-1 rounded">--</span>
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className="text-lg font-bold text-green-600 animate-pulse">
        NOW OPEN!
      </div>
    );
  }

  // Show D-Day format if more than 1 day
  if (timeLeft.days > 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-primary">D-{timeLeft.days}</span>
        <span className="text-sm text-muted-foreground">
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  // Show HH:MM:SS when less than 1 day
  return (
    <div className="flex gap-1 text-xl font-mono font-bold text-primary">
      <span className="bg-primary/10 px-2 py-1 rounded">
        {String(timeLeft.hours).padStart(2, "0")}
      </span>
      <span>:</span>
      <span className="bg-primary/10 px-2 py-1 rounded">
        {String(timeLeft.minutes).padStart(2, "0")}
      </span>
      <span>:</span>
      <span className="bg-primary/10 px-2 py-1 rounded">
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
