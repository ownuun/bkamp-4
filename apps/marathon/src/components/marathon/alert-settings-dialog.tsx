"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Marathon, AlertSettings } from "@/types";
import { Bell, Mail } from "lucide-react";

interface AlertSettingsDialogProps {
  marathon: Marathon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSettings?: AlertSettings | null;
  onSave: (settings: Partial<AlertSettings>) => void;
}

export function AlertSettingsDialog({
  marathon,
  open,
  onOpenChange,
  initialSettings,
  onSave,
}: AlertSettingsDialogProps) {
  const [alert10min, setAlert10min] = useState(
    initialSettings?.alert_10min ?? true
  );
  const [alert5min, setAlert5min] = useState(
    initialSettings?.alert_5min ?? true
  );
  const [alert1min, setAlert1min] = useState(
    initialSettings?.alert_1min ?? true
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave({
      alert_10min: alert10min,
      alert_5min: alert5min,
      alert_1min: alert1min,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>알림 설정</DialogTitle>
          <DialogDescription>
            {marathon.name} 신청 오픈 알림을 설정하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">알림 시점</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="alert-10min"
                  checked={alert10min}
                  onCheckedChange={(checked) =>
                    setAlert10min(checked as boolean)
                  }
                />
                <Label htmlFor="alert-10min" className="cursor-pointer">
                  10분 전
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="alert-5min"
                  checked={alert5min}
                  onCheckedChange={(checked) =>
                    setAlert5min(checked as boolean)
                  }
                />
                <Label htmlFor="alert-5min" className="cursor-pointer">
                  5분 전
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="alert-1min"
                  checked={alert1min}
                  onCheckedChange={(checked) =>
                    setAlert1min(checked as boolean)
                  }
                />
                <Label htmlFor="alert-1min" className="cursor-pointer">
                  1분 전
                </Label>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              웹 푸시 알림
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              이메일 알림
            </div>
            <p className="text-xs text-muted-foreground">
              설정에서 알림 수신 방법을 변경할 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
