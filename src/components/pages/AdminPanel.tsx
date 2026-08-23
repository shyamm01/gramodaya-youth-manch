'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  AdminLayout,
  AdminMetricsCards,
  AdminActivityChart,
  AdminMemberTrendChart,
  AdminHelpdeskSection,
  AdminEducationSection,
  AdminPermissionsSection,
} from '../admin';

import {
  Shield,
  Users,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  Volume2,
  Calendar,
  Image as ImageIcon,
  Award,
  Globe,
  Database,
  Key,
  Settings,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit2,
  Lock,
  PhoneCall,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Mail,
  Camera,
  Layers,
  Calendar as CalendarIcon,
  X,
  MapPin,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { DatePicker } from '../inputs/DatePicker';
import { ImageUploader } from '../inputs/ImageUploader';
import { AddressFormFields, AddressData } from '../common/AddressFormFields';
import {
  Member,
  Complaint,
  ComplaintCategory,
  SocialWork,
  EventItem,
  GalleryItem,
  Elder,
  Village,
  Announcement,
  EventStatus,
} from '../../types';
import { MemberPermissionsModal } from '../modals/MemberPermissionsModal';
import {
  ConfirmDialog,
  EditorDialog,
  EmptyState,
  FilterBar,
  NoticeBanner,
  SearchInput,
  SectionHeader,
  SectionShell,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  useSectionNotice,
  type ConfirmTarget,
} from '../admin/section-ui';

/** Mirrors the EventStatus union in src/types.ts. */
const EVENT_STATUSES: EventStatus[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];

/** Mirrors the ComplaintCategory union in src/types.ts. */
const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Water',
  'Road',
  'Electricity',
  'Cleanliness',
  'Environment',
  'Education',
  'Health',
  'Sanitation',
  'Animal-related',
  'Social Issue',
  'Government Service',
  'Other',
];


interface AdminPanelProps {
  initialTab?: string;
  requiredRole?: 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  initialTab = 'dashboard',
  requiredRole = 'SUPER_ADMIN',
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const derivedTab = useMemo(() => {
    if (pathname) {
      const segment = pathname.replace(/^\/(super-admin|admin)\/?/, '');
      if (segment) {
        if (segment === 'permissions/modules' || segment === 'modules') return 'modules';
        if (segment === 'permissions/roles' || segment === 'roles') return 'roles';
        if (segment === 'permissions/audit' || segment === 'security' || segment === 'audit') return 'audit';
        return segment;
      }
    }
    return initialTab || 'dashboard';
  }, [pathname, initialTab]);

  const [activeTab, setActiveTab] = useState<string>(derivedTab);

  useEffect(() => {
    setActiveTab(derivedTab);
  }, [derivedTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const basePath = pathname?.startsWith('/admin') ? '/admin' : '/super-admin';
    const targetUrl = newTab === 'dashboard' ? basePath : `${basePath}/${newTab}`;
    if (pathname !== targetUrl) {
      router.push(targetUrl);
    }
  };

  const {
    members,
    complaints,
    socialWorks,
    events,
    gallery,
    elders,
    villages,
    activeVillageId,
    setActiveVillageId,
    publicInfos,
    announcements,
    villageSettings,
    stats,
    isSuperAdmin,
    authSession,
    refreshData,
    approveMember,
    updateMember,
    deleteMember,
    changeMemberRole,
    addMember,
    submitComplaint,
    editComplaint,
    updateComplaintStatus,
    deleteComplaint,
    submitSocialWork,
    editSocialWork,
    updateSocialWorkStatus,
    deleteSocialWork,
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
    addVillage,
    updateVillage,
    deleteVillage,
    updateVillageSettings,
    resetDataStore,
    exportDataJson,
    importDataJson,
    uploadPhoto,
  } = useApp();

  // Member Creation States with State, District, Village selectors
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemMobile, setNewMemMobile] = useState('');
  const [newMemRole, setNewMemRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [newMemState, setNewMemState] = useState(villageSettings.state || 'Uttar Pradesh');
  const [newMemDistrict, setNewMemDistrict] = useState(villageSettings.district || 'Jaunpur');
  const [newMemVillage, setNewMemVillage] = useState(villageSettings.id || '1');
  const [newMemAddress, setNewMemAddress] = useState('');
  const [newMemMsg, setNewMemMsg] = useState('');

  // Dynamic Location Lists derived from registered villages
  const dynamicMemberStates = useMemo(() => {
    const s = new Set<string>();
    villages.forEach((v) => {
      const st = (v as any).state || (v as any).stateName || villageSettings.state || 'Uttar Pradesh';
      if (st) s.add(st);
    });
    if (villageSettings.state) s.add(villageSettings.state);
    return Array.from(s);
  }, [villages, villageSettings]);

  const dynamicMemberDistricts = useMemo(() => {
    const d = new Set<string>();
    villages.forEach((v) => {
      const vState = (v as any).state || (v as any).stateName || villageSettings.state || 'Uttar Pradesh';
      if (!newMemState || vState === newMemState) {
        const dst = v.districtName || (v as any).district || villageSettings.district || 'Jaunpur';
        if (dst) d.add(dst);
      }
    });
    if (villageSettings.district) d.add(villageSettings.district);
    return Array.from(d);
  }, [villages, villageSettings, newMemState]);

  // Search & Filter States
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'active' | 'pending' | 'suspended'>('ALL');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'ALL' | 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [memberVillageFilter, setMemberVillageFilter] = useState<string>('ALL');
  const [memberDateFilter, setMemberDateFilter] = useState<string>('');

  const [problemSearch, setProblemSearch] = useState('');
  const [problemStatusFilter, setProblemStatusFilter] = useState<'ALL' | 'NEW' | 'ACTION IN PROGRESS' | 'RESOLVED'>('ALL');
  const [problemDateFilter, setProblemDateFilter] = useState<string>('');

  const [socialSearch, setSocialSearch] = useState('');
  const [socialStatusFilter, setSocialStatusFilter] = useState<'ALL' | 'approved' | 'pending' | 'published'>('ALL');
  const [socialDateFilter, setSocialDateFilter] = useState<string>('');

  const [infoSearch, setInfoSearch] = useState('');
  const [infoStatusFilter, setInfoStatusFilter] = useState<'ALL' | 'approved' | 'pending' | 'rejected'>('ALL');

  const [eventSearch, setEventSearch] = useState('');
  const [eventDateFilter, setEventDateFilter] = useState<string>('');

  const [gallerySearch, setGallerySearch] = useState('');
  const [elderSearch, setElderSearch] = useState('');



  const [permissionsMember, setPermissionsMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editMemName, setEditMemName] = useState('');
  const [editMemMobile, setEditMemMobile] = useState('');
  const [editMemRole, setEditMemRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [editMemStatus, setEditMemStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [editMemVillage, setEditMemVillage] = useState(villageSettings.id || '1');
  const [editMemAddress, setEditMemAddress] = useState('');
  const [editMemMsg, setEditMemMsg] = useState('');

  // Edit Complaint State
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editCompTitle, setEditCompTitle] = useState('');
  const [editCompCategory, setEditCompCategory] = useState('');
  const [editCompDesc, setEditCompDesc] = useState('');
  const [editCompLocation, setEditCompLocation] = useState('');
  const [editCompStatus, setEditCompStatus] = useState<any>('NEW');
  const [editCompMsg, setEditCompMsg] = useState('');

  // Edit Social Work State
  const [editingSocialWork, setEditingSocialWork] = useState<SocialWork | null>(null);
  const [editSocialTitle, setEditSocialTitle] = useState('');
  const [editSocialDesc, setEditSocialDesc] = useState('');
  const [editSocialDate, setEditSocialDate] = useState('');
  const [editSocialLocation, setEditSocialLocation] = useState('');
  const [editSocialStatus, setEditSocialStatus] = useState<any>('approved');
  const [editSocialMsg, setEditSocialMsg] = useState('');

  // Edit Announcement State
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editAnnTitle, setEditAnnTitle] = useState('');
  const [editAnnContent, setEditAnnContent] = useState('');
  const [editAnnMsg, setEditAnnMsg] = useState('');

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDesc, setEditEventDesc] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventStatus, setEditEventStatus] = useState<any>('PUBLISHED');
  const [editEventMsg, setEditEventMsg] = useState('');

  // Edit Gallery State
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [editGalleryCaptionText, setEditGalleryCaptionText] = useState('');
  const [editGalleryMsg, setEditGalleryMsg] = useState('');

  // Edit Elder State
  const [editingElder, setEditingElder] = useState<Elder | null>(null);
  const [editElderName, setEditElderName] = useState('');
  const [editElderMobile, setEditElderMobile] = useState('');
  const [editElderLocation, setEditElderLocation] = useState('');
  const [editElderDetails, setEditElderDetails] = useState('');
  const [editElderMsg, setEditElderMsg] = useState('');

  // Edit Village State
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [editVillageName, setEditVillageName] = useState('');
  const [editVillageNameHindi, setEditVillageNameHindi] = useState('');
  const [editVillageContactMobile, setEditVillageContactMobile] = useState('');
  const [editVillageOrgName, setEditVillageOrgName] = useState('');
  const [editVillageOrgNameHindi, setEditVillageOrgNameHindi] = useState('');
  const [editVillageMsg, setEditVillageMsg] = useState('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annMsg, setAnnMsg] = useState('');

  // Event Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventLocation, setEventLocation] = useState('');
  const [eventMsg, setEventMsg] = useState('');

  // Gallery Form
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryMsg, setGalleryMsg] = useState('');

  // Elder Form
  const [elderName, setElderName] = useState('');
  const [elderMobile, setElderMobile] = useState('');
  const [elderLocation, setElderLocation] = useState('');
  const [elderDetails, setElderDetails] = useState('');
  const [elderMsg, setElderMsg] = useState('');

  // Village Form
  const [villageName, setVillageName] = useState('');
  const [villageNameHindi, setVillageNameHindi] = useState('');
  const [villageContactMobile, setVillageContactMobile] = useState('');
  const [villageOrgName, setVillageOrgName] = useState('');
  const [villageOrgNameHindi, setVillageOrgNameHindi] = useState('');
  const [villageMsg, setVillageMsg] = useState('');

  // Every destructive action in this panel routes through one dialog rather
  // than deleting on the first click. The action itself is carried as a
  // closure, so a new delete needs no new state and no new branch here.
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

  // Each section's create form is a modal opened from its header button, the
  // way the education module does it, rather than a form card pinned above the
  // list taking up room whether or not anyone is adding anything.
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);
  const [isSocialFormOpen, setIsSocialFormOpen] = useState(false);
  const [isAnnFormOpen, setIsAnnFormOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [isElderFormOpen, setIsElderFormOpen] = useState(false);
  const [isVillageFormOpen, setIsVillageFormOpen] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const { notice, flash } = useSectionNotice();

  // Grievance Form (admins file on behalf of residents who walk in or phone)
  // Photos for the forms that carry one. Each is uploaded and cropped before
  // it ever reaches the form state — what is held here is the final CDN URL.
  const [compPhotoUrl, setCompPhotoUrl] = useState('');
  const [socialPhotoUrl, setSocialPhotoUrl] = useState('');
  const [eventPhotoUrl, setEventPhotoUrl] = useState('');
  const [elderPhotoUrl, setElderPhotoUrl] = useState('');

  const [compTitle, setCompTitle] = useState('');
  const [compCategory, setCompCategory] = useState<ComplaintCategory>('Water');
  const [compDesc, setCompDesc] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compReporterName, setCompReporterName] = useState('');
  const [compReporterMobile, setCompReporterMobile] = useState('');
  const [compMsg, setCompMsg] = useState('');

  // Social Initiative Form
  const [socialTitle, setSocialTitle] = useState('');
  const [socialDesc, setSocialDesc] = useState('');
  const [socialDate, setSocialDate] = useState('');
  const [socialLocation, setSocialLocation] = useState('');
  const [socialSubmitterName, setSocialSubmitterName] = useState('');
  const [socialSubmitterMobile, setSocialSubmitterMobile] = useState('');
  const [socialMsg, setSocialMsg] = useState('');

  // Settings Form
  const [orgName, setOrgName] = useState(villageSettings.orgName || '');
  const [orgNameHindi, setOrgNameHindi] = useState(villageSettings.orgNameHindi || '');
  const [tagline, setTagline] = useState(villageSettings.tagline || '');
  const [taglineHindi, setTaglineHindi] = useState(villageSettings.taglineHindi || '');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Super Admin Exclusive Gate
  if (!authSession || !authSession.isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-[#27272a] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-5 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Authentication Required</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Administrator Access Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-2">
              Please sign in with your administrator credentials to access the management dashboard.
            </p>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-2xl text-xs text-slate-700 dark:text-zinc-300 text-left space-y-1.5">
            <p className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Sign In Details:</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              • Super Admin Mobile: <strong className="text-slate-900 dark:text-white font-mono">9506072678</strong> (Full Global Access)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              • Village Admins: Sign in with your registered mobile to access your assigned chapter.
            </p>
          </div>

          <button
            onClick={() => router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>🔐 Sign In to Admin Panel</span>
          </button>
        </div>
      </div>
    );
  }

  const isSuperAdminUser = Boolean(
    isSuperAdmin ||
    authSession.systemRole === "SUPER_ADMIN" ||
    authSession.role === "SUPER_ADMIN" ||
    authSession.adminMobile === "9506072678" ||
    authSession.adminMobile === "8887754321" ||
    authSession.adminUser?.isHead
  );

  const assignedAdminVillageId =
    authSession.adminVillageId ||
    authSession.adminUser?.villageId ||
    authSession.currentMember?.villageId ||
    "vil_rasoolpur";

  // Effective village filter:
  // - Super Admin can view 'ALL' villages or pick any village via memberVillageFilter or activeVillageId
  // - Local Village Admin is strictly scoped to assignedAdminVillageId
  const effectiveVillageFilter = isSuperAdminUser
    ? (memberVillageFilter || activeVillageId || "ALL")
    : assignedAdminVillageId;

  // Filtered lists
  const filteredMembersList = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.mobile.includes(memberSearch);
    const matchesStatus = memberStatusFilter === "ALL" || m.status === memberStatusFilter;
    const matchesRole = memberRoleFilter === "ALL" || (m.role || "MEMBER") === memberRoleFilter;
    const matchesVillage = effectiveVillageFilter === "ALL" || m.villageId === effectiveVillageFilter;
    const matchesDate = !memberDateFilter || (m.createdAt && m.createdAt.startsWith(memberDateFilter));
    return matchesSearch && matchesStatus && matchesRole && matchesVillage && matchesDate;
  });

  const filteredProblemsList = complaints.filter((c) => {
    const matchesStatus = problemStatusFilter === "ALL" || c.status === problemStatusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(problemSearch.toLowerCase()) ||
      c.reporterName.toLowerCase().includes(problemSearch.toLowerCase());
    const matchesVillage = effectiveVillageFilter === "ALL" || c.villageId === effectiveVillageFilter;
    const matchesDate = !problemDateFilter || (c.createdAt && c.createdAt.startsWith(problemDateFilter));
    return matchesStatus && matchesSearch && matchesVillage && matchesDate;
  });

  const filteredSocialList = socialWorks.filter((s) => {
    const matchesStatus = socialStatusFilter === "ALL" || s.status === socialStatusFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(socialSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(socialSearch.toLowerCase()) ||
      (s.submitterName || "").toLowerCase().includes(socialSearch.toLowerCase());
    const matchesVillage = effectiveVillageFilter === "ALL" || s.villageId === effectiveVillageFilter;
    const matchesDate = !socialDateFilter || (s.date && s.date.startsWith(socialDateFilter));
    return matchesStatus && matchesSearch && matchesVillage && matchesDate;
  });

  const filteredInfoList = publicInfos.filter((p) => {
    const matchesStatus = infoStatusFilter === "ALL" || p.status === infoStatusFilter;
    const matchesSearch =
      (p.information || "").toLowerCase().includes(infoSearch.toLowerCase()) ||
      (p.name || "").toLowerCase().includes(infoSearch.toLowerCase()) ||
      (p.mobile || "").includes(infoSearch);
    const matchesVillage = effectiveVillageFilter === "ALL" || p.villageId === effectiveVillageFilter;
    return matchesStatus && matchesSearch && matchesVillage;
  });

  const filteredEventsList = events.filter((e) => {
    const matchesSearch =
      (e.title || e.name || "").toLowerCase().includes(eventSearch.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(eventSearch.toLowerCase());
    const matchesVillage = effectiveVillageFilter === "ALL" || e.villageId === effectiveVillageFilter;
    const matchesDate = !eventDateFilter || (e.date && e.date.startsWith(eventDateFilter));
    return matchesSearch && matchesVillage && matchesDate;
  });

  const filteredGalleryList = gallery.filter((g) => {
    const matchesSearch =
      (g.caption || "").toLowerCase().includes(gallerySearch.toLowerCase()) ||
      (g.uploadedBy || "").toLowerCase().includes(gallerySearch.toLowerCase());
    const matchesVillage = effectiveVillageFilter === "ALL" || g.villageId === effectiveVillageFilter;
    return matchesSearch && matchesVillage;
  });

  const filteredEldersList = elders.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(elderSearch.toLowerCase()) ||
      (e.mobile || "").includes(elderSearch) ||
      (e.location || "").toLowerCase().includes(elderSearch.toLowerCase());
    const matchesVillage = effectiveVillageFilter === "ALL" || e.villageId === effectiveVillageFilter;
    return matchesSearch && matchesVillage;
  });

  // Form Handlers
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemMobile) return;
    setNewMemMsg("Registering member...");
    try {
      const res = await addMember({
        name: newMemName,
        mobile: newMemMobile,
        villageId: isSuperAdminUser ? (newMemVillage || (effectiveVillageFilter !== "ALL" ? effectiveVillageFilter : "vil_rasoolpur")) : assignedAdminVillageId,
        address: newMemAddress,
      });
      if (res.success) {
        setNewMemMsg('✅ Member registered successfully!');
        setNewMemName('');
        setNewMemMobile('');
        setTimeout(() => {
          setIsAddMemberOpen(false);
          setNewMemMsg('');
        }, 1200);
      } else {
        setNewMemMsg(`❌ Error: ${res.error || 'Failed'}`);
      }
    } catch (err: any) {
      setNewMemMsg(`❌ Error: ${err?.message || 'Could not add member'}`);
    }
  };

  const handleUpdateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditMemMsg('Updating member...');
    try {
      await updateMember(editingMember.id, {
        name: editMemName,
        mobile: editMemMobile,
        role: editMemRole as any,
        status: editMemStatus,
        villageId: editMemVillage,
        address: editMemAddress,
      });
      setEditMemMsg('✅ Updated successfully!');
      setTimeout(() => {
        setEditingMember(null);
        setEditMemMsg('');
      }, 1000);
    } catch (err: any) {
      setEditMemMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setEditCompMsg('Updating grievance...');
    try {
      await editComplaint(editingComplaint.id, {
        title: editCompTitle,
        category: editCompCategory as any,
        description: editCompDesc,
        location: editCompLocation,
        status: editCompStatus,
      });
      setEditCompMsg('✅ Grievance updated successfully!');
      setTimeout(() => {
        setEditingComplaint(null);
        setEditCompMsg('');
      }, 1000);
    } catch (err: any) {
      setEditCompMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateSocialWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocialWork) return;
    setEditSocialMsg('Updating initiative...');
    try {
      await editSocialWork(editingSocialWork.id, {
        title: editSocialTitle,
        description: editSocialDesc,
        date: editSocialDate,
        location: editSocialLocation,
        status: editSocialStatus,
      });
      setEditSocialMsg('✅ Initiative updated successfully!');
      setTimeout(() => {
        setEditingSocialWork(null);
        setEditSocialMsg('');
      }, 1000);
    } catch (err: any) {
      setEditSocialMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    setEditAnnMsg('Updating announcement...');
    try {
      await updateAnnouncement(editingAnnouncement.id, editAnnTitle, editAnnContent);
      setEditAnnMsg('✅ Announcement updated successfully!');
      setTimeout(() => {
        setEditingAnnouncement(null);
        setEditAnnMsg('');
      }, 1000);
    } catch (err: any) {
      setEditAnnMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setEditEventMsg('Updating event...');
    try {
      await updateEvent(editingEvent.id, {
        title: editEventTitle,
        description: editEventDesc,
        date: editEventDate,
        time: editEventTime,
        location: editEventLocation,
        status: editEventStatus,
      });
      setEditEventMsg('✅ Event updated successfully!');
      setTimeout(() => {
        setEditingEvent(null);
        setEditEventMsg('');
      }, 1000);
    } catch (err: any) {
      setEditEventMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    setEditGalleryMsg('Updating caption...');
    try {
      await editGalleryCaption(editingGallery.id, editGalleryCaptionText);
      setEditGalleryMsg('✅ Caption updated successfully!');
      setTimeout(() => {
        setEditingGallery(null);
        setEditGalleryMsg('');
      }, 1000);
    } catch (err: any) {
      setEditGalleryMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateElderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElder) return;
    setEditElderMsg('Updating elder record...');
    try {
      await editElder(editingElder.id, {
        name: editElderName,
        mobile: editElderMobile,
        location: editElderLocation,
        details: editElderDetails,
      });
      setEditElderMsg('✅ Elder record updated successfully!');
      setTimeout(() => {
        setEditingElder(null);
        setEditElderMsg('');
      }, 1000);
    } catch (err: any) {
      setEditElderMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  const handleUpdateVillageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVillage) return;
    setEditVillageMsg('Updating village unit...');
    try {
      await updateVillage(editingVillage.id, {
        name: editVillageName,
        nameHindi: editVillageNameHindi,
        contactMobile: editVillageContactMobile,
        orgName: editVillageOrgName,
        orgNameHindi: editVillageOrgNameHindi,
      });
      setEditVillageMsg('✅ Village unit updated successfully!');
      setTimeout(() => {
        setEditingVillage(null);
        setEditVillageMsg('');
      }, 1000);
    } catch (err: any) {
      setEditVillageMsg(`❌ Error: ${err?.message || 'Update failed'}`);
    }
  };

  /**
   * Queues a destructive action behind the confirm dialog.
   *
   * The context's delete functions return nothing and report authorization
   * failures to the console, so the dialog closes on completion either way —
   * what it guarantees is that the click was deliberate, not that the row went.
   */
  const askToDelete = (title: string, label: string, run: () => void | Promise<unknown>) =>
    setConfirmTarget({ title, label, run });

  const runConfirmedAction = async () => {
    if (!confirmTarget) return;
    setConfirmBusy(true);
    try {
      await confirmTarget.run();
    } finally {
      setConfirmBusy(false);
      setConfirmTarget(null);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle || !compDesc || !compLocation || !compReporterName || !compReporterMobile) {
      flash('error', 'Every field except the photo is required.');
      return;
    }
    setCompMsg('Filing grievance...');
    const result = await submitComplaint({
      title: compTitle,
      category: compCategory,
      description: compDesc,
      location: compLocation,
      reporterName: compReporterName,
      reporterMobile: compReporterMobile,
      photoUrl: compPhotoUrl || undefined,
    } as any);
    if (!result?.success) {
      setCompMsg(`❌ Error: ${result?.error || 'Failed to file grievance'}`);
      return;
    }
    setCompMsg('');
    setIsComplaintFormOpen(false);
    flash('ok', 'Grievance filed.');
    setCompTitle('');
    setCompDesc('');
    setCompLocation('');
    setCompReporterName('');
    setCompReporterMobile('');
    setCompPhotoUrl('');
  };

  const handleSocialWorkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialTitle || !socialDesc || !socialDate || !socialLocation || !socialSubmitterName) {
      flash('error', 'Title, description, date, location and submitter are all required.');
      return;
    }
    setSocialMsg('Recording initiative...');
    const result = await submitSocialWork({
      title: socialTitle,
      description: socialDesc,
      date: socialDate,
      location: socialLocation,
      submitterName: socialSubmitterName,
      submitterMobile: socialSubmitterMobile,
      photoUrl: socialPhotoUrl || undefined,
    } as any);
    if (!result?.success) {
      setSocialMsg(`❌ Error: ${result?.error || 'Failed to record initiative'}`);
      return;
    }
    setSocialMsg('');
    setIsSocialFormOpen(false);
    flash('ok', 'Initiative recorded.');
    setSocialTitle('');
    setSocialDesc('');
    setSocialDate('');
    setSocialLocation('');
    setSocialSubmitterName('');
    setSocialSubmitterMobile('');
    setSocialPhotoUrl('');
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annDesc) {
      flash('error', 'A title and content are both required.');
      return;
    }
    setAnnMsg('Publishing announcement...');
    try {
      await publishAnnouncement(annTitle, annDesc);
      setAnnMsg('');
      setAnnTitle('');
      setAnnDesc('');
      setIsAnnFormOpen(false);
      flash('ok', 'Announcement published.');
    } catch (err: any) {
      setAnnMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventLocation) {
      flash('error', 'Title, date and venue are all required.');
      return;
    }
    setEventMsg('Scheduling event...');
    try {
      await createEvent({
        title: eventTitle,
        description: eventDesc,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        photoUrl: eventPhotoUrl || undefined,
        status: 'PUBLISHED',
      });
      setEventMsg('');
      setIsEventFormOpen(false);
      flash('ok', 'Event scheduled.');
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventLocation('');
      setEventPhotoUrl('');
    } catch (err: any) {
      setEventMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryCaption || !galleryUrl) {
      flash('error', 'A caption and an uploaded photo are both required.');
      return;
    }
    setGalleryMsg('Uploading media...');
    try {
      await uploadGalleryPhoto(galleryCaption, galleryUrl, 'published');
      setGalleryMsg('');
      setIsGalleryFormOpen(false);
      flash('ok', 'Media item added.');
      setGalleryCaption('');
      setGalleryUrl('');
    } catch (err: any) {
      setGalleryMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleElderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderName || !elderMobile || !elderLocation) {
      flash('error', 'Name, mobile and location are all required.');
      return;
    }
    setElderMsg('Adding senior citizen record...');
    try {
      await addElder({
        name: elderName,
        mobile: elderMobile,
        location: elderLocation,
        details: elderDetails,
        photoUrl: elderPhotoUrl || undefined,
      });
      setElderMsg('');
      setIsElderFormOpen(false);
      flash('ok', 'Elder record saved.');
      setElderName('');
      setElderMobile('');
      setElderPhotoUrl('');
      setElderLocation('');
      setElderDetails('');
    } catch (err: any) {
      setElderMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleVillageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villageName || !villageNameHindi || !villageContactMobile) {
      flash('error', 'Name, Hindi name and contact mobile are all required.');
      return;
    }
    setVillageMsg('Registering village branch...');
    try {
      await addVillage({
        name: villageName,
        nameHindi: villageNameHindi,
        slug: villageName.toLowerCase().replace(/\s+/g, '-'),
        orgName: villageOrgName || `${villageName} Youth Manch`,
        orgNameHindi: villageOrgNameHindi || `${villageNameHindi} युवा मंच`,
        contactMobile: villageContactMobile,
        isActive: true,
      });
      setVillageMsg('');
      setIsVillageFormOpen(false);
      flash('ok', 'Village unit registered.');
      setVillageName('');
      setVillageNameHindi('');
      setVillageContactMobile('');
      setVillageOrgName('');
      setVillageOrgNameHindi('');
    } catch (err: any) {
      setVillageMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg('Saving settings...');
    try {
      await updateVillageSettings({
        orgName,
        orgNameHindi,
        tagline,
        taglineHindi,
      });
      setSettingsMsg('✅ Settings saved successfully!');
      setTimeout(() => setSettingsMsg(''), 2000);
    } catch (err: any) {
      setSettingsMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleTriggerQuickAction = (tab: string) => {
    if (tab === 'members') setIsAddMemberOpen(true);
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onTriggerQuickCreateAction={handleTriggerQuickAction}
    >
      {/* One notice line for the whole panel — the result of the last action,
          reported where the eye already is rather than inside a form that has
          since been dismissed. */}
      {notice && (
        <div className="mb-6">
          <NoticeBanner notice={notice} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: EXECUTIVE DASHBOARD OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top 4 KPI Metrics Row */}
          <AdminMetricsCards />

          {/* Dedicated Member Registration & Add Trend Chart */}
          <AdminMemberTrendChart />

          {/* Interactive Activity & Community Growth Chart */}
          <AdminActivityChart />

          {/* Pending Triage Queue Table */}
          <div className={`${adminCardClass} p-6 space-y-4 transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Recent Grievances Pending Action
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Direct submissions awaiting verification and triage
                </p>
              </div>
              <button
                onClick={() => handleTabChange('problems')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all ({complaints.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#1e1f24] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Title / Issue</th>
                    <th className="pb-3 px-2">Reporter</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f24] text-slate-700 dark:text-zinc-300">
                  {complaints.slice(0, 5).map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50 dark:hover:bg-[#18181d] transition">
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {comp.title}
                      </td>
                      <td className="py-3 px-2">{comp.reporterName || 'Anonymous'}</td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        {comp.category}
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={comp.status === 'RESOLVED' ? 'emerald' : comp.status === 'NEW' ? 'warning' : 'outline'}
                          className="text-[10px]"
                        >
                          {comp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1.5">
                        <button
                          onClick={() => updateComplaintStatus(comp.id, 'RESOLVED')}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() =>
                            askToDelete('Delete grievance?', comp.title, () => deleteComplaint(comp.id))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Helpdesk Inbox Callout Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Admin Helpdesk & Citizen Inquiries
                </h4>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Citizen messages sent from the live chat Helpdesk tab appear here in real-time.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTabChange('helpdesk')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <span>Open Helpdesk Inbox</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: ADMIN HELPDESK & CITIZEN INQUIRIES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'helpdesk' && (
        <AdminHelpdeskSection />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB: USER PERMISSIONS & ACCESS CONTROL MATRIX
      ───────────────────────────────────────────────────────────── */}
      {(activeTab === 'permissions' || activeTab === 'permissions-modules' || activeTab === 'permissions-roles') && (
        <AdminPermissionsSection
          initialSubTab={
            activeTab === 'permissions-modules'
              ? 'modules'
              : activeTab === 'permissions-roles'
              ? 'roles'
              : 'workspace'
          }
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MEMBERS MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={Users}
            title="Members Directory & Access Control"
            description={`${members.length} registered members total · ${stats.pendingMembers} pending verification`}
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Member
            </Button>
          </SectionHeader>

          {/* Members Growth Trend Chart */}
          <AdminMemberTrendChart />

          {/* Search & Filters with State/Village & Date Selector */}
          <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by member name or mobile..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className={`${adminInputClass} pl-10`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={memberVillageFilter}
                onChange={(e) => setMemberVillageFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Villages</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>

              {/* Date Selector Filter for Member Registration */}
              <div className="w-40 relative">
                <DatePicker
                  value={memberDateFilter}
                  onChange={(d) => setMemberDateFilter(d)}
                  placeholder="Joined Date"
                  lang="en"
                  className="py-2 text-xs"
                />
                {memberDateFilter && (
                  <button
                    onClick={() => setMemberDateFilter('')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="Clear date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className={`${adminCardClass} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#16161a] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#222328]">
                  <tr>
                    <th className="py-3 px-4">Member Profile</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Village Chapter</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e1f24] text-slate-700 dark:text-zinc-300">
                  {filteredMembersList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-500 dark:text-zinc-400">
                        No members match these filters.
                      </td>
                    </tr>
                  )}
                  {filteredMembersList.map((mem) => {
                    const memVillage = villages.find((v) => v.id === mem.villageId);
                    return (
                      <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-[#18181d] transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white">
                              {mem.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{mem.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                ID: {mem.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">{mem.mobile}</td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={mem.role === 'SUPER_ADMIN' ? 'destructive' : mem.role === 'ADMIN' ? 'warning' : 'outline'}
                            className="text-[10px] font-bold"
                          >
                            {mem.role || 'MEMBER'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                          {memVillage?.name || 'Main Unit'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={mem.status === 'active' ? 'emerald' : 'warning'}
                            className="text-[10px]"
                          >
                            {mem.status === 'active' ? 'Active' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-zinc-500 text-[11px]">
                          {mem.createdAt?.split('T')[0] || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {mem.status === 'pending' && (
                            <button
                              onClick={() => approveMember(mem.id)}
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => setPermissionsMember(mem)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer"
                            title="Manage Permissions"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMember(mem);
                              setEditMemName(mem.name);
                              setEditMemMobile(mem.mobile);
                              setEditMemRole((mem.role as any) || 'MEMBER');
                              setEditMemStatus(mem.status || 'active');
                              setEditMemVillage(mem.villageId || villageSettings.id || '1');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              askToDelete('Remove member?', mem.name, () => deleteMember(mem.id))
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: GRIEVANCES & COMPLAINTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'problems' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={AlertTriangle}
            title="Grievance Triage & Resolution"
            description="Manage status and record resolution steps for submitted civic complaints."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsComplaintFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              File Grievance
            </Button>
          </SectionHeader>

          <EditorDialog
            isOpen={isComplaintFormOpen}
            onClose={() => setIsComplaintFormOpen(false)}
            title="File a grievance"
            description="Filed on behalf of a resident who walks in or phones."
          >
            <div className="space-y-4">
            {compMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {compMsg}
              </div>
            )}
            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Grievance title"
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  className={adminInputClass}
                />
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value as ComplaintCategory)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {COMPLAINT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                required
                rows={3}
                placeholder="What is the problem?"
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                className={adminInputClass}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Location in the village"
                  value={compLocation}
                  onChange={(e) => setCompLocation(e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="text"
                  required
                  placeholder="Reported by"
                  value={compReporterName}
                  onChange={(e) => setCompReporterName(e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="tel"
                  required
                  placeholder="Reporter mobile"
                  value={compReporterMobile}
                  onChange={(e) => setCompReporterMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <ImageUploader
                value={compPhotoUrl}
                onChange={setCompPhotoUrl}
                onRemove={() => setCompPhotoUrl('')}
                bucket="images"
                folder="complaints"
                label="Photo of the problem"
                aspectRatio="video"
                hint="Optional — drag an image here or click to choose; crop before it uploads"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsComplaintFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  File Grievance
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* Search & Filter with Date Selector */}
          <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description or reporter..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className={`${adminInputClass} pl-10`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={problemStatusFilter}
                onChange={(e) => setProblemStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New (Unassigned)</option>
                <option value="ACTION IN PROGRESS">Action In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              {/* Date Filter for Grievances */}
              <div className="w-40 relative">
                <DatePicker
                  value={problemDateFilter}
                  onChange={(d) => setProblemDateFilter(d)}
                  placeholder="Reported Date"
                  lang="en"
                  className="py-2 text-xs"
                />
                {problemDateFilter && (
                  <button
                    onClick={() => setProblemDateFilter('')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="Clear date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grievances List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblemsList.length === 0 && (
              <EmptyState message="No grievances match these filters." className="" />
            )}
            {filteredProblemsList.map((prob) => (
              <div
                key={prob.id}
                className={`${adminCardClass} p-5 space-y-4`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                      {prob.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {prob.title}
                    </h4>
                  </div>
                  <Badge
                    variant={prob.status === 'RESOLVED' ? 'emerald' : prob.status === 'ACTION IN PROGRESS' ? 'warning' : 'destructive'}
                    className="text-[10px]"
                  >
                    {prob.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {prob.description}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    Reporter: {prob.reporterName} ({prob.reporterMobile})
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={prob.status}
                      onChange={(e) => updateComplaintStatus(prob.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-lg text-[11px] font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingComplaint(prob);
                        setEditCompTitle(prob.title);
                        setEditCompCategory(prob.category);
                        setEditCompDesc(prob.description);
                        setEditCompLocation(prob.location || '');
                        setEditCompStatus(prob.status);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Grievance"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        askToDelete('Delete grievance?', prob.title, () => deleteComplaint(prob.id))
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SOCIAL WORKS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'social-work' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={HeartHandshake}
            title="Social Initiatives & Development Works"
            description="Review, approve, and showcase verified community initiatives."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsSocialFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Initiative
            </Button>
          </SectionHeader>

          <EditorDialog
            isOpen={isSocialFormOpen}
            onClose={() => setIsSocialFormOpen(false)}
            title="Record an initiative"
            description="Appears on the public social work page once approved."
          >
            <div className="space-y-4">
            {socialMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {socialMsg}
              </div>
            )}
            <form onSubmit={handleSocialWorkSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Initiative title"
                value={socialTitle}
                onChange={(e) => setSocialTitle(e.target.value)}
                className={adminInputClass}
              />
              <textarea
                required
                rows={3}
                placeholder="What was done, and by whom?"
                value={socialDesc}
                onChange={(e) => setSocialDesc(e.target.value)}
                className={adminInputClass}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                  value={socialDate}
                  onChange={(d) => setSocialDate(d)}
                  placeholder="Date of the initiative"
                  lang="en"
                  className="py-2 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Location"
                  value={socialLocation}
                  onChange={(e) => setSocialLocation(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Submitted by"
                  value={socialSubmitterName}
                  onChange={(e) => setSocialSubmitterName(e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="tel"
                  placeholder="Submitter mobile (optional)"
                  value={socialSubmitterMobile}
                  onChange={(e) => setSocialSubmitterMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <ImageUploader
                value={socialPhotoUrl}
                onChange={setSocialPhotoUrl}
                onRemove={() => setSocialPhotoUrl('')}
                bucket="images"
                folder="social-work"
                label="Photo of the initiative"
                aspectRatio="video"
                hint="Optional — drag an image here or click to choose; crop before it uploads"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSocialFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Record Initiative
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* Search & Filter Bar */}
          <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search initiatives by title or submitter..."
                value={socialSearch}
                onChange={(e) => setSocialSearch(e.target.value)}
                className={`${adminInputClass} pl-10`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={socialStatusFilter}
                onChange={(e) => setSocialStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
              </select>

              {/* Date Filter */}
              <div className="w-40 relative">
                <DatePicker
                  value={socialDateFilter}
                  onChange={(d) => setSocialDateFilter(d)}
                  placeholder="Initiative Date"
                  lang="en"
                  className="py-2 text-xs"
                />
                {socialDateFilter && (
                  <button
                    onClick={() => setSocialDateFilter('')}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    title="Clear date"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSocialList.length === 0 && (
              <EmptyState message="No initiatives match these filters." className="md:col-span-2" />
            )}
            {filteredSocialList.map((soc) => (
              <div
                key={soc.id}
                className={`${adminCardClass} p-5 space-y-4`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                      {soc.date}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {soc.title}
                    </h4>
                  </div>
                  <Badge
                    variant={soc.status === 'approved' || soc.status === 'published' ? 'emerald' : 'warning'}
                    className="text-[10px]"
                  >
                    {soc.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {soc.description}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    By: {soc.submitterName}
                  </span>
                  <div className="flex items-center gap-2">
                    {soc.status === 'pending' && (
                      <button
                        onClick={() => updateSocialWorkStatus(soc.id, 'approved')}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingSocialWork(soc);
                        setEditSocialTitle(soc.title);
                        setEditSocialDesc(soc.description);
                        setEditSocialDate(soc.date || '');
                        setEditSocialLocation(soc.location || '');
                        setEditSocialStatus(soc.status);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Initiative"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        askToDelete('Delete initiative?', soc.title, () => deleteSocialWork(soc.id))
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: ANNOUNCEMENTS & NOTICES
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={Volume2}
            title="Public Notices & Announcements"
            description="Broadcast administrative updates, government schemes, and emergency notices."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsAnnFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Announcement
            </Button>
          </SectionHeader>

          <EditorDialog
            isOpen={isAnnFormOpen}
            onClose={() => setIsAnnFormOpen(false)}
            title="Publish an announcement"
            description="Goes out on the public notices page."
          >
            <div className="space-y-4">
            {annMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {annMsg}
              </div>
            )}
            <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Announcement Title"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className={adminInputClass}
              />
              <textarea
                required
                rows={3}
                placeholder="Announcement Content / Details"
                value={annDesc}
                onChange={(e) => setAnnDesc(e.target.value)}
                className={adminInputClass}
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnnFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Publish Announcement
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* List */}
          <div className="space-y-3">
            {announcements.length === 0 && (
              <EmptyState message="No announcements published yet." className="" />
            )}
            {announcements.map((info) => (
              <div
                key={info.id}
                className={`${adminCardClass} p-4 flex items-start justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      NOTICE
                    </Badge>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {info.date || info.createdAt?.split('T')[0] || 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{info.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">{info.content}</p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Published by {info.publishedBy}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(info as any);
                      setEditAnnTitle(info.title);
                      setEditAnnContent(info.content);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      askToDelete('Delete announcement?', info.title, () =>
                        deleteAnnouncement(info.id)
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: EVENTS & CALENDAR
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={Calendar}
            title="Events & Community Calendar"
            description="Schedule and manage upcoming meetings, cleanliness drives, and village activities."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsEventFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Event
            </Button>
          </SectionHeader>

          <EditorDialog
            isOpen={isEventFormOpen}
            onClose={() => setIsEventFormOpen(false)}
            title="Schedule an event"
            description="Appears on the public events calendar."
          >
            <div className="space-y-4">
            {eventMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {eventMsg}
              </div>
            )}
            <form onSubmit={handleEventSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={adminInputClass}
                />
                <div className="w-full">
                  <DatePicker
                    value={eventDate}
                    onChange={(d) => setEventDate(d)}
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
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <input
                type="text"
                placeholder="Description / Agenda"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className={adminInputClass}
              />
              <ImageUploader
                value={eventPhotoUrl}
                onChange={setEventPhotoUrl}
                onRemove={() => setEventPhotoUrl('')}
                bucket="images"
                folder="events"
                label="Event photo"
                aspectRatio="video"
                hint="Optional — drag an image here or click to choose; crop before it uploads"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEventFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Schedule Event
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* Search & Filter Bar */}
          <div className={`${adminCardClass} p-4 flex flex-col md:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by title or venue..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className={`${adminInputClass} pl-10`}
              />
            </div>
            <div className="w-44 relative">
              <DatePicker
                value={eventDateFilter}
                onChange={(d) => setEventDateFilter(d)}
                placeholder="Filter by Date"
                lang="en"
                className="py-2 text-xs"
              />
              {eventDateFilter && (
                <button
                  onClick={() => setEventDateFilter('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Clear date"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEventsList.length === 0 && (
              <EmptyState message="No events match these filters." className="md:col-span-2" />
            )}
            {filteredEventsList.map((ev) => (
              <div
                key={ev.id}
                className={`${adminCardClass} p-5 space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ev.title || ev.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingEvent(ev);
                        setEditEventTitle(ev.title || ev.name || '');
                        setEditEventDesc(ev.description || '');
                        setEditEventDate(ev.date || '');
                        setEditEventTime(ev.time || '10:00 AM');
                        setEditEventLocation(ev.location || '');
                        setEditEventStatus(ev.status || 'PUBLISHED');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        askToDelete('Delete event?', ev.title, () => deleteEvent(ev.id))
                      }
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
                    onChange={(e) => updateEventStatus(ev.id, e.target.value as EventStatus)}
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: VILLAGE UNITS MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'villages' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={Globe}
            title="Village Units & Multi-Tenant Management"
            description="Manage village chapters, local unit assignments, and local administrators."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsVillageFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Village
            </Button>
          </SectionHeader>

          <EditorDialog
            isOpen={isVillageFormOpen}
            onClose={() => setIsVillageFormOpen(false)}
            title="Register a village unit"
            description="Creates a new chapter of the Manch."
          >
            <div className="space-y-4">
            {villageMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {villageMsg}
              </div>
            )}
            <form onSubmit={handleVillageSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Village Name (English, e.g. Jamua)"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="text"
                  required
                  placeholder="Village Name (Hindi / Local, e.g. जमुआ)"
                  value={villageNameHindi}
                  onChange={(e) => setVillageNameHindi(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Contact Mobile Number"
                  value={villageContactMobile}
                  onChange={(e) => setVillageContactMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="Organization Chapter Name (e.g. Jamua Youth Manch)"
                  value={villageOrgName}
                  onChange={(e) => setVillageOrgName(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsVillageFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Register Village Unit
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {villages.length === 0 && (
              <EmptyState message="No village units yet." className="md:col-span-3" />
            )}
            {villages.map((v) => (
              <div
                key={v.id}
                className={`${adminCardClass} p-5 space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1c1d22] flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingVillage(v);
                        setEditVillageName(v.name);
                        setEditVillageNameHindi(v.nameHindi || '');
                        setEditVillageContactMobile(v.contactMobile || '');
                        setEditVillageOrgName(v.orgName || '');
                        setEditVillageOrgNameHindi(v.orgNameHindi || '');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Village Unit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {villages.length > 1 && (
                      <button
                        onClick={() =>
                          askToDelete('Delete village?', v.name, () => deleteVillage(v.id))
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Org: {v.orgName || v.orgNameHindi}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] text-[11px] font-mono text-slate-400 dark:text-zinc-500 space-y-0.5">
                  <p>Contact: {v.contactMobile || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 8: GALLERY & MEDIA
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={ImageIcon}
            title="Media & Visual Gallery"
            description="Manage visual documentation of village initiatives, meetings, and achievements."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsGalleryFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Media
            </Button>
          </SectionHeader>

          <FilterBar>
            <SearchInput
              value={gallerySearch}
              onChange={setGallerySearch}
              placeholder="Search media by caption or uploader..."
            />
          </FilterBar>

          <EditorDialog
            isOpen={isGalleryFormOpen}
            onClose={() => setIsGalleryFormOpen(false)}
            title="Add a media item"
            description="Appears in the public gallery."
          >
            <div className="space-y-4">
            {galleryMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {galleryMsg}
              </div>
            )}
            <form onSubmit={handleGallerySubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Caption / Description"
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                className={adminInputClass}
              />
              {/* Was a box to paste a URL into, which meant the image had to be
                  hosted somewhere else first. The uploader crops, compresses and
                  stores it, and hands back the CDN URL the form submits. */}
              <ImageUploader
                value={galleryUrl}
                onChange={setGalleryUrl}
                onRemove={() => setGalleryUrl('')}
                bucket="images"
                folder="gallery"
                label="Photo"
                aspectRatio="video"
                hint="Drag an image here or click to choose — crop before it uploads"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsGalleryFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add to Gallery
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredGalleryList.length === 0 && (
              <EmptyState message="No media items match this search." className="col-span-2 sm:col-span-3 md:col-span-4" />
            )}
            {filteredGalleryList.map((item) => (
              <div
                key={item.id}
                className={`${adminCardClass} overflow-hidden group`}
              >
                <div className="h-32 bg-slate-100 dark:bg-[#18181c] relative overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={item.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.status === 'pending' && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-amber-500/90 text-white text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => approveGalleryPhoto(item.id)}
                        className="p-1.5 bg-black/70 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer"
                        title="Approve and publish"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingGallery(item);
                        setEditGalleryCaptionText(item.caption || '');
                      }}
                      className="p-1.5 bg-black/70 hover:bg-slate-900 text-white rounded-lg transition cursor-pointer"
                      title="Edit Caption"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        askToDelete('Delete media item?', item.caption || 'this image', () =>
                          deleteGalleryItem(item.id)
                        )
                      }
                      className="p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.caption || 'Untitled Media'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    By {item.uploadedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 9: ELDER CITIZENS HONORS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'elders' && (
        <div className="space-y-6 animate-fade-in">
          <SectionHeader
            icon={Award}
            title="Senior Citizens & Elder Honors"
            description="Directory honoring respected senior villagers and their lifelong community contributions."
            onRefresh={refreshData}
          >
            <Button size="sm" onClick={() => setIsElderFormOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Elder
            </Button>
          </SectionHeader>

          <FilterBar>
            <SearchInput
              value={elderSearch}
              onChange={setElderSearch}
              placeholder="Search elders by name, mobile or location..."
            />
          </FilterBar>

          <EditorDialog
            isOpen={isElderFormOpen}
            onClose={() => setIsElderFormOpen(false)}
            title="Honour an elder"
            description="Appears in the public elders directory."
          >
            <div className="space-y-4">
            {elderMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {elderMsg}
              </div>
            )}
            <form onSubmit={handleElderSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={elderName}
                  onChange={(e) => setElderName(e.target.value)}
                  className={adminInputClass}
                />
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={elderMobile}
                  onChange={(e) => setElderMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Location / Hamlet"
                  value={elderLocation}
                  onChange={(e) => setElderLocation(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <input
                type="text"
                placeholder="Contributions / Field of Service"
                value={elderDetails}
                onChange={(e) => setElderDetails(e.target.value)}
                className={adminInputClass}
              />
              <ImageUploader
                value={elderPhotoUrl}
                onChange={setElderPhotoUrl}
                onRemove={() => setElderPhotoUrl('')}
                bucket="images"
                folder="elders"
                label="Photograph"
                aspectRatio="square"
                hint="Optional — the crop step keeps the face centred"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsElderFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Record
                </Button>
              </div>
            </form>
            </div>
          </EditorDialog>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEldersList.length === 0 && (
              <EmptyState message="No elders match this search." className="md:col-span-2" />
            )}
            {filteredEldersList.map((el) => (
              <div
                key={el.id}
                className={`${adminCardClass} p-5 space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center font-bold text-amber-700 dark:text-amber-300">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{el.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingElder(el);
                        setEditElderName(el.name);
                        setEditElderMobile(el.mobile || '');
                        setEditElderLocation(el.location || '');
                        setEditElderDetails(el.details || '');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Elder Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        askToDelete('Remove honoured elder?', el.name, () => deleteElder(el.id))
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300">{el.details || 'Senior Citizen'}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  <span>📞 {el.mobile || 'N/A'}</span>
                  <span>📍 {el.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 10: EDUCATION MODULE (categories, schemes, enquiries)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'education' && <AdminEducationSection />}

      {/* ─────────────────────────────────────────────────────────────
          TAB 11: SETTINGS & DATABASE RESET
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-fade-in max-w-4xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Organization Settings & Controls
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage organization profile, branding slogans, and platform database tools
            </p>
          </div>

          <div className={`${adminCardClass} p-6 space-y-5`}>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Organization Profile
            </h4>
            {settingsMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {settingsMsg}
              </div>
            )}
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Organization Name (English)
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Organization Name (Hindi / Local)
                  </label>
                  <input
                    type="text"
                    value={orgNameHindi}
                    onChange={(e) => setOrgNameHindi(e.target.value)}
                    className={adminInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Tagline / Slogan (English)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className={adminInputClass}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
                    Tagline / Slogan (Hindi / Local)
                  </label>
                  <input
                    type="text"
                    value={taglineHindi}
                    onChange={(e) => setTaglineHindi(e.target.value)}
                    className={adminInputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Supabase Storage Integration Card */}
          <div className={`${adminCardClass} p-6 space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Supabase Storage Engine
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Direct cloud bucket storage for member profiles, chat media, and village galleries
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#059669"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-size="11" font-family="sans-serif">Supabase OK</text></svg>`;
                    const base64 = `data:image/svg+xml;base64,${btoa(testSvg)}`;
                    const res = await fetch('/api/upload/supabase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        base64,
                        bucket: 'member-photos',
                        folder: 'system_test',
                        filename: `test_${Date.now()}.svg`,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert(`✅ Supabase Storage is working!\n\nPublic URL: ${data.url}`);
                    } else {
                      alert(`Supabase Storage response: ${data.error || 'Upload completed'}`);
                    }
                  } catch (err: any) {
                    alert(`Supabase Storage test error: ${err.message}`);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow cursor-pointer self-start sm:self-auto"
              >
                Test Supabase Upload
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#18181c] rounded-xl border border-slate-200 dark:border-[#27272a] text-xs space-y-1.5 font-mono">
              <p className="text-slate-600 dark:text-slate-400 font-sans font-bold">
                Active Supabase Storage Buckets:
              </p>
              <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <p>• <code className="text-emerald-600 dark:text-emerald-400 font-bold">member-photos</code> — Citizen & leadership profile photos</p>
                <p>• <code className="text-emerald-600 dark:text-emerald-400 font-bold">images</code> — Village galleries, events, social works & chat media</p>
              </div>
            </div>
          </div>

          {/* Database Reset */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Factory Reset Database</span>
            </div>
            <p className="text-xs text-rose-600/80 dark:text-rose-300/70 leading-relaxed">
              This action will reset all local database records to default state. All transient testing data will be cleared.
            </p>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to factory reset all data to initial defaults?')) {
                  await resetDataStore();
                  alert('Database reset to defaults successfully!');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Reset Database (Factory Default)
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD NEW MEMBER
      ───────────────────────────────────────────────────────────── */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Register New Member
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Create a new member profile and assign their organizational chapter
                </p>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {newMemMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <span>{newMemMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              {/* Personal Details */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  1. Member Identity
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={newMemName}
                      onChange={(e) => setNewMemName(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit Mobile Number"
                      value={newMemMobile}
                      onChange={(e) => setNewMemMobile(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Comprehensive Address with Live Pincode Lookup */}
              <div className="p-3.5 bg-slate-50/60 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-[#27272a] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    2. Address & Location (Pincode Auto-Fill)
                  </h5>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Auto-fills District & State
                  </span>
                </div>
                <AddressFormFields
                  value={{ fullAddress: newMemAddress }}
                  selectedVillageId={newMemVillage}
                  onVillageSelect={(vId) => setNewMemVillage(vId)}
                  onChange={(d: AddressData) => {
                    setNewMemAddress(d.fullAddress || '');
                    if (d.state) setNewMemState(d.state);
                    if (d.district) setNewMemDistrict(d.district);
                    if (d.villageId) setNewMemVillage(d.villageId);
                  }}
                  lang="en"
                />
              </div>

              {/* Organization Assignment */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  3. Organization & Chapter Assignment
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Platform Role
                    </label>
                    <select
                      value={newMemRole}
                      onChange={(e) => setNewMemRole(e.target.value as any)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Assigned Chapter
                    </label>
                    <select
                      value={newMemVillage}
                      onChange={(e) => setNewMemVillage(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                    >
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                  * Note: The assigned chapter determines which village unit oversees this member and prints on their Digital ID Card.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow transition"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT MEMBER
      ───────────────────────────────────────────────────────────── */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-lg w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Member Profile
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Update personal details, role permissions, and chapter assignment
                </p>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editMemMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <span>{editMemMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
              {/* Identity */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  1. Member Identity
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editMemName}
                      onChange={(e) => setEditMemName(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editMemMobile}
                      onChange={(e) => setEditMemMobile(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address with Live Pincode Lookup */}
              <div className="p-3.5 bg-slate-50/60 dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-[#27272a] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    2. Address & Location (Pincode Auto-Fill)
                  </h5>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Auto-fills District & State
                  </span>
                </div>
                <AddressFormFields
                  value={{ fullAddress: editMemAddress }}
                  selectedVillageId={editMemVillage}
                  onVillageSelect={(vId) => setEditMemVillage(vId)}
                  onChange={(d: AddressData) => {
                    setEditMemAddress(d.fullAddress || '');
                    if (d.villageId) setEditMemVillage(d.villageId);
                  }}
                  lang="en"
                />
              </div>

              {/* Organization & Status */}
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  3. Organization & Chapter Assignment
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Role
                    </label>
                    <select
                      value={editMemRole}
                      onChange={(e) => setEditMemRole(e.target.value as any)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Status
                    </label>
                    <select
                      value={editMemStatus}
                      onChange={(e) => setEditMemStatus(e.target.value as any)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Assigned Chapter
                    </label>
                    <select
                      value={editMemVillage}
                      onChange={(e) => setEditMemVillage(e.target.value)}
                      className="w-full h-9.5 px-3 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold cursor-pointer outline-none focus:border-emerald-500"
                    >
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} {v.nameHindi ? `(${v.nameHindi})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT COMPLAINT / GRIEVANCE
      ───────────────────────────────────────────────────────────── */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Grievance
              </h3>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editCompMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editCompMsg}
              </div>
            )}
            <form onSubmit={handleUpdateComplaintSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editCompTitle}
                  onChange={(e) => setEditCompTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editCompCategory}
                    onChange={(e) => setEditCompCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
                  <select
                    value={editCompStatus}
                    onChange={(e) => setEditCompStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={editCompLocation}
                  onChange={(e) => setEditCompLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editCompDesc}
                  onChange={(e) => setEditCompDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT SOCIAL WORK
      ───────────────────────────────────────────────────────────── */}
      {editingSocialWork && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Social Work Initiative
              </h3>
              <button
                onClick={() => setEditingSocialWork(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editSocialMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editSocialMsg}
              </div>
            )}
            <form onSubmit={handleUpdateSocialWorkSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editSocialTitle}
                  onChange={(e) => setEditSocialTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={editSocialDate}
                    onChange={(e) => setEditSocialDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
                  <select
                    value={editSocialStatus}
                    onChange={(e) => setEditSocialStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Location</label>
                <input
                  type="text"
                  value={editSocialLocation}
                  onChange={(e) => setEditSocialLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editSocialDesc}
                  onChange={(e) => setEditSocialDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSocialWork(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT ANNOUNCEMENT
      ───────────────────────────────────────────────────────────── */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Announcement
              </h3>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editAnnMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editAnnMsg}
              </div>
            )}
            <form onSubmit={handleUpdateAnnouncementSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Title / Headline</label>
                <input
                  type="text"
                  required
                  value={editAnnTitle}
                  onChange={(e) => setEditAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Content / Message</label>
                <textarea
                  rows={4}
                  required
                  value={editAnnContent}
                  onChange={(e) => setEditAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT EVENT
      ───────────────────────────────────────────────────────────── */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Event
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editEventMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editEventMsg}
              </div>
            )}
            <form onSubmit={handleUpdateEventSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editEventTitle}
                  onChange={(e) => setEditEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Time</label>
                  <input
                    type="text"
                    value={editEventTime}
                    onChange={(e) => setEditEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editEventLocation}
                    onChange={(e) => setEditEventLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Status</label>
                  <select
                    value={editEventStatus}
                    onChange={(e) => setEditEventStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editEventDesc}
                  onChange={(e) => setEditEventDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT GALLERY
      ───────────────────────────────────────────────────────────── */}
      {editingGallery && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Gallery Photo Caption
              </h3>
              <button
                onClick={() => setEditingGallery(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editGalleryMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editGalleryMsg}
              </div>
            )}
            <form onSubmit={handleUpdateGallerySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Caption / Description</label>
                <input
                  type="text"
                  required
                  value={editGalleryCaptionText}
                  onChange={(e) => setEditGalleryCaptionText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGallery(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT ELDER
      ───────────────────────────────────────────────────────────── */}
      {editingElder && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Senior Citizen Record
              </h3>
              <button
                onClick={() => setEditingElder(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editElderMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editElderMsg}
              </div>
            )}
            <form onSubmit={handleUpdateElderSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editElderName}
                  onChange={(e) => setEditElderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editElderMobile}
                    onChange={(e) => setEditElderMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Location</label>
                  <input
                    type="text"
                    value={editElderLocation}
                    onChange={(e) => setEditElderLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Details / Contributions</label>
                <textarea
                  rows={3}
                  value={editElderDetails}
                  onChange={(e) => setEditElderDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingElder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT VILLAGE UNIT
      ───────────────────────────────────────────────────────────── */}
      {editingVillage && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Village Chapter Unit
              </h3>
              <button
                onClick={() => setEditingVillage(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editVillageMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editVillageMsg}
              </div>
            )}
            <form onSubmit={handleUpdateVillageSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editVillageName}
                    onChange={(e) => setEditVillageName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Name (Hindi)</label>
                  <input
                    type="text"
                    required
                    value={editVillageNameHindi}
                    onChange={(e) => setEditVillageNameHindi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Contact Mobile</label>
                <input
                  type="tel"
                  required
                  value={editVillageContactMobile}
                  onChange={(e) => setEditVillageContactMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">Chapter Organization Name</label>
                <input
                  type="text"
                  value={editVillageOrgName}
                  onChange={(e) => setEditVillageOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVillage(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Member Permissions Manager Modal */}
      <MemberPermissionsModal
        isOpen={Boolean(permissionsMember)}
        member={permissionsMember}
        onClose={() => setPermissionsMember(null)}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* One confirmation for every destructive action in the panel. */}
      <ConfirmDialog
        target={confirmTarget}
        busy={confirmBusy}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={runConfirmedAction}
      />
    </AdminLayout>
  );
};
export default AdminPanel;
