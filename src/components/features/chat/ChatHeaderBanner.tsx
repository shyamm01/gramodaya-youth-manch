'use client';

import React from 'react';
import { MessageSquare, User, RefreshCw, Sparkles } from 'lucide-react';
import { Member } from '../../../types';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

interface ChatHeaderBannerProps {
  senderName: string;
  currentMemberObj?: Member;
  activeMembersCount: number;
  onOpenIdentityModal: () => void;
  onRefresh: () => void;
  lang: string;
  orgName: string;
  orgNameHindi: string;
}

export const ChatHeaderBanner: React.FC<ChatHeaderBannerProps> = ({
  senderName,
  currentMemberObj,
  activeMembersCount,
  onOpenIdentityModal,
  onRefresh,
  lang,
  orgName,
  orgNameHindi,
}) => {
  return (
    <Card className="bg-gradient-to-r from-emerald-950/20 via-card to-background border-emerald-500/20 shadow-sm backdrop-blur-md">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Branding */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-500 dark:to-emerald-900 text-white flex items-center justify-center shadow-lg shadow-emerald-900/20 border border-emerald-400/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                {lang === 'en' ? 'Live Community Chat' : 'लाइव ग्राम संवाद मंच'}
              </h1>
              <Badge variant="emerald" className="gap-1.5 font-bold shadow-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeMembersCount} {lang === 'en' ? 'Online' : 'सक्रिय'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {lang === 'en' ? orgName : orgNameHindi} • {lang === 'en' ? 'Realtime Village Hub' : 'रियल-टाइम ग्राम विकास नेटवर्क'}
            </p>
          </div>
        </div>

        {/* Identity & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenIdentityModal}
            className="gap-2 font-bold shadow-xs hover:border-emerald-500/50"
            title={lang === 'en' ? 'Change your sender identity' : 'पहचान बदलें'}
          >
            <Avatar className="w-5 h-5 border border-emerald-500/30">
              {currentMemberObj?.photoUrl ? (
                <AvatarImage src={currentMemberObj.photoUrl} alt={currentMemberObj.name} />
              ) : null}
              <AvatarFallback className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black">
                {(currentMemberObj?.name || senderName).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[130px] sm:max-w-[170px]">
              {currentMemberObj ? currentMemberObj.name : senderName}
            </span>
            <span className="text-[10px] text-muted-foreground">✎</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="shadow-xs hover:text-emerald-600 hover:border-emerald-500/50"
            title={lang === 'en' ? 'Refresh messages' : 'रिफ्रेश करें'}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
