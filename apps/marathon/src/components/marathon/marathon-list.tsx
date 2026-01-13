"use client";

import { useState } from "react";
import { MarathonCard } from "./marathon-card";
import { AlertSettingsDialog } from "./alert-settings-dialog";
import { Marathon, AlertSettings } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/auth/login-dialog";
import { Button } from "@/components/ui/button";

interface MarathonListProps {
  marathons: Marathon[];
  favorites?: string[];
  alertSettings?: Record<string, AlertSettings>;
  onToggleFavorite?: (marathonId: string) => void;
  onSaveAlertSettings?: (
    marathonId: string,
    settings: Partial<AlertSettings>
  ) => void;
}

export function MarathonList({
  marathons,
  favorites = [],
  alertSettings = {},
  onToggleFavorite,
  onSaveAlertSettings,
}: MarathonListProps) {
  const { user } = useAuth();
  const [selectedMarathon, setSelectedMarathon] = useState<Marathon | null>(
    null
  );
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const featuredMarathons = marathons.filter((m) => m.is_featured);
  const allMarathons = marathons;
  const favoriteMarathons = marathons.filter((m) => favorites.includes(m.id));

  const handleSetAlert = (marathon: Marathon) => {
    if (!user) {
      return;
    }
    setSelectedMarathon(marathon);
    setAlertDialogOpen(true);
  };

  const handleSaveAlert = (settings: Partial<AlertSettings>) => {
    if (selectedMarathon && onSaveAlertSettings) {
      onSaveAlertSettings(selectedMarathon.id, settings);
    }
  };

  const renderMarathonGrid = (items: Marathon[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((marathon) => (
        <MarathonCard
          key={marathon.id}
          marathon={marathon}
          isFavorite={favorites.includes(marathon.id)}
          isLoggedIn={!!user}
          onToggleFavorite={() => onToggleFavorite?.(marathon.id)}
          onSetAlert={() => handleSetAlert(marathon)}
        />
      ))}
    </div>
  );

  if (marathons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">등록된 마라톤 대회가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="featured">
            인기 대회 ({featuredMarathons.length})
          </TabsTrigger>
          <TabsTrigger value="all">전체 ({allMarathons.length})</TabsTrigger>
          {user && (
            <TabsTrigger value="favorites">
              관심 ({favoriteMarathons.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="featured">
          {renderMarathonGrid(featuredMarathons)}
        </TabsContent>

        <TabsContent value="all">{renderMarathonGrid(allMarathons)}</TabsContent>

        {user && (
          <TabsContent value="favorites">
            {favoriteMarathons.length > 0 ? (
              renderMarathonGrid(favoriteMarathons)
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  아직 관심 등록한 대회가 없습니다.
                </p>
                <Button variant="outline" asChild>
                  <a href="#all">대회 둘러보기</a>
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {!user && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
          <span className="text-sm">
            로그인하고 관심 대회 알림을 받아보세요!
          </span>
          <LoginDialog>
            <Button size="sm">로그인</Button>
          </LoginDialog>
        </div>
      )}

      {selectedMarathon && (
        <AlertSettingsDialog
          marathon={selectedMarathon}
          open={alertDialogOpen}
          onOpenChange={setAlertDialogOpen}
          initialSettings={alertSettings[selectedMarathon.id]}
          onSave={handleSaveAlert}
        />
      )}
    </>
  );
}
