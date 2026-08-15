import { supabase } from './supabase';
import { ChatMessage, Member, Admin, GroupMessage } from '../types';

export interface SupabaseRoom {
  id: string;
  name: string;
  type: 'group' | 'personal' | 'admin';
  village_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseRoomMember {
  id: string;
  room_id: string;
  member_id: string;
  mobile: string;
  name: string;
  role: 'admin' | 'member';
  joined_at?: string;
  last_read_at?: string;
}

export interface SupabaseMessage {
  id: string;
  room_id: string;
  village_id?: string;
  sender_mobile: string;
  sender_name: string;
  sender_photo?: string;
  sender_member_id?: string;
  text: string;
  photo_url?: string;
  audio_url?: string;
  reactions?: Record<string, string[]>; // { "👍": ["9876543210"], "❤️": ["9999999999"] }
  created_at: string;
  is_read?: boolean;
  is_deleted?: boolean;
}

export interface ChatRoomListItem {
  id: string; // room_id
  name: string;
  type: 'group' | 'personal' | 'admin';
  partnerMobile?: string;
  partnerName?: string;
  partnerPhoto?: string;
  partnerMemberId?: string;
  partnerStatus?: 'active' | 'pending';
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
  lastSeen?: string;
}

// Cache to prevent repeated PGRST205 calls if table is missing in Supabase schema cache
let isChatMessagesTableAvailable = false;
let isChatRoomsTableAvailable = false;

// ── 0. Web Audio API Chime Synthesizer ──
export function playChatChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(739.99, now); // F#5
    osc1.frequency.exponentialRampToValueAtTime(932.33, now + 0.08); // A#5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(739.99, now);
    osc2.frequency.exponentialRampToValueAtTime(932.33, now + 0.08);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Non-blocking
  }
}

// 1. Storage Helper: Upload to Supabase Storage (with fallback)
export async function uploadToMemberPhotosBucket(
  fileOrBase64: string | File,
  memberId: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    if (typeof fileOrBase64 === 'string') {
      const res = await fetch('/api/upload/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: fileOrBase64,
          bucket: 'gramodaya-youth-munch',
          folder: 'chat_attachments',
          filename: `chat_${memberId}_${Date.now()}.jpg`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          return { success: true, publicUrl: data.url };
        }
      }
    } else {
      const formData = new FormData();
      formData.append('file', fileOrBase64);
      formData.append('bucket', 'gramodaya-youth-munch');
      formData.append('folder', 'chat_attachments');
      formData.append('filename', `chat_${memberId}_${Date.now()}_${fileOrBase64.name}`);

      const res = await fetch('/api/upload/supabase', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          return { success: true, publicUrl: data.url };
        }
      }
    }

    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: 'Upload failed' };
  } catch (err: any) {
    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

// 2. Fetch or Create Village Forum Group Room (Scoped by villageId)
export async function getOrCreateGroupRoom(villageId: string = '1', villageName?: string): Promise<SupabaseRoom> {
  const roomId = `room_village_${villageId}`;
  const roomName = villageName ? `${villageName} — Village Forum` : 'ग्रामोदय समूह मंच';

  const defaultRoom: SupabaseRoom = {
    id: roomId,
    name: roomName,
    type: 'group',
    village_id: villageId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isChatRoomsTableAvailable) {
    return defaultRoom;
  }

  try {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .limit(1);

    if (error) {
      isChatRoomsTableAvailable = false;
      return defaultRoom;
    }

    if (rooms && rooms.length > 0) {
      return rooms[0];
    }

    const { data: created, error: createErr } = await supabase
      .from('chat_rooms')
      .insert([defaultRoom])
      .select()
      .single();

    if (createErr) {
      isChatRoomsTableAvailable = false;
      return defaultRoom;
    }

    return created;
  } catch (e) {
    isChatRoomsTableAvailable = false;
    return defaultRoom;
  }
}

// 3. Fetch or Create Admin Helpdesk Room (Scoped by villageId & citizen mobile)
export async function getOrCreateAdminHelpdeskRoom(
  userMobile: string,
  villageId: string = '1',
  userName: string = 'Member',
  villageName?: string
): Promise<SupabaseRoom> {
  const uDigits = userMobile.replace(/\D/g, '').slice(-10);
  const roomId = `room_admin_${villageId}_${uDigits}`;
  const roomName = `${userName} — ${villageName || 'ग्राम'} एडमिन हेल्प`;

  const defaultRoom: SupabaseRoom = {
    id: roomId,
    name: roomName,
    type: 'admin',
    village_id: villageId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isChatRoomsTableAvailable) {
    return defaultRoom;
  }

  try {
    const { data: existingRoom, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (error) {
      isChatRoomsTableAvailable = false;
      return defaultRoom;
    }

    if (existingRoom) {
      return existingRoom;
    }

    await supabase.from('chat_rooms').upsert([defaultRoom]);
    return defaultRoom;
  } catch (e) {
    isChatRoomsTableAvailable = false;
    return defaultRoom;
  }
}

// 4. Fetch or Create Personal Room (1-to-1)
export async function getOrCreatePersonalRoom(
  userMobile: string,
  partnerMobile: string,
  userName: string,
  partnerName: string
): Promise<SupabaseRoom> {
  const uDigits = userMobile.replace(/\D/g, '').slice(-10);
  const pDigits = partnerMobile.replace(/\D/g, '').slice(-10);
  const roomId = `room_pv_${[uDigits, pDigits].sort().join('_')}`;

  const defaultRoom: SupabaseRoom = {
    id: roomId,
    name: `${userName} & ${partnerName}`,
    type: 'personal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isChatRoomsTableAvailable) {
    return defaultRoom;
  }

  try {
    const { data: existingRoom, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (error) {
      isChatRoomsTableAvailable = false;
      return defaultRoom;
    }

    if (existingRoom) {
      return existingRoom;
    }

    await supabase.from('chat_rooms').upsert([defaultRoom]);
    return defaultRoom;
  } catch (e) {
    isChatRoomsTableAvailable = false;
    return defaultRoom;
  }
}

// 5. Send Message to Supabase Room
export async function sendRoomMessage(
  roomId: string,
  senderMobile: string,
  senderName: string,
  senderPhoto: string,
  text: string,
  senderMemberId?: string,
  photoUrl?: string,
  audioUrl?: string,
  villageId?: string
): Promise<{ success: boolean; message: SupabaseMessage; error?: string }> {
  const newMsg: SupabaseMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    room_id: roomId,
    village_id: villageId,
    sender_mobile: senderMobile,
    sender_name: senderName,
    sender_photo: senderPhoto || '',
    sender_member_id: senderMemberId || '',
    text: text.trim(),
    photo_url: photoUrl || undefined,
    audio_url: audioUrl || undefined,
    reactions: {},
    created_at: new Date().toISOString(),
    is_read: false,
    is_deleted: false,
  };

  if (!text && !photoUrl && !audioUrl) {
    return { success: false, message: newMsg, error: 'Message content cannot be empty.' };
  }

  if (isChatMessagesTableAvailable) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([newMsg])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          isChatMessagesTableAvailable = false;
        }
        return { success: true, message: newMsg };
      }

      return { success: true, message: data || newMsg };
    } catch (e: any) {
      isChatMessagesTableAvailable = false;
      return { success: true, message: newMsg };
    }
  }

  return { success: true, message: newMsg };
}

// 6. Fetch Messages for Room (Scoped by villageId for Village Forum)
export async function fetchRoomMessages(
  roomId: string,
  userMobile?: string,
  villageId?: string
): Promise<SupabaseMessage[]> {
  // 1. If Supabase table is marked available, try Supabase
  if (isChatMessagesTableAvailable) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        return data;
      }
      if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
        isChatMessagesTableAvailable = false;
      }
    } catch {
      isChatMessagesTableAvailable = false;
    }
  }

  // 2. Fetch from Next.js REST API
  // If Village Forum room (room_village_X or common_group_room)
  if (roomId.startsWith('room_village_') || roomId === 'common_group_room') {
    try {
      const vId = villageId || (roomId.startsWith('room_village_') ? roomId.replace('room_village_', '') : '1');
      const res = await fetch(`/api/group-chat?villageId=${encodeURIComponent(vId)}`, { credentials: 'include' });
      if (res.ok) {
        const apiData = await res.json();
        if (apiData.success && Array.isArray(apiData.groupMessages)) {
          return apiData.groupMessages.map((m: any) => ({
            id: String(m.id),
            room_id: roomId,
            village_id: m.villageId || vId,
            sender_mobile: m.senderMobile || '',
            sender_name: m.senderName || 'Member',
            sender_photo: m.senderPhoto || '',
            sender_member_id: m.senderId || '',
            text: m.text || '',
            photo_url: m.photoUrl || undefined,
            reactions: {},
            created_at: m.createdAt || new Date().toISOString(),
            is_read: true,
            is_deleted: false,
          }));
        }
      }
    } catch (err) {
      console.warn('API group chat fetch note:', err);
    }
  } else if (userMobile) {
    try {
      const res = await fetch(`/api/messages?userMobile=${encodeURIComponent(userMobile)}`, { credentials: 'include' });
      if (res.ok) {
        const apiData = await res.json();
        if (apiData.success && Array.isArray(apiData.messages)) {
          return apiData.messages.map((m: any) => ({
            id: String(m.id),
            room_id: roomId,
            sender_mobile: m.senderMobile || '',
            sender_name: m.senderName || 'Member',
            sender_photo: m.senderPhoto || '',
            sender_member_id: '',
            text: m.text || '',
            photo_url: m.photoUrl || undefined,
            reactions: {},
            created_at: m.createdAt || new Date().toISOString(),
            is_read: m.read || false,
            is_deleted: false,
          }));
        }
      }
    } catch (err) {
      console.warn('API direct messages fetch note:', err);
    }
  }

  return [];
}

// 7. Delete Message (Sender or Admin) with multi-tier persistence
export async function deleteChatMessage(
  messageId: string,
  userMobile: string,
  isAdmin: boolean = false,
  roomId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isChatMessagesTableAvailable) {
    try {
      await supabase.from('chat_messages').delete().eq('id', messageId);
    } catch (e: any) {
      console.warn('Supabase delete note:', e);
    }
  }

  try {
    if (roomId && (roomId.startsWith('room_village_') || roomId === 'common_group_room')) {
      await fetch(`/api/group-chat/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } else {
      await fetch(
        `/api/messages?id=${encodeURIComponent(messageId)}&userMobile=${encodeURIComponent(
          userMobile
        )}&isAdmin=${isAdmin}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
    }
  } catch (err) {
    console.warn('API delete note:', err);
  }

  return { success: true };
}

// 8. Mark Messages as Read
export async function markRoomMessagesAsRead(roomId: string, userMobile: string) {
  if (!isChatMessagesTableAvailable) return;
  try {
    const uDigits = userMobile.replace(/\D/g, '').slice(-10);
    const { data: unread } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_read', false);

    if (unread && unread.length > 0) {
      const idsToMark = unread
        .filter((m) => (m.sender_mobile || '').replace(/\D/g, '').slice(-10) !== uDigits)
        .map((m) => m.id);

      if (idsToMark.length > 0) {
        await supabase.from('chat_messages').update({ is_read: true }).in('id', idsToMark);
      }
    }
  } catch {
    // Non-blocking
  }
}
