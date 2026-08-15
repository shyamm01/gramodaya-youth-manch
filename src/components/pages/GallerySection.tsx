'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Image as ImageIcon, Plus, Trash2, Check, Edit2 } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Dialog,
  Badge,
} from '../ui';

export const GallerySection: React.FC = () => {
  const {
    gallery: contextGallery,
    uploadGalleryPhoto,
    approveGalleryPhoto,
    editGalleryCaption,
    deleteGalleryItem,
    authSession,
    isApprovedMember,
    setIsMemberLoginModalOpen,
    t,
  } = useApp();

  const [fetchedGallery, setFetchedGallery] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unapprovedAlert, setUnapprovedAlert] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [newCaptionText, setNewCaptionText] = useState('');
  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dedicated API Fetch: GET /api/gallery
  const fetchGallery = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gallery', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.gallery)) {
          setFetchedGallery(data.gallery);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch /api/gallery:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const gallery = fetchedGallery || contextGallery;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    setSubmitting(true);
    setMsg('');

    const res = await uploadGalleryPhoto(caption, photoUrl);
    setSubmitting(false);

    if (res.success) {
      if (authSession.isAdminLoggedIn) {
        setMsg('फोटो गैलरी में अपलोड हो गई!');
      } else {
        setMsg('फोटो जमा कर दी गई है! एडमिन अनुमोदन के पश्चात यह गैलरी में दिखाई देगी।');
      }
      setCaption('');
      setPhotoUrl('');
      fetchGallery();
      setTimeout(() => {
        setIsModalOpen(false);
        setMsg('');
      }, 1800);
    } else {
      setMsg(res.error || 'त्रुटि हुई।');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const startEditCaption = (id: string, currentCaption: string) => {
    setEditingCaptionId(id);
    setNewCaptionText(currentCaption);
  };

  const saveCaptionEdit = async (id: string) => {
    if (newCaptionText.trim()) {
      await editGalleryCaption(id, newCaptionText);
    }
    setEditingCaptionId(null);
  };

  // Filter gallery items: Admin sees all, Public sees ONLY published
  const visibleGallery = authSession.isAdminLoggedIn
    ? gallery
    : gallery.filter((item) => item.status === 'published');

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.gallery')}</span>
          </h1>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {t('home.gallerySubtitle')}
          </p>
        </div>

        <Button
          variant="default"
          size="default"
          onClick={() => {
            if (!authSession.isAdminLoggedIn && !authSession.isMemberLoggedIn) {
              setIsMemberLoginModalOpen(true);
            } else if (!isApprovedMember) {
              setUnapprovedAlert(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          className="rounded-xl font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>{t('gallery.uploadPhoto')}</span>
        </Button>
      </div>

      {/* Pending Approval Notice Banner for Unapproved Member */}
      {authSession.isMemberLoggedIn && !isApprovedMember && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है।</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                आप गांव की सभी तस्वीरें देख सकते हैं। एडमिन द्वारा सदस्यता अनुमोदन के बाद आप नई तस्वीरें अपलोड कर सकेंगे।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal alert popup if unapproved member tries to upload */}
      {unapprovedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              सदस्यता अनुमोदन लंबित (Pending Approval)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              आपकी सदस्यता का सत्यापन अभी एडमिन द्वारा किया जा रहा है। आप गैलरी की सभी तस्वीरें देख सकते हैं। अनुमोदन के बाद आप तस्वीरें अपलोड कर सकेंगे।
            </p>
            <Button
              variant="default"
              size="default"
              onClick={() => setUnapprovedAlert(false)}
              className="w-full rounded-xl font-bold"
            >
              समझ गया (Got It)
            </Button>
          </div>
        </div>
      )}

      {visibleGallery.length === 0 ? (
        <Card className="p-10 text-center text-[#8C8675] dark:text-slate-400 max-w-2xl mx-auto rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <ImageIcon className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white">{t('home.noGallery')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleGallery.map((item) => (
            <Card key={item.id} className="overflow-hidden group flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all">
              <div>
                <div className="h-48 bg-[#F7F5F0] dark:bg-slate-900 relative overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {authSession.isAdminLoggedIn && item.status === 'pending' && (
                    <Badge variant="warning" className="absolute top-2 left-2 shadow text-[10px]">
                      अनुमोदन लंबित
                    </Badge>
                  )}
                </div>

                <div className="p-3.5">
                  {editingCaptionId === item.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        value={newCaptionText}
                        onChange={(e) => setNewCaptionText(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => saveCaptionEdit(item.id)}
                      >
                        सहेजें
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-bold text-[#2C3327] dark:text-white line-clamp-2">{item.caption}</p>
                      {authSession.isAdminLoggedIn && (
                        <button
                          onClick={() => startEditCaption(item.id, item.caption)}
                          className="text-[#8C8675] hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5"
                          title="कैप्शन बदलें"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-[#8C8675] dark:text-slate-400 font-medium mt-1">
                    {item.date} • {item.uploadedBy || 'Member'}
                  </p>
                </div>
              </div>

              {authSession.isAdminLoggedIn && (
                <div className="p-2.5 pt-2 border-t border-[#E0DCCF] dark:border-slate-800 flex items-center justify-between gap-2 bg-[#F7F5F0]/50 dark:bg-slate-900/50">
                  {item.status === 'pending' ? (
                    <Button
                      size="xs"
                      variant="default"
                      className="flex-1"
                      onClick={() => approveGalleryPhoto(item.id)}
                    >
                      <Check className="w-3 h-3" />
                      <span>स्वीकृत करें</span>
                    </Button>
                  ) : (
                    <Badge variant="emerald" className="text-[10px]">
                      प्रकाशित
                    </Badge>
                  )}

                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => deleteGalleryItem(item.id)}
                    className="h-6 w-6 p-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Upload Photo Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="फोटो अपलोड करें"
        description="ग्रामोदय यूथ मंच रसूलपुर की गैलरी हेतु चित्र साझा करें।"
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">कैप्शन</label>
            <Input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="उदा. ग्राम स्वच्छता कार्यक्रम 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">फोटो चुनें *</label>
            <input
              type="file"
              required
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full text-xs text-[#8C8675] dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-800 dark:file:text-emerald-300"
            />
          </div>

          {photoUrl && (
            <div className="h-40 rounded-xl overflow-hidden border border-[#E0DCCF] dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900">
              <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          {msg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold rounded-xl">
              {msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={submitting || !photoUrl}
            >
              {submitting ? t('common.loading') : 'अपलोड करें'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
