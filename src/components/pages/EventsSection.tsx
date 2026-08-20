'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, MapPin, Plus, Trash2, Share2, Edit, Video } from 'lucide-react';
import { EventItem, EventStatus } from '../../types';
import { EventStatusBadge } from '../common/EntityLabels';
import {
  Button,
  Card,
  Input,
  Textarea,
  Dialog,
  DatePicker,
  ImageUploader,
} from '../ui';
import { WhatsAppIcon } from '../common';

export const EventsSection: React.FC = () => {
  const { events: contextEvents, createEvent, updateEvent, updateEventStatus, deleteEvent, authSession, t } = useApp();

  const [fetchedEvents, setFetchedEvents] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('ग्राम रसूलपुर खेल मैदान');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState<EventStatus>('DRAFT');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inFlightEventsPromiseRef = React.useRef<Promise<any> | null>(null);

  // Dedicated API Fetch: GET /api/events (deduplicated)
  const fetchEvents = React.useCallback(async () => {
    if (inFlightEventsPromiseRef.current) {
      return inFlightEventsPromiseRef.current;
    }
    const promise = (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/events', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.events)) {
            setFetchedEvents(data.events);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/events:', e);
      } finally {
        setLoading(false);
        inFlightEventsPromiseRef.current = null;
      }
    })();
    inFlightEventsPromiseRef.current = promise;
    return promise;
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const events = fetchedEvents || contextEvents;

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle('');
    setDate('');
    setTime('10:00 AM');
    setLocation('ग्राम रसूलपुर खेल मैदान');
    setDescription('');
    setPhotoUrl('');
    setVideoUrl('');
    setStatus('DRAFT');
    setMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setTitle(evt.title || evt.name || '');
    setDate(evt.date || '');
    setTime(evt.time || '10:00 AM');
    setLocation(evt.location || 'ग्राम रसूलपुर खेल मैदान');
    setDescription(evt.description || '');
    setPhotoUrl(evt.photoUrl || '');
    setVideoUrl(evt.videoUrl || '');
    setStatus(evt.status || 'DRAFT');
    setMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    setSubmitting(true);
    setMsg('');

    if (editingEventId) {
      const res = await updateEvent(editingEventId, {
        title,
        name: title,
        date,
        time,
        location,
        description,
        photoUrl,
        videoUrl,
        status,
      });
      setSubmitting(false);
      if (res.success) {
        setMsg('कार्यक्रम सफलतापूर्व अद्यतन किया गया!');
        setTimeout(() => {
          setIsModalOpen(false);
          setMsg('');
        }, 1200);
      } else {
        setMsg(res.error || 'त्रुटि हुई।');
      }
    } else {
      const res = await createEvent({
        title,
        name: title,
        date,
        time,
        location,
        description,
        photoUrl,
        videoUrl,
        status,
      });
      setSubmitting(false);
      if (res.success) {
        setMsg('कार्यक्रम सफलतापूर्व जोड़ा गया!');
        setTimeout(() => {
          setIsModalOpen(false);
          setMsg('');
        }, 1200);
      } else {
        setMsg(res.error || 'त्रुटि हुई।');
      }
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

  // Filter visible events: Admin sees all, Public sees ONLY PUBLISHED
  const visibleEvents = authSession.isAdminLoggedIn
    ? events
    : events.filter((e) => e.status === 'PUBLISHED');

  const handleShareWhatsApp = (evt: EventItem) => {
    const evtName = evt.title || evt.name || 'ग्राम कार्यक्रम';
    const text = `*ग्रामोदय यूथ मंच रसूलपुर*\n\n📅 *कार्यक्रम:* ${evtName}\n📅 *दिनांक:* ${evt.date} (${evt.time})\n📍 *स्थान:* ${evt.location}\n\n${evt.description ? '📝 *विवरण:* ' + evt.description : ''}\n\nसबका सहयोग, गांव का विकास!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.events')}</span>
          </h1>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {t('home.eventsSubtitle')}
          </p>
        </div>

        {authSession.isAdminLoggedIn && (
          <Button
            variant="default"
            size="default"
            onClick={openCreateModal}
            className="rounded-xl font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('events.addNewBtn')}</span>
          </Button>
        )}
      </div>

      {visibleEvents.length === 0 ? (
        <Card className="p-10 text-center text-[#8C8675] dark:text-slate-400 max-w-2xl mx-auto rounded-2xl border border-dashed border-[#E0DCCF] dark:border-slate-800">
          <Calendar className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-sm font-bold text-[#2C3327] dark:text-white">{t('home.noEvents')}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleEvents.map((evt) => {
            const evtName = evt.title || evt.name || 'कार्यक्रम';
            return (
              <Card
                key={evt.id}
                className="p-4 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all"
              >
                <div>
                  {evt.photoUrl && (
                    <div className="h-40 rounded-xl overflow-hidden border border-[#E0DCCF] dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900 mb-3">
                      <img src={evt.photoUrl} alt={evtName} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#2C3327] dark:text-white text-sm">{evtName}</h3>
                    {authSession.isAdminLoggedIn && <EventStatusBadge status={evt.status} size="xs" />}
                  </div>

                  {evt.description && <p className="text-xs text-[#8C8675] dark:text-slate-400 mb-3 line-clamp-3">{evt.description}</p>}

                  <div className="space-y-1.5 text-xs text-[#8C8675] dark:text-slate-400 pt-3 border-t border-[#E0DCCF] dark:border-slate-800 font-medium">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{evt.date} ({evt.time || '10:00 AM'})</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{evt.location || 'ग्राम रसूलपुर'}</span>
                    </p>
                    {evt.videoUrl && (
                      <p className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold truncate">
                        <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <a href={evt.videoUrl} target="_blank" rel="noopener noreferrer" className="underline truncate">
                          वीडियो लिंक देखें
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E0DCCF] dark:border-slate-800 flex flex-col gap-2">
                  {evt.status === 'PUBLISHED' && (
                    <Button
                      size="sm"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold cursor-pointer"
                      onClick={() => handleShareWhatsApp(evt)}
                    >
                      <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                      <span>{t('common.whatsapp')}</span>
                    </Button>
                  )}

                  {authSession.isAdminLoggedIn && (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1">
                        {evt.status !== 'PUBLISHED' ? (
                          <Button
                            size="xs"
                            variant="default"
                            onClick={() => updateEventStatus(evt.id, 'PUBLISHED')}
                          >
                            प्रकाशित करें
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => updateEventStatus(evt.id, 'DRAFT')}
                          >
                            अप्रकाशित
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openEditModal(evt)}
                        >
                          <Edit className="w-3 h-3" />
                          <span>संपादित</span>
                        </Button>
                      </div>

                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => deleteEvent(evt.id)}
                        className="h-6 w-6 p-0"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New / Edit Event Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? 'कार्यक्रम संपादित करें' : 'नया कार्यक्रम जोड़ें'}
        description="ग्रामोदय यूथ मंच रसूलपुर के कार्यक्रम की जानकारी दर्ज करें।"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
              कार्यक्रम का शीर्षक *
            </label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. युवा संवाद एवं स्वच्छता अभियान"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">दिनांक *</label>
              <DatePicker
                value={date}
                required
                onChange={setDate}
                placeholder="कार्यक्रम दिनांक चुनें"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">समय</label>
              <Input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">स्थान</label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ग्राम रसूलपुर खेल मैदान"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">विवरण</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="कार्यक्रम की जानकारी लिखें..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">स्थिति</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="w-full h-10 px-3 rounded-xl border border-[#E0DCCF] dark:border-slate-700 bg-[#FDFBF7] dark:bg-[#0B0F17] text-xs font-bold text-[#2C3327] dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="DRAFT">ड्राफ्ट (Draft)</option>
              <option value="PENDING">लंबित (Pending)</option>
              <option value="PUBLISHED">प्रकाशित (Published)</option>
              <option value="COMPLETED">संपन्न (Completed)</option>
              <option value="CANCELLED">रद्द (Cancelled)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">वीडियो लिंक (वैकल्पिक)</label>
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Event Photo Upload with Drag & Drop & Supabase Storage */}
          <div>
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="events"
              label="फोटो अपलोड करें"
              aspectRatio="video"
              hint="इवेंट फ़ोटो यहाँ खींचें या क्लिक करें (Drag & Drop or Click)"
            />
          </div>

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
              disabled={submitting}
            >
              {submitting ? t('common.loading') : t('common.submit')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
