'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Member } from '../../../types';
import { Modal } from '../../ui/modal';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';

interface ChatIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mobileInput: string;
  onMobileInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loginError: string;
  activeMembers: Member[];
  onSelectMember: (m: Member) => void;
  lang: string;
  villageName: string;
  villageNameHindi: string;
}

export const ChatIdentityModal: React.FC<ChatIdentityModalProps> = ({
  isOpen,
  onClose,
  mobileInput,
  onMobileInputChange,
  onSubmit,
  loginError,
  activeMembers,
  onSelectMember,
  lang,
  villageName,
  villageNameHindi,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>{lang === 'en' ? 'Confirm Member Identity' : 'सदस्य पहचान की पुष्टि करें'}</span>
        </div>
      }
      description={
        lang === 'en'
          ? `Active verified members of ${villageName}:`
          : `ग्राम ${villageNameHindi} के स्वीकृत सदस्य:`
      }
    >
      <div className="p-5 sm:p-6 space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {lang === 'en' ? 'Registered Mobile Number *' : 'पंजीकृत मोबाइल नंबर *'}
            </label>
            <Input
              type="text"
              required
              placeholder="उदा. 9876543210"
              value={mobileInput}
              onChange={(e) => onMobileInputChange(e.target.value)}
              className="h-10 text-sm font-bold rounded-xl"
            />
          </div>

          {loginError && (
            <p className="text-xs font-bold text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
              {loginError}
            </p>
          )}

          <Button
            type="submit"
            variant="emerald"
            className="w-full h-10 font-bold text-xs rounded-xl shadow-md"
          >
            {lang === 'en' ? 'Verify & Continue' : 'पुष्टि करें'}
          </Button>
        </form>

        <div className="pt-4 border-t border-border">
          <p className="text-xs font-bold text-muted-foreground mb-2">
            {lang === 'en' ? 'Or select your name from active directory:' : 'या सूची में से अपना नाम चुनें:'}
          </p>
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {activeMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMember(m)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted border border-border text-left cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-border">
                    {m.photoUrl ? <AvatarImage src={m.photoUrl} alt={m.name} /> : null}
                    <AvatarFallback className="text-[10px] font-bold">
                      {m.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-foreground">{m.name}</span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] py-0 px-1 font-bold">
                  {m.mobile}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
