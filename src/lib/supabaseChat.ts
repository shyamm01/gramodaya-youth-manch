import { supabase } from './supabase';
import { ChatMessage, Member, Admin, GroupMessage } from '../types';

export interface SupabaseRoom {
  id: string;
  name: string;
  type: 'group' | 'personal' | 'admin';
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

const COMMON_GROUP_NAME = 'ग्रामोदय यूथ मंच — Group Chat';

// Cache to prevent repeated PGRST205 calls if table is missing in Supabase schema cache
let isChatMessagesTableAvailable = false;
let isChatRoomsTableAvailable = false;

// ── 0. Web Audio API Chime Synthesizer (No external asset dependency) ──
export function playChatChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant two-tone chime (F#5 -> A#5)
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
    // Audio context may be restricted by browser autoplay policy
  }
}

// 1. Storage Helper: Upload to Supabase 'member-photos' Bucket
export async function uploadToMemberPhotosBucket(
  fileOrBase64: string | File,
  memberId: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const bucketName = 'member-photos';

    let fileBody: Blob | File;
    let fileName = `member_${memberId}_${Date.now()}.jpg`;

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:')) {
        const arr = fileOrBase64.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileBody = new Blob([u8arr], { type: mime });
      } else {
        return { success: true, publicUrl: fileOrBase64 };
      }
    } else {
      fileBody = fileOrBase64;
      fileName = `${memberId}_${Date.now()}_${fileOrBase64.name}`;
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBody, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      if (typeof fileOrBase64 === 'string') {
        return { success: true, publicUrl: fileOrBase64 };
      }
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
    return { success: true, publicUrl: urlData.publicUrl };
  } catch (err: any) {
    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

// 2. Fetch or Create Common Group Room
export async function getOrCreateGroupRoom(): Promise<SupabaseRoom> {
  const defaultRoom: SupabaseRoom = {
    id: 'common_group_room',
    name: COMMON_GROUP_NAME,
    type: 'group',
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
      .eq('type', 'group')
      .eq('name', COMMON_GROUP_NAME)
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

// 3. Fetch or Create Personal / Admin Room (1-to-1)
export async function getOrCreatePersonalRoom(
  userMobile: string,
  partnerMobile: string,
  userName: string,
  partnerName: string,
  type: 'personal' | 'admin' = 'personal'
): Promise<SupabaseRoom> {
  const uDigits = userMobile.replace(/\D/g, '').slice(-10);
  const pDigits = partnerMobile.replace(/\D/g, '').slice(-10);
  const roomId = `room_pv_${[uDigits, pDigits].sort().join('_')}`;

  const defaultRoom: SupabaseRoom = {
    id: roomId,
    name: `${userName} & ${partnerName}`,
    type,
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

    const roomMembers = [
      {
        id: `cm_${roomId}_${uDigits}`,
        room_id: roomId,
        member_id: uDigits,
        mobile: userMobile,
        name: userName,
        role: 'member' as const,
        joined_at: new Date().toISOString(),
      },
      {
        id: `cm_${roomId}_${pDigits}`,
        room_id: roomId,
        member_id: pDigits,
        mobile: partnerMobile,
        name: partnerName,
        role: type === 'admin' ? ('admin' as const) : ('member' as const),
        joined_at: new Date().toISOString(),
      },
    ];

    await supabase.from('chat_members').upsert(roomMembers);

    return defaultRoom;
  } catch (e) {
    isChatRoomsTableAvailable = false;
    return defaultRoom;
  }
}

// 4. Send Message to Supabase Room
export async function sendRoomMessage(
  roomId: string,
  senderMobile: string,
  senderName: string,
  senderPhoto: string,
  text: string,
  senderMemberId?: string,
  photoUrl?: string,
  audioUrl?: string
): Promise<{ success: boolean; message: SupabaseMessage; error?: string }> {
  const newMsg: SupabaseMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    room_id: roomId,
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

// 5. Fetch Messages for Room (with reliable REST backend)
export async function fetchRoomMessages(roomId: string, userMobile?: string): Promise<SupabaseMessage[]> {
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
  if (roomId === 'common_group_room') {
    try {
      const res = await fetch('/api/group-chat', { credentials: 'include' });
      if (res.ok) {
        const apiData = await res.json();
        if (apiData.success && Array.isArray(apiData.groupMessages)) {
          return apiData.groupMessages.map((m: any) => ({
            id: String(m.id),
            room_id: 'common_group_room',
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

// 6. Delete Message (Sender or Admin) with multi-tier persistence
export async function deleteChatMessage(
  messageId: string,
  userMobile: string,
  isAdmin: boolean = false,
  roomId?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Supabase Deletion
  if (isChatMessagesTableAvailable) {
    try {
      await supabase.from('chat_messages').delete().eq('id', messageId);
    } catch (e: any) {
      console.warn('Supabase delete note:', e);
    }
  }

  // 2. Next.js Backend DB Deletion
  try {
    if (roomId === 'common_group_room') {
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

// 7. Mark Messages as Read
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
