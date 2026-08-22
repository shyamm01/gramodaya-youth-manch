'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { HeartHandshake, Plus, Calendar, MapPin, Trash2, Share2 } from 'lucide-react';
import { Button, Card, Input, Textarea, Modal } from '../ui';
import { DatePicker, ImageUploader } from '../inputs';
import { WhatsAppIcon } from '../common';

export const SocialWorkSection: React.FC = () => {
  const {
    socialWorks: contextSocialWorks,
    submitSocialWork,
    authSession,
    isApprovedMember,
    currentMemberMobile,
    canDeleteContent,
    updateSocialWorkStatus,
    deleteSocialWork,
    t,
    lang,
    villageSettings,
  } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [fetchedSocialWorks, setFetchedSocialWorks] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unapprovedAlert, setUnapprovedAlert] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(lang === 'en' ? (villageSettings.name || 'Rasoolpur') : villageSettings.nameHindi);
  const [submitterName, setSubmitterName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inFlightSocialWorksPromiseRef = React.useRef<Promise<any> | null>(null);

  // Dedicated API Fetch: GET /api/social-work (deduplicated)
  const fetchSocialWorks = React.useCallback(async () => {
    if (inFlightSocialWorksPromiseRef.current) {
      return inFlightSocialWorksPromiseRef.current;
    }
    const promise = (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/social-work', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.socialWorks)) {
            setFetchedSocialWorks(data.socialWorks);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/social-work:', e);
      } finally {
        setLoading(false);
        inFlightSocialWorksPromiseRef.current = null;
      }
    })();
    inFlightSocialWorksPromiseRef.current = promise;
    return promise;
  }, []);

  React.useEffect(() => {
    fetchSocialWorks();
  }, [fetchSocialWorks]);

  const socialWorks = fetchedSocialWorks || contextSocialWorks;

  // Approved/Published social works visible to public
  const publicWorks = socialWorks.filter(
    (s) => s.status === 'approved' || s.status === 'published'
  );
  const pendingWorks = socialWorks.filter((s) => s.status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    setMsg('');

    const res = await submitSocialWork({
      title,
      description,
      date,
      location,
      submitterName: submitterName || (lang === 'en' ? 'Member' : 'ग्राम सदस्य'),
      submitterMobile: currentMemberMobile || '',
      photoUrl,
    });

    setSubmitting(false);

    if (res.success) {
      setMsg(lang === 'en' ? 'Your submission has been received and is awaiting admin review.' : 'आपकी जानकारी प्राप्त हो गई है और एडमिन स्वीकृति की प्रतीक्षा है।');
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      fetchSocialWorks();
      setTimeout(() => {
        setIsModalOpen(false);
        setMsg('');
      }, 2000);
    } else {
      setMsg(res.error || (lang === 'en' ? 'An error occurred. Please try again.' : 'त्रुटि हुई। कृपया पुनः प्रयास करें।'));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.socialWork')}</span>
          </h1>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {t('home.socialWorkSubtitle')}
          </p>
        </div>

        <Button
          variant="default"
          size="default"
          onClick={() => {
            if (!authSession.isAdminLoggedIn && !authSession.isMemberLoggedIn) {
              router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`);
            } else if (!isApprovedMember) {
              setUnapprovedAlert(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          className="rounded-xl font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>{t('socialWork.addNewBtn')}</span>
        </Button>
      </div>

      {/* Pending Approval Notice Banner for Unapproved Member */}
      {authSession.isMemberLoggedIn && !isApprovedMember && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है।</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                आप गांव के सभी सामाजिक विकास कार्य और विवरण देख सकते हैं। एडमिन अनुमोदन के बाद आप नए सामाजिक कार्य पोस्ट कर सकेंगे।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal alert popup if unapproved member tries to post */}
      {unapprovedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              सदस्यता अनुमोदन लंबित (Pending Approval)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              आपकी सदस्यता का सत्यापन अभी एडमिन द्वारा किया जा रहा है। आप सभी सार्वजनिक सामाजिक कार्य देख सकते हैं। अनुमोदन के बाद आप नई प्रविष्टियां पोस्ट कर सकेंगे।
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

      {/* Admin Pending Review Section */}
      {authSession.isAdminLoggedIn && pendingWorks.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-3">
            {lang === 'en' ? `Pending Social Work Submissions (${pendingWorks.length})` : `समीक्षा हेतु लंबित सामाजिक कार्य (${pendingWorks.length})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingWorks.map((sw) => (
              <Card key={sw.id} className="p-4 shadow-2xs rounded-2xl">
                <h4 className="font-bold text-[#2C3327] dark:text-white text-sm">{sw.title}</h4>
                <p className="text-xs text-[#8C8675] dark:text-slate-400 my-1">{sw.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
                  <span className="text-[11px] text-[#8C8675] dark:text-slate-500">
                    {lang === 'en' ? `By: ${sw.submitterName}` : `प्रस्तावक: ${sw.submitterName}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="default"
                      onClick={() => updateSocialWorkStatus(sw.id, 'approved')}
                      className="rounded-lg text-xs"
                    >
                      {t('members.approveBtn')}
                    </Button>
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => deleteSocialWork(sw.id)}
                      className="h-6 w-6 p-0 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Public Social Works Grid */}
      {publicWorks.length === 0 ? (
        <Card className="p-10 text-center text-[#8C8675] dark:text-slate-400 rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <HeartHandshake className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white">
            {t('socialWork.noWorks')}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {publicWorks.map((sw) => {
            const shareText = encodeURIComponent(
              `*${lang === 'en' ? villageSettings.orgName : villageSettings.orgNameHindi} - ${t('nav.socialWork')}*\n\n📌 *${sw.title}*\n📝 ${sw.description}\n📅 ${sw.date}\n📍 ${sw.location}`
            );
            const waUrl = `https://wa.me/?text=${shareText}`;

            return (
              <Card
                key={sw.id}
                className="p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all rounded-2xl"
              >
                <div>
                  {sw.photoUrl && (
                    <div className="h-40 rounded-xl overflow-hidden border border-[#E0DCCF] dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900 mb-3">
                      <img src={sw.photoUrl} alt={sw.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-extrabold text-[#2C3327] dark:text-white text-sm mb-1">{sw.title}</h3>
                  <p className="text-xs text-[#8C8675] dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">{sw.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[#8C8675] dark:text-slate-400 pt-2 border-t border-[#E0DCCF] dark:border-slate-800 mb-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {sw.date}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      {sw.location}
                    </span>
                  </div>

                  {/* WhatsApp Share Button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Share on WhatsApp' : 'व्हाट्सएप पर शेयर करें'}</span>
                  </a>

                  {(authSession.isAdminLoggedIn || canDeleteContent(sw.submitterMobile, sw.villageId)) && (
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#E0DCCF] dark:border-slate-800">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                        {authSession.isAdminLoggedIn ? 'एडमिन नियंत्रण' : '✓ आपकी प्रविष्टि'}
                      </span>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => deleteSocialWork(sw.id)}
                        className="h-7 px-2.5 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
                        title="हटाएं (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटाएं</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Social Work Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('socialWork.addNewBtn')}
        description={lang === 'en' ? 'Share village welfare, cleanup, tree plantation or community support activity.' : 'गांव में किए गए अथवा प्रस्तावित सामाजिक सेवा कार्य की जानकारी साझा करें।'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Activity Title *' : 'कार्य का शीर्षक *'}
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. वृक्षारोपण अभियान या स्वच्छता कार्यक्रम"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Date *' : 'दिनांक *'}
              </label>
              <DatePicker
                value={date}
                required
                onChange={setDate}
                placeholder={lang === 'en' ? 'Select Date' : 'तारीख चुनें'}
                lang={lang}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                {lang === 'en' ? 'Location *' : 'स्थान *'}
              </label>
              <Input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="उदा. प्राथमिक विद्यालय प्रांगण"
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Your Name *' : 'आपका नाम *'}
            </label>
            <Input
              type="text"
              required
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="उदा. अमित कुमार"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              {lang === 'en' ? 'Description *' : 'विस्तृत विवरण *'}
            </label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="कार्य के संबंध में पूरी जानकारी लिखें..."
              className="rounded-xl"
            />
          </div>

          {/* Social Work Photo Upload with Drag & Drop & Supabase Storage */}
          <div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="social_work"
              label={t('problems.uploadPhotoLabel')}
              aspectRatio="video"
              hint="फ़ोटो यहाँ खींचें या क्लिक करें (Drag & Drop or Click)"
            />
          </div>

          {msg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl whitespace-pre-line">
              {msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={submitting}
              className="rounded-xl"
            >
              {submitting ? t('common.loading') : t('common.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
