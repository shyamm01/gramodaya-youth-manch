'use client';

/**
 * "Ask about this scheme" — posts to /api/education/enquiries.
 *
 * Public on purpose: a student or parent should not need an account to ask for
 * help with a scholarship. When someone is logged in the API links the enquiry
 * to their profile, so the form only asks for what it cannot infer.
 */

import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dialog, Button } from '../ui';
import { submitEducationEnquiry } from '@/src/lib/education/client';

interface EducationEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Scheme the enquiry is about — shown as context and stored with it. */
  resourceId?: string;
  resourceTitle?: string;
  categoryId?: string;
}

export const EducationEnquiryModal: React.FC<EducationEnquiryModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
  categoryId,
}) => {
  const { t, authSession } = useApp();
  const currentMember = (authSession as any)?.currentMember;

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Prefill from the session and reset between openings.
  useEffect(() => {
    if (!isOpen) return;
    setName(currentMember?.name || '');
    setMobile(currentMember?.mobile || '');
    setStudentClass('');
    setMessage('');
    setError(null);
    setDone(false);
  }, [isOpen, currentMember?.name, currentMember?.mobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(t('education.enquiry.errorName'));
      return;
    }
    if (mobile.replace(/\D/g, '').length < 10) {
      setError(t('education.enquiry.errorMobile'));
      return;
    }
    if (message.trim().length < 5) {
      setError(t('education.enquiry.errorMessage'));
      return;
    }

    setSubmitting(true);
    const result = await submitEducationEnquiry({
      name: name.trim(),
      mobile: mobile.trim(),
      message: message.trim(),
      studentClass: studentClass.trim() || undefined,
      resourceId,
      categoryId,
    });
    setSubmitting(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error || t('education.enquiry.errorGeneric'));
    }
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 bg-[#FBF9F5] dark:bg-[#0B0F17] border border-[#E0DCCF] dark:border-slate-800 rounded-xl text-xs text-[#2C3327] dark:text-white outline-none focus:border-emerald-500 transition';
  const labelClass =
    'block text-[10px] font-bold uppercase tracking-wider text-[#8C8675] dark:text-slate-400 mb-1.5';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('education.enquiry.title')}
      description={resourceTitle || t('education.enquiry.subtitle')}
      maxWidth="lg"
    >
      {done ? (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white">
            {t('education.enquiry.successTitle')}
          </p>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {t('education.enquiry.successBody')}
          </p>
          <Button size="sm" onClick={onClose} className="mt-2">
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('education.enquiry.name')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder={t('education.enquiry.namePlaceholder')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('education.enquiry.mobile')}</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`${fieldClass} font-mono`}
                placeholder="9XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('education.enquiry.class')}</label>
            <input
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className={fieldClass}
              placeholder={t('education.enquiry.classPlaceholder')}
            />
          </div>

          <div>
            <label className={labelClass}>{t('education.enquiry.message')}</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={fieldClass}
              placeholder={t('education.enquiry.messagePlaceholder')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {submitting ? t('common.loading') : t('education.enquiry.submit')}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
