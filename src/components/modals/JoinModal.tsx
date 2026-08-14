'use client';

import React, { useState } from 'react';
import { User, Phone, Calendar, CheckCircle, HeartHandshake, Building2, Camera } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Button,
  Input,
  Dialog,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../ui';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const { addMember, villageSettings, t } = useApp();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [organizationName, setOrganizationName] = useState(villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच');
  const [joiningDate, setJoiningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError('कृपया अपना नाम एवं मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const res = await addMember(name, mobile, photoUrl, joiningDate, organizationName);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setMobile('');
        setPhotoUrl('');
        setOrganizationName(villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच');
        setJoiningDate(new Date().toISOString().split('T')[0]);
        onClose();
      }, 2500);
    } else {
      setError(res.error || 'पंजीकरण करने में त्रुटि हुई।');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="ग्रामोदय यूथ मंच — सदस्यता फॉर्म"
      description="डिजिटल सदस्य कार्ड हेतु विवरण भरें"
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-extrabold text-base">आवेदन सफलतापूर्वक जमा हुआ!</h4>
            <p className="text-xs font-medium leading-relaxed">
              आपका अनुरोध एडमिन स्वीकृति के बाद सक्रिय होगा और आपका डिजिटल ID कार्ड जनरेट हो जाएगा।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Preview & Picker */}
            <div className="flex flex-col items-center justify-center">
              <Avatar size="xl" className="border-2 border-emerald-600 dark:border-emerald-500 mb-2">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt="Preview" />
                ) : (
                  <AvatarFallback>
                    <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition">
                <Camera className="w-3.5 h-3.5" />
                <span>{photoUrl ? 'फ़ोटो बदलें' : 'अपनी फोटो अपलोड करें'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            </div>

            {/* Field 1: Name */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                सदस्य का नाम *
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राहुल कुमार"
              />
            </div>

            {/* Field 2: Mobile */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                मोबाइल नंबर *
              </label>
              <Input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="उदा. +91 98765 43210"
              />
            </div>

            {/* Field 3: Date */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                जुड़ने की तिथि *
              </label>
              <Input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            {/* Field 4: Sanghthan Name */}
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                संगठन का नाम *
              </label>
              <Input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="उदा. ग्रामोदय यूथ मंच"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="amber"
              size="lg"
              className="w-full"
            >
              {isSubmitting ? 'जमा हो रहा है...' : 'सदस्यता हेतु आवेदन करें'}
            </Button>
          </form>
        )}
      </div>
    </Dialog>
  );
};
