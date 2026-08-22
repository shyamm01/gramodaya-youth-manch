'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button, Modal } from '../../ui';

interface GrievanceDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  complaintTitle: string;
  lang: string;
  isDeleting: boolean;
}

export const GrievanceDeleteModal: React.FC<GrievanceDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  complaintTitle,
  lang,
  isDeleting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'en' ? 'Delete Grievance' : 'शिकायत हटाएं'}
      description={
        lang === 'en'
          ? 'This action cannot be undone. Are you sure you want to delete this grievance post?'
          : 'यह कार्रवाई वापस नहीं ली जा सकती। क्या आप वाकई इस शिकायत को हटाना चाहते हैं?'
      }
    >
      <div className="space-y-4 pt-2">
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {complaintTitle}
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
              {lang === 'en'
                ? 'All details and attachments associated with this grievance will be permanently removed.'
                : 'इस शिकायत से जुड़े सभी विवरण और फ़ोटो हमेशा के लिए हटा दिए जाएंगे।'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl font-bold cursor-pointer"
          >
            {lang === 'en' ? 'Cancel' : 'रद्द करें'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? (lang === 'en' ? 'Deleting...' : 'हटाया जा रहा है...') : (lang === 'en' ? 'Confirm Delete' : 'हटाएं')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
