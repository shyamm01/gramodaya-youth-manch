'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { DatePicker } from '@/src/components/inputs/DatePicker';
import { ImageUploader } from '@/src/components/inputs/ImageUploader';
import type { EventItem, EventStatus } from '@/src/types';
import { useAppSelector } from '@/src/store/hooks';
import {
  useGetEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  useDeleteEventMutation,
} from '@/src/store/api/adminApi';
import { selectFilteredEvents, selectEditingEvent } from '@/src/store/selectors/adminSelectors';
import { useAdminSection } from '../hooks/useAdminSection';
import {
  CompactEditor,
  ConfirmDialog,
  EditorDialog,
  EditorField,
  EmptyState,
  FilterDate,
  NoticeBanner,
  SearchInput,
  SectionHeader,
  SectionShell,
  adminCardClass,
  adminInputClass,
  editorFieldClass,
} from '../section-ui';
import { EventsBodySkeleton } from './EventsSkeleton';

/** Mirrors the EventStatus union in src/types.ts. */
const EVENT_STATUSES: EventStatus[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];

const EventEditor: React.FC<{ event: EventItem; onClose: () => void }> = ({ event, onClose }) => {
  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const [title, setTitle] = useState(event.title || event.name || '');
  const [description, setDescription] = useState(event.description || '');
  const [date, setDate] = useState(event.date || '');
  const [time, setTime] = useState(event.time || '10:00 AM');
  const [location, setLocation] = useState(event.location || '');
  const [status, setStatus] = useState<EventStatus>(event.status || 'PUBLISHED');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Updating event...');
    try {
      await updateEvent({
        id: event.id,
        updates: { title, description, date, time, location, status },
      }).unwrap();
      setMessage('✅ Event updated!');
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  return (
    <CompactEditor title="Edit Event" message={message} busy={isLoading} onClose={onClose} onSubmit={handleSubmit}>
      <EditorField label="Title">
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={editorFieldClass} />
      </EditorField>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Date">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={editorFieldClass} />
        </EditorField>
        <EditorField label="Time">
          <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className={editorFieldClass} />
        </EditorField>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <EditorField label="Location">
          <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className={editorFieldClass} />
        </EditorField>
        <EditorField label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className={`${editorFieldClass} font-bold`}
          >
            {EVENT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </EditorField>
      </div>
      <EditorField label="Description">
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={editorFieldClass} />
      </EditorField>
    </CompactEditor>
  );
};

export const AdminEventsSection: React.FC = () => {
  const {
    filters,
    updateFilter,
    beginEdit,
    endEdit,
    isFormOpen,
    openForm,
    closeForm,
    confirming,
    askConfirm,
    clearConfirm,
    confirmBusy,
    runConfirmed,
    notice,
    flash,
  } = useAdminSection('events');

  const { isLoading, isFetching, refetch } = useGetEventsQuery();
  const [addEvent] = useAddEventMutation();
  const [updateEventStatus] = useUpdateEventStatusMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const events = useAppSelector(selectFilteredEvents);
  const editingEvent = useAppSelector(selectEditingEvent);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) {
      flash({ type: 'error', text: 'Title, date and venue are all required.' });
      return;
    }
    setFormMessage('Scheduling event...');
    try {
      await addEvent({
        title,
        description,
        date,
        time,
        location,
        photoUrl: photoUrl || undefined,
        status: 'PUBLISHED',
      }).unwrap();
      setFormMessage('');
      closeForm();
      flash({ type: 'ok', text: 'Event scheduled.' });
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setPhotoUrl('');
    } catch (err: any) {
      setFormMessage(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  return (
    <SectionShell>
      <SectionHeader
        icon={Calendar}
        title="Events & Community Calendar"
        description="Schedule and manage upcoming meetings, cleanliness drives, and village activities."
        onRefresh={refetch}
        refreshing={isFetching}
      >
        <Button size="sm" onClick={openForm}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Event
        </Button>
      </SectionHeader>

      <NoticeBanner notice={notice} />

      <EditorDialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Schedule an event"
        description="Appears on the public events calendar."
      >
        <div className="space-y-4">
          {formMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
              {formMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={adminInputClass}
              />
              <div className="w-full">
                <DatePicker
                  value={date}
                  onChange={setDate}
                  placeholder="Select Event Date"
                  lang="en"
                  required
                  className="py-2 text-xs"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Location / Venue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={adminInputClass}
              />
            </div>
            <input
              type="text"
              placeholder="Description / Agenda"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={adminInputClass}
            />
            <ImageUploader
              value={photoUrl}
              onChange={setPhotoUrl}
              onRemove={() => setPhotoUrl('')}
              bucket="images"
              folder="events"
              label="Event photo"
              aspectRatio="video"
              hint="Optional — drag an image here or click to choose; crop before it uploads"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Schedule Event
              </Button>
            </div>
          </form>
        </div>
      </EditorDialog>

      <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter('search', v)}
          placeholder="Search events by title or venue..."
        />
        <FilterDate
          value={filters.date}
          onChange={(v) => updateFilter('date', v)}
          placeholder="Filter by Date"
        />
      </div>

      {isLoading ? (
        <EventsBodySkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 && (
            <EmptyState message="No events match these filters." className="md:col-span-2" />
          )}
          {events.map((ev) => (
            <div key={ev.id} className={`${adminCardClass} p-5 space-y-3`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ev.title || ev.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => beginEdit(ev.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => askConfirm(ev.id, ev.title)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-300">{ev.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                <span>📅 {ev.date}</span>
                <span>📍 {ev.location}</span>
                <select
                  value={ev.status || 'PUBLISHED'}
                  onChange={(e) =>
                    updateEventStatus({ id: ev.id, status: e.target.value as EventStatus })
                  }
                  className="px-2 py-1 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-lg text-[10px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  title="Event status"
                >
                  {EVENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEvent && <EventEditor key={editingEvent.id} event={editingEvent} onClose={endEdit} />}

      <ConfirmDialog
        target={confirming ? { title: 'Delete event?', label: confirming.label, run: () => {} } : null}
        busy={confirmBusy}
        onCancel={clearConfirm}
        onConfirm={() =>
          confirming &&
          runConfirmed(() => deleteEvent(confirming.id).unwrap(), `${confirming.label} was deleted.`)
        }
      />
    </SectionShell>
  );
};
