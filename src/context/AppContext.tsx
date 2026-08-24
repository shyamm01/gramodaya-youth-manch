'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import {
  Admin,
  Member,
  Complaint,
  SocialWork,
  PublicInfo,
  Announcement,
  EventItem,
  GalleryItem,
  Elder,
  AuditLog,
  ApiIntegration,
  AppStats,
  AuthSession,
  EventStatus,
  ComplaintStatus,
  ChatMessage,
  GroupMessage,
  VillageSettings,
  Village,
  UserPermission,
  PermissionCode,
} from '../types';
import { hasUserPermission } from '../lib/permissions';
import { t as translateEngine } from '../i18n';
import { store } from '../store';
import {
  setMembers as reduxSetMembers,
  setComplaints as reduxSetComplaints,
  setSocialWorks as reduxSetSocialWorks,
  setEvents as reduxSetEvents,
  setGallery as reduxSetGallery,
  setElders as reduxSetElders,
  setAnnouncements as reduxSetAnnouncements,
  setPublicInfos as reduxSetPublicInfos,
  setGroupMessages as reduxSetGroupMessages,
} from '../store/slices/communitySlice';
import { logout as reduxLogout, fetchCurrentUser } from '../store/slices/authSlice';
import { updateVillageSettings as reduxUpdateVillageSettings, fetchVillagesList } from '../store/slices/villageSlice';
import {
  OFFICIAL_VILLAGE,
  INITIAL_VILLAGES,
} from '../data/initialData';


interface AppContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
  goBack: () => void;
  canGoBack: boolean;
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  villageSettings: VillageSettings;
  updateVillageSettings: (settings: Partial<VillageSettings>) => Promise<{ success: boolean; error?: string }>;
  villages: Village[];
  activeVillageId: string;
  setActiveVillageId: (id: string) => void;
  userPermissions: UserPermission[];
  checkPermission: (perm: PermissionCode, villageId?: string) => boolean;
  admins: Admin[];
  members: Member[];
  complaints: Complaint[];
  socialWorks: SocialWork[];
  publicInfos: PublicInfo[];
  announcements: Announcement[];
  events: EventItem[];
  gallery: GalleryItem[];
  elders: Elder[];
  auditLogs: AuditLog[];
  integrations: ApiIntegration[];
  stats: AppStats;
  authSession: AuthSession;
  setAuthSession: React.Dispatch<React.SetStateAction<AuthSession>>;
  isJoinModalOpen: boolean;
  setIsJoinModalOpen: (open: boolean) => void;
  isMyProfileModalOpen: boolean;
  setIsMyProfileModalOpen: (open: boolean) => void;
  memberLogout: () => Promise<void>;
  isLoading: boolean;
  refreshData: (force?: boolean) => Promise<void>;
  resetMemberPassword: (mobile: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetAdminPassword: (mobile: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  setAdminPassword: (
    mobile: string,
    resetToken: string,
    password: string
  ) => Promise<{ success: boolean; admin?: Admin; error?: string }>;
  adminLogout: () => Promise<void>;
  addMember: (
    nameOrData:
      | string
      | {
          name: string;
          mobile: string;
          email?: string;
          password?: string;
          role?: string;
          systemRole?: string;
          status?: string;
          photoUrl?: string;
          fatherName?: string;
          dob?: string;
          gender?: string;
          address?: string;
          pincode?: string;
          state?: string;
          district?: string;
          villageId?: string;
          occupation?: string;
          designation?: string;
          politicalBackground?: string;
          bloodGroup?: string;
          organizationName?: string;
          joiningDate?: string;
          adminName?: string;
          adminMobile?: string;
        },
    mobile?: string,
    photoUrl?: string,
    joiningDate?: string,
    organizationName?: string
  ) => Promise<{ success: boolean; member?: Member; inviteLink?: string | null; alreadyRegistered?: boolean; error?: string }>;
  approveMember: (id: string) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  deleteMember: (id: string) => Promise<void>;
  uploadPhoto: (targetType: 'admin' | 'member', targetId: string, photoUrl: string) => Promise<void>;
  submitComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'status'> & { userId?: string }) => Promise<{ success: boolean; error?: string }>;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  submitSocialWork: (data: Omit<SocialWork, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateSocialWorkStatus: (id: string, status: 'approved' | 'published' | 'pending') => Promise<void>;
  deleteSocialWork: (id: string) => Promise<void>;
  submitPublicInfo: (data: Omit<PublicInfo, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updatePublicInfoStatus: (id: string, status: 'approved' | 'rejected' | 'pending') => Promise<void>;
  deletePublicInfo: (id: string) => Promise<void>;
  publishAnnouncement: (title: string, content: string) => Promise<{ success: boolean; error?: string }>;
  updateAnnouncement: (id: string, title: string, content: string) => Promise<{ success: boolean; error?: string }>;
  deleteAnnouncement: (id: string) => Promise<void>;
  createEvent: (data: Omit<EventItem, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<{ success: boolean; error?: string }>;
  updateEventStatus: (id: string, status: EventStatus) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (id: string) => Promise<void>;
  uploadGalleryPhoto: (caption: string, photoUrl: string, status?: 'pending' | 'published') => Promise<{ success: boolean; error?: string }>;
  approveGalleryPhoto: (id: string) => Promise<void>;
  editGalleryCaption: (id: string, caption: string) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  addElder: (data: { name: string; mobile?: string; photoUrl?: string; location?: string; details?: string }) => Promise<{ success: boolean; error?: string }>;
  editElder: (id: string, data: Partial<Elder>) => Promise<{ success: boolean; error?: string }>;
  deleteElder: (id: string) => Promise<void>;
  saveIntegrationConfig: (id: string, apiKey: string) => Promise<{ success: boolean; error?: string }>;
  testIntegration: (id: string) => Promise<{ success: boolean; status?: string; message?: string; error?: string }>;
  disconnectIntegration: (id: string) => Promise<{ success: boolean; error?: string }>;
  exportDataJson: () => void;
  importDataJson: (jsonData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetDataStore: () => Promise<{ success: boolean; message?: string; error?: string }>;
  currentMemberMobile: string | null;
  setCurrentMemberMobile: (mobile: string | null) => void;
  selectedChatPartner: Member | null;
  setSelectedChatPartner: (member: Member | null) => void;
  selectedIdCardMember: Member | null;
  setSelectedIdCardMember: (member: Member | null) => void;
  groupMessages: GroupMessage[];
  onlineMembers: any[];
  fetchGroupChat: () => Promise<void>;
  sendGroupMessage: (
    senderName: string,
    senderMobile?: string,
    senderPhoto?: string,
    text?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteGroupMessage: (id: string) => Promise<void>;
  fetchUserMessages: (mobile: string) => Promise<ChatMessage[]>;
  sendMessage: (
    senderMobile: string,
    senderName: string,
    recipientMobile: string,
    recipientName: string,
    text: string
  ) => Promise<{ success: boolean; error?: string }>;
  addVillage: (data: Partial<Village>) => Promise<{ success: boolean; village?: Village; error?: string }>;
  updateVillage: (id: string, data: Partial<Village>) => Promise<{ success: boolean; village?: Village; error?: string }>;
  deleteVillage: (id: string) => Promise<{ success: boolean; error?: string }>;
  editMemberProfile: (id: string, updates: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  editComplaint: (id: string, updates: Partial<Complaint>) => Promise<{ success: boolean; error?: string }>;
  editSocialWork: (id: string, updates: Partial<SocialWork>) => Promise<{ success: boolean; error?: string }>;
  editPublicInfo: (id: string, updates: Partial<PublicInfo>) => Promise<{ success: boolean; error?: string }>;
  fetchMembers: () => Promise<Member[]>;
  changeMemberRole: (id: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER', villageId?: string) => Promise<{ success: boolean; error?: string }>;
  isSuperAdmin: boolean;
  isApprovedMember: boolean;
  currentMemberObj: Member | null;
  canManageVillage: (villageId?: string) => boolean;
  canEditContent: (authorMobile?: string, villageId?: string) => boolean;
  canDeleteContent: (authorMobile?: string, villageId?: string) => boolean;
  markMessagesRead: (userMobile: string, partnerMobile: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  /**
   * Whether we are inside the admin panel.
   *
   * Held in a ref so loadCollections can read it without taking `pathname` as
   * a dependency — that would rebuild the callback on every navigation and
   * re-run the bootstrap fetches each time.
   */
  const isAdminRoute = useRef<boolean>(false);
  isAdminRoute.current = Boolean(pathname && /^\/(admin|super-admin)(\/|$)/.test(pathname));

  const [activeSection, setActiveSectionState] = useState<string>("home");
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [lang, setLangState] = useState<string>("hi");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentMemberMobile, setCurrentMemberMobileState] = useState<string | null>(null);
  const isFetchingDataRef = useRef(false);
  const lastDataFetchTimeRef = useRef<number>(0);
  // Single-flight caches so concurrent callers (Supabase auth listener, session
  // restore, refreshData) share one in-flight Redux thunk dispatch instead of
  // each firing its own /api/auth/me or /api/villages request.
  const authMeInFlightRef = useRef<Promise<any> | null>(null);
  const villagesInFlightRef = useRef<Promise<Village[] | null> | null>(null);

  const fetchAuthMeOnce = useCallback((): Promise<any> => {
    if (!authMeInFlightRef.current) {
      authMeInFlightRef.current = (store.dispatch(fetchCurrentUser() as any) as any)
        .unwrap()
        .catch(() => null)
        .finally(() => {
          authMeInFlightRef.current = null;
        });
    }
    return authMeInFlightRef.current;
  }, []);

  const fetchVillagesOnce = useCallback((): Promise<Village[] | null> => {
    if (!villagesInFlightRef.current) {
      villagesInFlightRef.current = (store.dispatch(fetchVillagesList() as any) as any)
        .unwrap()
        .catch(() => null)
        .finally(() => {
          villagesInFlightRef.current = null;
        });
    }
    return villagesInFlightRef.current;
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("gym_lang", newLang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translateEngine(key, params, lang);
  };

  const [villageSettings, setVillageSettings] = useState<VillageSettings>(OFFICIAL_VILLAGE);
  const [villages, setVillages] = useState<Village[]>(INITIAL_VILLAGES);
  const [activeVillageId, setActiveVillageId] = useState<string>("1");
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [socialWorks, setSocialWorks] = useState<SocialWork[]>([]);
  const [publicInfos, setPublicInfos] = useState<PublicInfo[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);

  const [authSession, setAuthSession] = useState<AuthSession>({ isAdminLoggedIn: false, isMemberLoggedIn: false });
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isMyProfileModalOpen, setIsMyProfileModalOpen] = useState<boolean>(false);
  const [selectedChatPartner, setSelectedChatPartner] = useState<Member | null>(null);
  const [selectedIdCardMember, setSelectedIdCardMember] = useState<Member | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<any[]>([]);

  const checkPermission = (perm: PermissionCode, villageId?: string) => {
    return hasUserPermission(authSession, perm, villageId || activeVillageId);
  };

  // Synchronize route pathname with activeSection
  useEffect(() => {
    if (pathname) {
      const cleanPath = pathname.replace(/^\//, "") || "home";
      const mappedSection = (cleanPath === "admin" || cleanPath.startsWith("super-admin") || cleanPath.startsWith("admin")) ? "admin-panel" : cleanPath;
      setActiveSectionState(mappedSection);
    }
  }, [pathname]);

  const changeActiveSection = (newSection: string) => {
    if (newSection === activeSection) return;
    setHistoryStack((prev) => [...prev, activeSection]);
    setActiveSectionState(newSection);
    const targetUrl = newSection === "home" ? "/" : newSection === "admin-panel" ? "/admin" : `/${newSection}`;
    try {
      router.push(targetUrl);
    } catch (e) {
      /* fallback */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (historyStack.length > 0) {
      const prevSection = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));
      setActiveSectionState(prevSection);
    } else if (activeSection !== "home") {
      setActiveSectionState("home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canGoBack = activeSection !== "home" || historyStack.length > 0;

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.section) {
        setActiveSectionState(e.state.section);
      } else {
        setActiveSectionState("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    const hydrateRbacSession = async () => {
      try {
        const data = await fetchAuthMeOnce();
        if (data?.authenticated && data.user) {
          const u = data.user;
          const isSuper = u.isSuperAdmin || u.systemRole === 'SUPER_ADMIN';
          const isAdm = Boolean(isSuper || u.isAdmin || u.role === 'ADMIN' || u.systemRole === 'ADMIN');
          setAuthSession((prev) => ({
            ...prev,
            isAdminLoggedIn: isAdm,
            isMemberLoggedIn: true,
            supabaseUserId: u.supabaseUserId || prev.supabaseUserId,
            role: u.role || (isAdm ? 'ADMIN' : 'MEMBER'),
            systemRole: u.systemRole || (isSuper ? 'SUPER_ADMIN' : isAdm ? 'ADMIN' : 'MEMBER'),
            adminMobile: isAdm ? u.mobile : prev.adminMobile,
            adminName: isAdm ? u.name : prev.adminName,
            adminId: isAdm ? u.id : prev.adminId,
            adminVillageId: u.villageId || prev.adminVillageId,
            currentMemberMobile: u.mobile || prev.currentMemberMobile,
            currentMember: u,
            email: u.email || prev.email,
            permissions: u.permissions || prev.permissions || [],
            token: data.token || prev.token,
          }));
          if (data.user.mobile) {
            setCurrentMemberMobileState(data.user.mobile);
          }
        }
      } catch (e) {
        // Silently continue
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthSession((prev) => ({
          ...prev,
          isMemberLoggedIn: true,
          supabaseUserId: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role === 'ADMIN' ? 'ADMIN' : prev.role || 'MEMBER',
        }));
        hydrateRbacSession();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthSession((prev) => ({
          ...prev,
          isMemberLoggedIn: true,
          supabaseUserId: session.user.id,
          email: session.user.email,
        }));
        hydrateRbacSession();
      } else if (_event === 'SIGNED_OUT') {
        setAuthSession({
          isMemberLoggedIn: false,
          isAdminLoggedIn: false,
          token: null,
          email: null,
          supabaseUserId: null,
        });
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Restore saved session on client mount & verify cookie with /api/auth/me
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("gym_auth");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          setAuthSession(parsed);
          if (parsed.currentMemberMobile || parsed.adminMobile || parsed.currentMember?.mobile) {
            setCurrentMemberMobileState(parsed.currentMemberMobile || parsed.adminMobile || parsed.currentMember?.mobile);
          }
        } catch (e) {
          /* ignore */
        }
      }
      const savedMob = localStorage.getItem("gym_member_mobile");
      if (savedMob) {
        setCurrentMemberMobileState(savedMob);
      }
      const savedLang = localStorage.getItem("gym_lang");
      if (savedLang) {
        setLangState(savedLang);
      }

      fetchAuthMeOnce()
        .then((data) => {
          if (data?.authenticated && data.user) {
            const u = data.user;
            const isSuper = u.isSuperAdmin || u.systemRole === "SUPER_ADMIN";
            const isAdm = Boolean(isSuper || u.isAdmin || u.role === "ADMIN" || u.systemRole === "ADMIN");
            const newSession: AuthSession = {
              isAdminLoggedIn: isAdm,
              isMemberLoggedIn: true,
              role: u.role || (isAdm ? "ADMIN" : "MEMBER"),
              systemRole: u.systemRole || (isSuper ? "SUPER_ADMIN" : isAdm ? "ADMIN" : "MEMBER"),
              adminMobile: isAdm ? u.mobile : undefined,
              adminName: isAdm ? u.name : undefined,
              adminId: isAdm ? u.id : undefined,
              adminVillageId: u.villageId || undefined,
              currentMemberMobile: u.mobile,
              currentMember: u,
              email: u.email,
              permissions: u.permissions || [],
              token: data.token,
            };
            setAuthSession(newSession);
            setCurrentMemberMobileState(data.user.mobile);
            localStorage.setItem("gym_auth", JSON.stringify(newSession));
            if (data.token) {
              localStorage.setItem("gym_token", data.token);
            }
          }
        })
        .catch(() => {
          /* ignore network errors during initial check */
        });
    }
  }, []);

  const setCurrentMemberMobile = (mob: string | null) => {


    if (typeof window !== 'undefined') {
      if (mob) {
        localStorage.setItem('gym_member_mobile', mob);
      } else {
        localStorage.removeItem('gym_member_mobile');
      }
    }
  };

  const memberLogout = async () => {
    try {
      await authenticatedFetch("/api/auth/logout", { method: "POST" });
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Signout notice:", e);
    }
    store.dispatch(reduxLogout());
    setCurrentMemberMobile(null);
    const newAuth: AuthSession = {
      isAdminLoggedIn: false,
      isMemberLoggedIn: false,
      currentMemberId: undefined,
      currentMemberMobile: undefined,
      currentMemberName: undefined,
      role: undefined,
      systemRole: undefined,
      token: undefined,
    };
    setAuthSession(newAuth);
    localStorage.removeItem("gym_auth");
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_member_mobile");
    setActiveSectionState("home");
  };

  const fetchGroupChat = async () => {
    try {
      const res = await authenticatedFetch("/api/group-chat");
      if (res.ok) {
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = null;
        }
        if (data) {
          if (data.groupMessages) setGroupMessages(data.groupMessages);
          if (data.onlineMembers) setOnlineMembers(data.onlineMembers);
        }
      }
    } catch (e) {
      console.warn("Group chat temporary sync pause:", e instanceof Error ? e.message : e);
    }
  };

  const sendGroupMessage = async (
    senderName: string,
    senderMobile?: string,
    senderPhoto?: string,
    text?: string
  ) => {
    if (!text || !text.trim()) return { success: false, error: "Message text is required." };
    if (!isApprovedMember) {
      return {
        success: false,
        error: 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है। एडमिन द्वारा अनुमोदन के बाद ही आप संवाद मंच में संदेश भेज सकते हैं।',
      };
    }
    try {
      const res = await authenticatedFetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName, senderMobile, senderPhoto, text }),
      });
      const textRes = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(textRes);
      } catch {
        data = null;
      }
      if (!res.ok || !data) return { success: false, error: data?.error || 'Failed to send message.' };
      if (data.groupMessages) setGroupMessages(data.groupMessages);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  const deleteGroupMessage = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/group-chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchGroupChat();
      }
    } catch (e) {
      console.warn('Delete group message sync notice:', e instanceof Error ? e.message : e);
    }
  };

  /**
   * Every call to our own API goes through here.
   *
   * The JWT lives in localStorage as `gym_token` and there is no login route
   * that mirrors it into a cookie, so a bare fetch() carries no credentials at
   * all and the API answers 401. The education module never hit this because it
   * calls through apiClient, whose axios interceptor attaches the same header
   * this does — which is why that one module's CRUD worked while the rest
   * silently failed.
   */
  const authenticatedFetch = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const token =
        (typeof window !== 'undefined' ? localStorage.getItem('gym_token') : null) ||
        authSession.token;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((init.headers as Record<string, string>) || {}),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (currentMemberMobile) {
        headers['x-member-mobile'] = currentMemberMobile;
      }

      return globalThis.fetch(url, {
        ...init,
        headers,
        credentials: 'include',
      });
    },
    [authSession.token, currentMemberMobile]
  );

  /**
   * Pulls the content collections the admin panel renders from context.
   *
   * Each endpoint returns { success, <key>: [...] }. A failure on one must not
   * take the others down with it — a village with no gallery is not a reason to
   * leave the events list empty — so each result is applied independently.
   */
  const loadCollections = useCallback(async () => {
    // The admin panel fetches through RTK Query now, with its own cache and
    // tag invalidation. Bootstrapping these here as well would fetch the same
    // rows a second time on every admin page load — the sidebar's three badge
    // counts are the only thing the admin still needs, and AdminSidebar reads
    // those from the same RTK Query cache the sections use.
    if (isAdminRoute.current) return;

    const sources: Array<[string, string, (rows: any[]) => void]> = [
      ['/api/gallery', 'gallery', (rows) => setGallery(rows as GalleryItem[])],
      ['/api/complaints', 'complaints', (rows) => setComplaints(rows as Complaint[])],
      ['/api/social-work', 'socialWorks', (rows) => setSocialWorks(rows as SocialWork[])],
      ['/api/public-info', 'publicInfos', (rows) => setPublicInfos(rows as PublicInfo[])],
      ['/api/announcements', 'announcements', (rows) => setAnnouncements(rows as Announcement[])],
      // fetchMembers() exists and is exported for on-demand refreshes, but
      // nothing ever called it on load, so the directory was empty too.
      ['/api/members', 'members', (rows) => setMembers(rows as Member[])],
      // NOTE: /api/events and /api/elders used to be fetched here too. Nothing
      // reads context `events` or `elders`, and the only stats derived from
      // them — upcomingEvents, eldersCount — have no consumer either, so both
      // requests were pure cost on every page load. The public events and
      // elders pages fetch their own data. Re-add them here if something ever
      // needs them from context, rather than assuming they are populated.
    ];

    await Promise.all(
      sources.map(async ([url, key, apply]) => {
        try {
          const res = await authenticatedFetch(url, { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          if (data?.success && Array.isArray(data[key])) apply(data[key]);
        } catch (e) {
          console.warn(`Failed to load ${url}:`, e instanceof Error ? e.message : e);
        }
      })
    );
  }, [authenticatedFetch]);

  const refreshData = async (force = false, retryCount = 0) => {
    const now = Date.now();
    // The throttle protects the bootstrap path from refetching on every render.
    // Mutations pass force = true: a create the user just made has to appear
    // now, not once a two-minute window happens to close.
    if (!force && lastDataFetchTimeRef.current > 0 && now - lastDataFetchTimeRef.current < 120000) {
      return;
    }

    if (isFetchingDataRef.current) return;
    isFetchingDataRef.current = true;

    try {
      const [authData, villagesList] = await Promise.all([
        fetchAuthMeOnce(),
        fetchVillagesOnce(),
      ]);

      if (authData?.user) {
        const user = authData.user;
        const isAdm = Boolean(
          authData.isAdmin ||
          user.isAdmin ||
          user.systemRole === 'SUPER_ADMIN' ||
          user.systemRole === 'ADMIN'
        );
        setAuthSession((prev) => ({
          ...prev,
          isAdminLoggedIn: isAdm,
          isMemberLoggedIn: true,
          role: user.role,
          systemRole: user.systemRole,
          adminMobile: isAdm ? user.mobile : prev.adminMobile,
          adminName: isAdm ? user.name : prev.adminName,
          adminId: isAdm ? user.id : prev.adminId,
          adminVillageId: user.villageId,
          currentMemberMobile: user.mobile,
          currentMember: user,
          email: user.email,
          permissions: user.permissions || [],
        }));
        if (user.permissions) setUserPermissions(user.permissions);
      }

      if (villagesList && Array.isArray(villagesList) && villagesList.length > 0) {
        setVillages(villagesList);
        const currentV =
          villagesList.find((v: any) => v.id === activeVillageId) || villagesList[0];
        if (currentV) {
          setVillageSettings(currentV as any);
          store.dispatch(reduxUpdateVillageSettings(currentV as any));
        }
      }

      lastDataFetchTimeRef.current = Date.now();
    } catch (e) {
      console.warn('Bootstrap sync note:', e instanceof Error ? e.message : e);
    } finally {
      isFetchingDataRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    // Safety fallback: ensure initial loading state resolves even under slow networks
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('gym_auth', JSON.stringify(authSession));
  }, [authSession]);

  // Compute Stats strictly from real database records
  const stats: AppStats = {
    actualMembers: members.filter((m) => m.status === 'active').length,
    pendingMembers: members.filter((m) => m.status === 'pending').length,
    actualProblems: complaints.length,
    newProblems: complaints.filter((c) => c.status === 'NEW').length,
    inProgressProblems: complaints.filter((c) => c.status === 'ACTION IN PROGRESS').length,
    resolvedProblems: complaints.filter((c) => c.status === 'RESOLVED').length,
    pendingSocialWork: socialWorks.filter((s) => s.status === 'pending').length,
    publishedSocialWork: socialWorks.filter((s) => s.status === 'approved' || s.status === 'published').length,
    pendingInformation: publicInfos.filter((p) => p.status === 'pending').length,
    publishedInformation: publicInfos.filter((p) => p.status === 'approved').length,
    upcomingEvents: events.filter((e) => e.status === 'PUBLISHED').length,
    galleryPhotos: gallery.filter((g) => g.status === 'published').length,
    eldersCount: elders.length,
  };

  const currentMemberObj = useMemo(() => {
    const effectiveMobile = authSession.currentMemberMobile || authSession.adminMobile || authSession.currentMember?.mobile;
    if (!effectiveMobile) return authSession.currentMember || null;
    const cleanMob = effectiveMobile.replace(/\D/g, '').slice(-10);
    return (
      members.find((m) => m.mobile && m.mobile.replace(/\D/g, '').slice(-10) === cleanMob) ||
      authSession.currentMember ||
      null
    );
  }, [authSession.currentMemberMobile, authSession.adminMobile, authSession.currentMember, members]);

  // Synchronize activeVillageId directly from the logged-in user
  useEffect(() => {
    const userVillage =
      currentMemberObj?.villageId ||
      authSession.adminVillageId ||
      authSession.currentMember?.villageId;
    if (userVillage) {
      setActiveVillageId(String(userVillage));
    }
  }, [currentMemberObj?.villageId, authSession.adminVillageId, authSession.currentMember?.villageId]);

  const isApprovedMember = useMemo(() => {
    if (authSession.isAdminLoggedIn || authSession.role === 'SUPER_ADMIN' || authSession.role === 'ADMIN') {
      return true;
    }
    if (authSession.isMemberLoggedIn) {
      return currentMemberObj?.status === 'active';
    }
    return false;
  }, [authSession, currentMemberObj]);

  const saveIntegrationConfig = async (id: string, apiKey: string) => {
    try {
      const res = await authenticatedFetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          apiKey,
          adminName: authSession.adminName || 'Main Admin',
          adminMobile: authSession.adminMobile || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to save config.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  const testIntegration = async (id: string) => {
    try {
      const res = await authenticatedFetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          adminName: authSession.adminName || 'Main Admin',
          adminMobile: authSession.adminMobile || '',
        }),
      });
      const data = await res.json();
      await refreshData(true);
      return data;
    } catch (e) {
      return { success: false, error: 'Connection test failed.' };
    }
  };

  const disconnectIntegration = async (id: string) => {
    try {
      const res = await authenticatedFetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          adminName: authSession.adminName || 'Main Admin',
          adminMobile: authSession.adminMobile || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to disconnect.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error.' };
    }
  };

  const exportDataJson = () => {
    window.open('/api/data/export', '_blank');
  };

  const importDataJson = async (jsonData: any) => {
    try {
      const res = await authenticatedFetch('/api/data/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Import failed.' };
      await refreshData(true);
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: 'Network error during import.' };
    }
  };

  const resetDataStore = async () => {
    try {
      const res = await authenticatedFetch('/api/data/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Reset failed.' };
      await refreshData(true);
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: 'Network error during reset.' };
    }
  };

  const updateVillageSettings = async (newSettings: Partial<VillageSettings>) => {
    try {
      const targetId = activeVillageId || 'vil_rasoolpur';
      const res = await authenticatedFetch(`/api/villages/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...newSettings,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.village) {
          setVillageSettings(data.village);
          store.dispatch(reduxUpdateVillageSettings(data.village));
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'सेटिंग्स अपडेट करने में विफल।' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'नेटवर्क त्रुटि हुई।' };
    }
  };

  const resetMemberPassword = async (mobile: string, otp: string, newPassword: string) => {
    try {
      const res = await authenticatedFetch('/api/member/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'पासवर्ड रीसेट विफल।' };
      }
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: 'सर्वर से जुड़ने में त्रुटि।' };
    }
  };

  const resetAdminPassword = async (mobile: string, otp: string, newPassword: string) => {
    try {
      const res = await authenticatedFetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'एडमिन पासवर्ड रीसेट विफल।' };
      }
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, error: 'सर्वर से जुड़ने में त्रुटि।' };
    }
  };

  const setAdminPassword = async (emailOrMobile: string, resetToken: string, password: string) => {
    try {
      const res = await authenticatedFetch('/api/admin/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: emailOrMobile, resetToken, password }),
      });
      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        data = null;
      }

      if (!res.ok || !data) {
        return { success: false, error: data?.error || 'अधिकृत एडमिन सूची में नहीं है या पासवर्ड सेट करने में त्रुटि।' };
      }
      if (data.admin) {
        setAuthSession({
          isAdminLoggedIn: true,
          adminMobile: data.admin.mobile,
          adminName: data.admin.name,
          adminId: data.admin.id,
          email: data.admin.email || emailOrMobile,
        });
      }
      await refreshData(true);
      return { success: true, admin: data.admin };
    } catch (e) {
      return { success: false, error: 'सर्वर कनेक्शन त्रुटि।' };
    }
  };

  const adminLogout = async () => {
    try {
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut();
    } catch (e) {
      /* ignore */
    }
    store.dispatch(reduxLogout());
    setAuthSession({ isAdminLoggedIn: false });
    localStorage.removeItem('gym_auth');
    localStorage.removeItem('gym_token');
    if (activeSection === 'admin-panel') {
      changeActiveSection('home');
    }
  };

  // Member Handlers
  const addMember = async (
    nameOrData:
      | string
      | {
          name: string;
          mobile: string;
          email?: string;
          password?: string;
          role?: string;
          systemRole?: string;
          status?: string;
          photoUrl?: string;
          fatherName?: string;
          dob?: string;
          gender?: string;
          address?: string;
          pincode?: string;
          state?: string;
          district?: string;
          villageId?: string;
          occupation?: string;
          designation?: string;
          politicalBackground?: string;
          bloodGroup?: string;
          organizationName?: string;
          joiningDate?: string;
          adminName?: string;
          adminMobile?: string;
        },
    posMobile?: string,
    posPhotoUrl?: string,
    posJoiningDate?: string,
    posOrganizationName?: string
  ) => {
    try {
      const payload =
        typeof nameOrData === 'object'
          ? {
              status: authSession.isAdminLoggedIn ? 'active' : 'pending',
              role: 'MEMBER',
              systemRole: 'MEMBER',
              ...nameOrData,
              createdAt: nameOrData.joiningDate
                ? new Date(nameOrData.joiningDate).toISOString()
                : new Date().toISOString(),
            }
          : {
              name: nameOrData,
              mobile: posMobile,
              photoUrl: posPhotoUrl,
              organizationName: posOrganizationName || villageSettings.orgNameHindi || 'ग्रामोदय यूथ मंच',
              status: authSession.isAdminLoggedIn ? 'active' : 'pending',
              role: 'MEMBER',
              systemRole: 'MEMBER',
              createdAt: posJoiningDate ? new Date(posJoiningDate).toISOString() : new Date().toISOString(),
            };

      const res = await authenticatedFetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error,
          alreadyRegistered: Boolean(data.alreadyRegistered),
          member: data.member,
        };
      }
      await refreshData(true);
      return { success: true, member: data.member, inviteLink: data.inviteLink || null };
    } catch (e) {
      return { success: false, error: 'सर्वर से कनेक्ट करने में त्रुटि हुई।' };
    }
  };

  const approveMember = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to approve member.');
      return;
    }
    try {
      await authenticatedFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required.' };
    }
    try {
      const res = await authenticatedFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update member.' };
      }
      await refreshData(true);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server error.' };
    }
  };

  const deleteMember = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to delete member.');
      return;
    }
    try {
      await authenticatedFetch(`/api/members/${id}`, { method: 'DELETE' });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadPhoto = async (targetType: 'admin' | 'member', targetId: string, photoUrl: string) => {
    if (targetType === 'admin' && !authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to update admin photo.');
      return;
    }
    if (targetType === 'member' && !authSession.isAdminLoggedIn) {
      const isSelf = currentMemberMobile && members.find(m => m.id === targetId)?.mobile.replace(/\D/g, '').slice(-10) === currentMemberMobile.replace(/\D/g, '').slice(-10);
      if (!isSelf) {
        console.warn('Unauthorized attempt to update another member photo.');
        return;
      }
    }
    try {
      await authenticatedFetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, photoUrl }),
      });
      if (selectedIdCardMember && selectedIdCardMember.id === targetId) {
        setSelectedIdCardMember({ ...selectedIdCardMember, photoUrl });
      }
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Complaint Handlers (optimistic updates)
  const submitComplaint = async (data: Omit<Complaint, 'id' | 'createdAt' | 'status'> & { userId?: string }) => {
    if (!isApprovedMember) {
      return {
        success: false,
        error: 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है। एडमिन द्वारा अनुमोदन के बाद ही आप शिकायत दर्ज कर सकते हैं।',
      };
    }
    try {
      const currentUserId = authSession.currentMemberId || authSession.currentMember?.id || authSession.adminId || authSession.supabaseUserId;
      const currentUserName = authSession.currentMemberName || authSession.adminName || authSession.currentMember?.name;
      const currentUserMobile = authSession.currentMemberMobile || authSession.adminMobile || authSession.currentMember?.mobile;

      // Auto-inject userId, reporter details, and villageId from session if not provided
      const payload = {
        ...data,
        userId: data.userId || currentUserId,
        reporterName: data.reporterName || currentUserName || 'Village Resident',
        reporterMobile: data.reporterMobile || currentUserMobile || 'Hidden',
        villageId: data.villageId || authSession.activeVillageId || authSession.adminVillageId,
      };
      const res = await authenticatedFetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to submit complaint.' };
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to update complaint status.');
      return;
    }

    // Optimistic update: update local state immediately
    const prevComplaints = [...complaints];
    const idx = complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const updated = { ...complaints[idx], status };
      if (status === 'RESOLVED') updated.resolvedAt = new Date().toISOString();
      complaints[idx] = updated;
    }

    try {
      const res = await authenticatedFetch(`/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      if (!res.ok) {
        // Rollback on failure
        if (idx !== -1) complaints[idx] = prevComplaints[idx];
      }
      await refreshData(true);
    } catch (e) {
      // Rollback on error
      if (idx !== -1) complaints[idx] = prevComplaints[idx];
      console.error(e);
    }
  };

  const deleteComplaint = async (id: string) => {
    const item = complaints.find((c) => c.id === id);
    if (!canDeleteContent(item?.reporterMobile, item?.villageId)) {
      console.warn('Unauthorized attempt to delete complaint.');
      return;
    }
    try {
      await authenticatedFetch(`/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: authSession.adminName || authSession.currentMemberName,
          adminMobile: authSession.adminMobile || currentMemberMobile,
          userMobile: currentMemberMobile,
        }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const editComplaint = async (id: string, updates: Partial<Complaint>) => {
    const complaint = complaints.find((c) => c.id === id);
    if (!canEditContent(complaint?.reporterMobile, complaint?.villageId)) {
      return { success: false, error: 'Unauthorized: You can only edit complaints you submitted or manage.' };
    }
    try {
      const res = await authenticatedFetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updaterName: authSession.adminName || authSession.currentMemberName,
          updaterMobile: authSession.adminMobile || currentMemberMobile,
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to edit complaint.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  // Social Work
  const submitSocialWork = async (data: Omit<SocialWork, 'id' | 'createdAt' | 'status'>) => {
    if (!isApprovedMember) {
      return {
        success: false,
        error: 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है। एडमिन द्वारा अनुमोदन के बाद ही आप सामाजिक कार्य पोस्ट कर सकते हैं।',
      };
    }
    try {
      const res = await authenticatedFetch('/api/social-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        return { success: false, error: result.error || 'Failed to submit social work.' };
      }
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const updateSocialWorkStatus = async (id: string, status: 'approved' | 'published' | 'pending') => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to update social work status.');
      return;
    }
    try {
      await authenticatedFetch(`/api/social-work/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSocialWork = async (id: string) => {
    const item = socialWorks.find((w) => w.id === id);
    if (!canDeleteContent(item?.submitterMobile, item?.villageId)) {
      console.warn('Unauthorized attempt to delete social work.');
      return;
    }
    try {
      await authenticatedFetch(`/api/social-work/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: authSession.adminName || authSession.currentMemberName,
          adminMobile: authSession.adminMobile || currentMemberMobile,
          userMobile: currentMemberMobile,
        }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const editSocialWork = async (id: string, updates: Partial<SocialWork>) => {
    const item = socialWorks.find((s) => s.id === id);
    if (!canEditContent(item?.submitterMobile, item?.villageId)) {
      return { success: false, error: 'Unauthorized: You can only edit social work items you submitted.' };
    }
    try {
      const res = await authenticatedFetch(`/api/social-work/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updaterName: authSession.adminName || authSession.currentMemberName,
          updaterMobile: authSession.adminMobile || currentMemberMobile,
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to edit social work.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  // Public Info
  const submitPublicInfo = async (data: Omit<PublicInfo, 'id' | 'createdAt' | 'status'>) => {
    if (!isApprovedMember) {
      return {
        success: false,
        error: 'आपकी सदस्यता अभी सत्यापन/अनुमोदन के लिए लंबित है। एडमिन द्वारा अनुमोदन के बाद ही आप सार्वजनिक सूचना पोस्ट कर सकते हैं।',
      };
    }
    try {
      const res = await authenticatedFetch('/api/public-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        return { success: false, error: result.error || 'Failed to submit info.' };
      }
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const updatePublicInfoStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to update public info status.');
      return;
    }
    try {
      await authenticatedFetch(`/api/public-info/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const deletePublicInfo = async (id: string) => {
    const item = publicInfos.find((p) => p.id === id);
    if (!canDeleteContent(item?.mobile, item?.villageId)) {
      console.warn('Unauthorized attempt to delete public info.');
      return;
    }
    try {
      await authenticatedFetch(`/api/public-info/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: authSession.adminName || authSession.currentMemberName,
          adminMobile: authSession.adminMobile || currentMemberMobile,
          userMobile: currentMemberMobile,
        }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const editPublicInfo = async (id: string, updates: Partial<PublicInfo>) => {
    const item = publicInfos.find((p) => p.id === id);
    if (!canEditContent(item?.mobile, item?.villageId)) {
      return { success: false, error: 'Unauthorized: You can only edit public info you submitted.' };
    }
    try {
      const res = await authenticatedFetch(`/api/public-info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          updaterName: authSession.adminName || authSession.currentMemberName,
          updaterMobile: authSession.adminMobile || currentMemberMobile,
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to edit public info.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  // Announcements
  const publishAnnouncement = async (title: string, content: string) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to publish announcements.' };
    }
    try {
      const res = await authenticatedFetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          publishedBy: authSession.adminName || 'Main Admin',
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to publish announcement.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const updateAnnouncement = async (id: string, title: string, content: string) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required.' };
    }
    try {
      const res = await authenticatedFetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to update announcement.' };
      await refreshData(true);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Server error.' };
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to delete announcement.');
      return;
    }
    try {
      await authenticatedFetch(`/api/announcements/${id}`, { method: 'DELETE' });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Events
  const createEvent = async (data: Omit<EventItem, 'id' | 'createdAt'>) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to create events.' };
    }
    try {
      const res = await authenticatedFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false, error: 'Failed to create event.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to update events.' };
    }
    try {
      const res = await authenticatedFetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return { success: false, error: 'Failed to update event.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  // There is no /status subroute for events or gallery — only the [id] PATCH,
  // which already accepts a partial update including status. These two used to
  // call a path that does not exist and 404 without saying so.
  const updateEventStatus = async (id: string, status: EventStatus) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to update event status.' };
    }
    try {
      const res = await authenticatedFetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return { success: false, error: 'Failed to update status.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to delete event.');
      return;
    }
    try {
      await authenticatedFetch(`/api/events/${id}`, { method: 'DELETE' });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Gallery
  const uploadGalleryPhoto = async (caption: string, photoUrl: string, status?: 'pending' | 'published') => {
    try {
      const isUserAdmin = authSession.isAdminLoggedIn;
      const res = await authenticatedFetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          photoUrl,
          uploadedBy: isUserAdmin ? authSession.adminName || 'Admin' : 'Member',
          isAdmin: isUserAdmin,
          status: status || (isUserAdmin ? 'published' : 'pending'),
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to upload image.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const approveGalleryPhoto = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to approve gallery photo.');
      return;
    }
    try {
      await authenticatedFetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const editGalleryCaption = async (id: string, caption: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to edit gallery caption.');
      return;
    }
    try {
      await authenticatedFetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to delete gallery photo.');
      return;
    }
    try {
      await authenticatedFetch(`/api/gallery/${id}`, { method: 'DELETE' });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Elders
  const addElder = async (data: { name: string; mobile?: string; photoUrl?: string; location?: string; details?: string }) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to add elder records.' };
    }
    try {
      const res = await authenticatedFetch('/api/elders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false, error: 'Failed to add elder.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const editElder = async (id: string, data: Partial<Elder>) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to edit elder records.' };
    }
    try {
      const res = await authenticatedFetch(`/api/elders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) return { success: false, error: 'Failed to update elder.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error.' };
    }
  };

  const deleteElder = async (id: string) => {
    if (!authSession.isAdminLoggedIn) {
      console.warn('Unauthorized attempt to delete elder record.');
      return;
    }
    try {
      await authenticatedFetch(`/api/elders/${id}`, { method: 'DELETE' });
      await refreshData(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Permissions & Scoping Helpers
  const isSuperAdmin =
    authSession.isAdminLoggedIn &&
    (authSession.role === 'SUPER_ADMIN' ||
      !authSession.adminUser?.villageId ||
      authSession.adminUser?.isHead ||
      authSession.adminMobile === '8887754321');

  const canManageVillage = (villageId?: string) => {
    if (!authSession.isAdminLoggedIn) return false;
    if (isSuperAdmin) return true;
    if (!villageId) return true;
    const adminVillageId = authSession.adminUser?.villageId || authSession.adminUser?.village;
    return adminVillageId === villageId;
  };

  const canEditContent = (authorMobile?: string, villageId?: string) => {
    if (isSuperAdmin) return true;
    if (canManageVillage(villageId)) return true;
    if (
      authSession.isMemberLoggedIn &&
      currentMemberMobile &&
      authorMobile &&
      authorMobile.replace(/\D/g, '').slice(-10) ===
        currentMemberMobile.replace(/\D/g, '').slice(-10)
    ) {
      return true;
    }
    return false;
  };

  const canDeleteContent = (authorMobile?: string, villageId?: string) => {
    return canEditContent(authorMobile, villageId);
  };

  // Village CRUD (Super Admin & Village Admin)
  const addVillage = async (data: Partial<Village>) => {
    if (!authSession.isAdminLoggedIn) {
      return { success: false, error: 'Unauthorized: Admin login required to create villages.' };
    }
    try {
      const res = await authenticatedFetch('/api/villages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      await refreshData(true);
      return { success: true, village: result.village };
    } catch (e) {
      return { success: false, error: 'Failed to add village.' };
    }
  };

  const updateVillage = async (id: string, data: Partial<Village>) => {
    if (!canManageVillage(id)) {
      return { success: false, error: 'Unauthorized to update this village.' };
    }
    try {
      const res = await authenticatedFetch(`/api/villages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      await refreshData(true);
      return { success: true, village: result.village };
    } catch (e) {
      return { success: false, error: 'Failed to update village.' };
    }
  };

  const deleteVillage = async (id: string) => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Unauthorized: Only Super Admin can delete villages.' };
    }
    try {
      const res = await authenticatedFetch(`/api/villages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: authSession.adminName,
          adminMobile: authSession.adminMobile,
        }),
      });
      if (!res.ok) return { success: false, error: 'Failed to delete village.' };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Server error deleting village.' };
    }
  };

  // Member Self-Profile Update
  const editMemberProfile = async (id: string, updates: Partial<Member>) => {
    const isSelf =
      currentMemberMobile &&
      members.find((m) => m.id === id)?.mobile.replace(/\D/g, '').slice(-10) ===
        currentMemberMobile.replace(/\D/g, '').slice(-10);

    if (!authSession.isAdminLoggedIn && !isSelf) {
      return { success: false, error: 'Unauthorized: You can only edit your own profile.' };
    }
    try {
      const res = await authenticatedFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to update profile.' };
    }
  };

  // Super Admin Role Management
  const changeMemberRole = async (id: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER', villageId?: string) => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Unauthorized: Only Super Admin can change user roles.' };
    }
    try {
      const res = await authenticatedFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          villageId,
          adminName: authSession.adminName || 'Super Admin',
          adminMobile: authSession.adminMobile || '',
        }),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error };
      await refreshData(true);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to change member role.' };
    }
  };

  const membersFetchPromiseRef = useRef<Promise<Member[]> | null>(null);
  const lastMembersFetchedAtRef = useRef<number>(0);

  const fetchMembers = useCallback(async (force = false) => {
    const now = Date.now();
    if (membersFetchPromiseRef.current) {
      return membersFetchPromiseRef.current;
    }
    if (!force && now - lastMembersFetchedAtRef.current < 3000 && members.length > 0) {
      return members;
    }

    const promise = (async () => {
      try {
        const res = await authenticatedFetch('/api/members', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.members)) {
            setMembers(data.members);
            lastMembersFetchedAtRef.current = Date.now();
            return data.members as Member[];
          }
        }
      } catch (e) {
        console.warn('Failed to fetch /api/members:', e);
      } finally {
        membersFetchPromiseRef.current = null;
      }
      return [];
    })();

    membersFetchPromiseRef.current = promise;
    return promise;
  }, [members]);



  const fetchUserMessages = async (mobile: string): Promise<ChatMessage[]> => {
    if (!mobile) return [];
    try {
      const res = await authenticatedFetch(`/api/messages?userMobile=${encodeURIComponent(mobile)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const sendMessage = async (
    senderMobile: string,
    senderName: string,
    recipientMobile: string,
    recipientName: string,
    text: string
  ) => {
    try {
      const res = await authenticatedFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderMobile, senderName, recipientMobile, recipientName, text }),
      });
      if (!res.ok) return { success: false, error: 'संदेश भेजने में त्रुटि हुई।' };
      return { success: true };
    } catch (e) {
      return { success: false, error: 'सर्वर त्रुटि।' };
    }
  };

  const markMessagesRead = async (userMobile: string, partnerMobile: string) => {
    try {
      await authenticatedFetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMobile, partnerMobile }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection: changeActiveSection,
        goBack,
        canGoBack,
        lang,
        setLang,
        t,
        villageSettings,
        updateVillageSettings,
        villages,
        activeVillageId,
        setActiveVillageId,
        userPermissions,
        checkPermission,
        admins,
        members,
        fetchMembers,
        complaints,
        socialWorks,
        publicInfos,
        announcements,
        events,
        gallery,
        elders,
        auditLogs,
        integrations,
        stats,
        authSession,
        setAuthSession,
        isJoinModalOpen,
        setIsJoinModalOpen,
        isMyProfileModalOpen,
        setIsMyProfileModalOpen,
        memberLogout,
        isLoading,
        refreshData,
        resetMemberPassword,
        resetAdminPassword,
        setAdminPassword,
        adminLogout,
        addMember,
        approveMember,
        updateMember,
        deleteMember,
        uploadPhoto,
        submitComplaint,
        updateComplaintStatus,
        deleteComplaint,
        submitSocialWork,
        updateSocialWorkStatus,
        deleteSocialWork,
        submitPublicInfo,
        updatePublicInfoStatus,
        deletePublicInfo,
        publishAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        createEvent,
        updateEvent,
        updateEventStatus,
        deleteEvent,
        uploadGalleryPhoto,
        approveGalleryPhoto,
        editGalleryCaption,
        deleteGalleryItem,
        addElder,
        editElder,
        deleteElder,
        saveIntegrationConfig,
        testIntegration,
        disconnectIntegration,
        exportDataJson,
        importDataJson,
        resetDataStore,
        currentMemberMobile,
        setCurrentMemberMobile,
        selectedChatPartner,
        setSelectedChatPartner,
        selectedIdCardMember,
        setSelectedIdCardMember,
        groupMessages,
        onlineMembers,
        fetchGroupChat,
        sendGroupMessage,
        deleteGroupMessage,
        fetchUserMessages,
        sendMessage,
        markMessagesRead,
        addVillage,
        updateVillage,
        deleteVillage,
        editMemberProfile,
        editComplaint,
        editSocialWork,
        editPublicInfo,
        changeMemberRole,
        isSuperAdmin,
        isApprovedMember,
        currentMemberObj,
        canManageVillage,
        canEditContent,
        canDeleteContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
