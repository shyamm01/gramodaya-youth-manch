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

// 1. Storage Helper: Upload to Supabase 'member-photos' Bucket
export async function uploadToMemberPhotosBucket(
  fileOrBase64: string | File,
  memberId: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  try {
    const bucketName = 'member-photos';

    // Convert Base64 data URL to Blob if necessary
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
        // Already a URL
        return { success: true, publicUrl: fileOrBase64 };
      }
    } else {
      fileBody = fileOrBase64;
      fileName = `${memberId}_${Date.now()}_${fileOrBase64.name}`;
    }

    // Try uploading to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBody, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, fallback to publicUrl:', uploadError.message);
      // Fallback: If bucket is not accessible or created, return base64 / data string as publicUrl
      if (typeof fileOrBase64 === 'string') {
        return { success: true, publicUrl: fileOrBase64 };
      }
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
    return { success: true, publicUrl: urlData.publicUrl };
  } catch (err: any) {
    console.error('Failed to upload photo to Supabase storage:', err);
    if (typeof fileOrBase64 === 'string') {
      return { success: true, publicUrl: fileOrBase64 };
    }
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

// 2. Fetch or Create Common Group Room
export async function getOrCreateGroupRoom(): Promise<SupabaseRoom | null> {
  try {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('type', 'group')
      .eq('name', COMMON_GROUP_NAME)
      .limit(1);

    if (error) {
      console.warn('Supabase query chat_rooms group error:', error.message);
      return {
        id: 'common_group_room',
        name: COMMON_GROUP_NAME,
        type: 'group',
      };
    }

    if (rooms && rooms.length > 0) {
      return rooms[0];
    }

    // Create room
    const newRoom = {
      id: 'common_group_room',
      name: COMMON_GROUP_NAME,
      type: 'group' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: createErr } = await supabase
      .from('chat_rooms')
      .insert([newRoom])
      .select()
      .single();

    if (createErr) {
      console.warn('Failed to insert group room in Supabase:', createErr.message);
      return newRoom;
    }

    return created;
  } catch (e) {
    console.error('getOrCreateGroupRoom exception:', e);
    return {
      id: 'common_group_room',
      name: COMMON_GROUP_NAME,
      type: 'group',
    };
  }
}

// 3. Fetch or Create Personal / Admin Room (1-to-1)
export async function getOrCreatePersonalRoom(
  userMobile: string,
  partnerMobile: string,
  userName: string,
  partnerName: string,
  type: 'personal' | 'admin' = 'personal'
): Promise<SupabaseRoom | null> {
  try {
    // Standardize digits
    const uDigits = userMobile.replace(/\D/g, '').slice(-10);
    const pDigits = partnerMobile.replace(/\D/g, '').slice(-10);

    const roomId = `room_pv_${[uDigits, pDigits].sort().join('_')}`;

    // Check if room exists
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle();

    if (existingRoom) {
      return existingRoom;
    }

    // Create room
    const newRoom: SupabaseRoom = {
      id: roomId,
      name: `${userName} & ${partnerName}`,
      type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: roomErr } = await supabase.from('chat_rooms').upsert([newRoom]);
    if (roomErr) console.warn('Supabase room create warning:', roomErr.message);

    // Add room members
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

    return newRoom;
  } catch (e) {
    console.error('getOrCreatePersonalRoom error:', e);
    const uDigits = userMobile.replace(/\D/g, '').slice(-10);
    const pDigits = partnerMobile.replace(/\D/g, '').slice(-10);
    return {
      id: `room_pv_${[uDigits, pDigits].sort().join('_')}`,
      name: `${userName} & ${partnerName}`,
      type,
    };
  }
}

// 4. Send Message to Supabase Room
export async function sendRoomMessage(
  roomId: string,
  senderMobile: string,
  senderName: string,
  senderPhoto: string,
  text: string,
  senderMemberId?: string
): Promise<{ success: boolean; message?: SupabaseMessage; error?: string }> {
  if (!text || !text.trim()) {
    return { success: false, error: 'Message content cannot be empty.' };
  }

  const newMsg: SupabaseMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    room_id: roomId,
    sender_mobile: senderMobile,
    sender_name: senderName,
    sender_photo: senderPhoto || '',
    sender_member_id: senderMemberId || '',
    text: text.trim(),
    created_at: new Date().toISOString(),
    is_read: false,
    is_deleted: false,
  };

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([newMsg])
      .select()
      .single();

    if (error) {
      console.warn('Supabase chat_messages insert warning:', error.message);
      // Fallback: Return construct so UI updates locally
      return { success: true, message: newMsg };
    }

    // Update room updated_at
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);

    return { success: true, message: data || newMsg };
  } catch (e: any) {
    console.error('sendRoomMessage error:', e);
    return { success: true, message: newMsg };
  }
}

// 5. Fetch Messages for Room
export async function fetchRoomMessages(roomId: string): Promise<SupabaseMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('fetchRoomMessages error:', error.message);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('fetchRoomMessages exception:', e);
    return [];
  }
}

// 6. Delete Message (Sender or Admin)
export async function deleteChatMessage(
  messageId: string,
  userMobile: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isAdmin) {
      const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
      if (error) {
        // Soft delete fallback
        await supabase
          .from('chat_messages')
          .update({ is_deleted: true, text: '🚫 यह संदेश एडमिन द्वारा हटा दिया गया है।' })
          .eq('id', messageId);
      }
      return { success: true };
    }

    // Verify sender
    const { data: msg } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (msg) {
      const uDigits = userMobile.replace(/\D/g, '').slice(-10);
      const sDigits = (msg.sender_mobile || '').replace(/\D/g, '').slice(-10);
      if (uDigits !== sDigits) {
        return { success: false, error: 'You can only delete your own messages.' };
      }
    }

    const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
    if (error) {
      await supabase
        .from('chat_messages')
        .update({ is_deleted: true, text: '🚫 संदेश हटाया गया' })
        .eq('id', messageId);
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Delete message failed' };
  }
}

// 7. Mark Messages as Read
export async function markRoomMessagesAsRead(roomId: string, userMobile: string) {
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
  } catch (e) {
    console.error('markRoomMessagesAsRead error:', e);
  }
}

// 8. SQL Schema Blueprint for Reference & Automatic Check
export const SUPABASE_SQL_SCHEMA = `
-- PHASE 3 SUPABASE CHAT TABLES & RLS POLICIES

-- 1. chat_rooms
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'personal', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. chat_members
CREATE TABLE IF NOT EXISTS public.chat_members (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  mobile TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_mobile TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_photo TEXT,
  sender_member_id TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Allow public select/insert for active chat rooms
CREATE POLICY "Allow public read chat_rooms" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_rooms" ON public.chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update chat_rooms" ON public.chat_rooms FOR UPDATE USING (true);

-- Allow public select/insert chat_members
CREATE POLICY "Allow public read chat_members" ON public.chat_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_members" ON public.chat_members FOR INSERT WITH CHECK (true);

-- Allow public select/insert/delete chat_messages
CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete chat_messages" ON public.chat_messages FOR DELETE USING (true);
CREATE POLICY "Allow public update chat_messages" ON public.chat_messages FOR UPDATE USING (true);

-- Storage bucket member-photos policy
INSERT INTO storage.buckets (id, name, public) VALUES ('member-photos', 'member-photos', true) ON CONFLICT (id) DO NOTHING;
`;
