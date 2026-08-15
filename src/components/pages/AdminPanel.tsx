'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  AdminLayout,
  AdminMetricsCards,
  AdminActivityChart,
  AdminMemberTrendChart,
  AdminLocationSelector,
  STATE_DISTRICT_MAP,
} from '../admin';
import {
  Shield,
  Users,
  AlertTriangle,
  HeartHandshake,
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
import { DatePicker } from '../ui/DatePicker';
import { Member, Complaint, SocialWork, EventItem, GalleryItem, Elder, Village, Announcement } from '../../types';


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
      const segment = pathname
        .replace('/super-admin', '')
        .replace('/admin', '')
        .replace(/^\//, '');
      if (segment) return segment;
    }
    return initialTab || 'dashboard';
  }, [pathname, initialTab]);

  const [activeTab, setActiveTab] = useState<string>(derivedTab);

  useEffect(() => {
    setActiveTab(derivedTab);
  }, [derivedTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const targetUrl = newTab === 'dashboard' ? '/super-admin' : `/super-admin/${newTab}`;
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
    villageSettings,
    stats,
    isSuperAdmin,
    authSession,
    setIsAdminLoginModalOpen,
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

  // Modals & Creation States with State, District, Village selectors
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemMobile, setNewMemMobile] = useState('');
  const [newMemRole, setNewMemRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [newMemState, setNewMemState] = useState('Uttar Pradesh');
  const [newMemDistrict, setNewMemDistrict] = useState('Jaunpur');
  const [newMemVillage, setNewMemVillage] = useState(villageSettings.id || '1');
  const [newMemMsg, setNewMemMsg] = useState('');

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editMemName, setEditMemName] = useState('');
  const [editMemMobile, setEditMemMobile] = useState('');
  const [editMemRole, setEditMemRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [editMemStatus, setEditMemStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [editMemVillage, setEditMemVillage] = useState(villageSettings.id || '1');
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
            onClick={() => setIsAdminLoginModalOpen(true)}
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

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annDesc) return;
    setAnnMsg('Publishing announcement...');
    try {
      await publishAnnouncement(annTitle, annDesc);
      setAnnMsg('✅ Announcement published successfully!');
      setAnnTitle('');
      setAnnDesc('');
      setTimeout(() => setAnnMsg(''), 2000);
    } catch (err: any) {
      setAnnMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventLocation) return;
    setEventMsg('Scheduling event...');
    try {
      await createEvent({
        title: eventTitle,
        description: eventDesc,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        status: 'PUBLISHED',
      });
      setEventMsg('✅ Event scheduled successfully!');
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventLocation('');
      setTimeout(() => setEventMsg(''), 2000);
    } catch (err: any) {
      setEventMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryCaption || !galleryUrl) return;
    setGalleryMsg('Uploading media...');
    try {
      await uploadGalleryPhoto(galleryCaption, galleryUrl, 'published');
      setGalleryMsg('✅ Media item added successfully!');
      setGalleryCaption('');
      setGalleryUrl('');
      setTimeout(() => setGalleryMsg(''), 2000);
    } catch (err: any) {
      setGalleryMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleElderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderName || !elderMobile || !elderLocation) return;
    setElderMsg('Adding senior citizen record...');
    try {
      await addElder({
        name: elderName,
        mobile: elderMobile,
        location: elderLocation,
        details: elderDetails,
      });
      setElderMsg('✅ Senior citizen recorded successfully!');
      setElderName('');
      setElderMobile('');
      setElderLocation('');
      setElderDetails('');
      setTimeout(() => setElderMsg(''), 2000);
    } catch (err: any) {
      setElderMsg(`❌ Error: ${err?.message || 'Failed'}`);
    }
  };

  const handleVillageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villageName || !villageNameHindi || !villageContactMobile) return;
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
      setVillageMsg('✅ Village unit registered successfully!');
      setVillageName('');
      setVillageNameHindi('');
      setVillageContactMobile('');
      setVillageOrgName('');
      setVillageOrgNameHindi('');
      setTimeout(() => setVillageMsg(''), 2000);
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
      {/* ─────────────────────────────────────────────────────────────
          TAB 1: EXECUTIVE DASHBOARD OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top 4 KPI Metrics Row */}
          <AdminMetricsCards />

          {/* State, District & Village Scope Switcher */}
          <AdminLocationSelector />

          {/* Dedicated Member Registration & Add Trend Chart */}
          <AdminMemberTrendChart />

          {/* Interactive Activity & Community Growth Chart */}
          <AdminActivityChart />

          {/* Pending Triage Queue Table */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-6 space-y-4 shadow-xs transition-colors">
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
                          onClick={() => deleteComplaint(comp.id)}
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MEMBERS MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Members Directory & Access Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {members.length} registered members total | {stats.pendingMembers} pending verification
              </p>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>
          </div>

          {/* Members Growth Trend Chart */}
          <AdminMemberTrendChart />

          {/* Search & Filters with State/Village & Date Selector */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by member name or mobile..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl overflow-hidden shadow-xs">
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
                            onClick={() => deleteMember(mem.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Grievance Triage & Resolution
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage status and record resolution steps for submitted civic complaints
            </p>
          </div>

          {/* Search & Filter with Date Selector */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description or reporter..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
            {filteredProblemsList.map((prob) => (
              <div
                key={prob.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase">
                      {prob.category} • ID #{prob.id}
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
                      onClick={() => deleteComplaint(prob.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Social Initiatives & Development Works
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Review, approve, and showcase verified community initiatives
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search initiatives by title or submitter..."
                value={socialSearch}
                onChange={(e) => setSocialSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
            {filteredSocialList.map((soc) => (
              <div
                key={soc.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs"
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
                      onClick={() => deleteSocialWork(soc.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Public Notices & Announcements
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Broadcast administrative updates, government schemes, and emergency notices
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              + Publish New Announcement
            </h4>
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
              <textarea
                required
                rows={3}
                placeholder="Announcement Content / Details"
                value={annDesc}
                onChange={(e) => setAnnDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Publish Announcement
              </button>
            </form>
          </div>

          {/* List */}
          <div className="space-y-3">
            {publicInfos.map((info) => (
              <div
                key={info.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 flex items-start justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      NOTICE
                    </Badge>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {info.createdAt?.split('T')[0] || 'N/A'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {info.name} ({info.mobile})
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">{info.information}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAnnouncement(info as any);
                      setEditAnnTitle(info.name || 'Notice');
                      setEditAnnContent(info.information || '');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    title="Edit Announcement"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(info.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Events & Community Calendar
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Schedule and manage upcoming meetings, cleanliness drives, and village activities
            </p>
          </div>

          {/* Form with DatePicker */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              + Schedule New Event
            </h4>
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Description / Agenda"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Schedule Event
              </button>
            </form>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by title or venue..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
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
            {filteredEventsList.map((ev) => (
              <div
                key={ev.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs"
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
                      onClick={() => deleteEvent(ev.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300">{ev.description}</p>
                <div className="pt-2 border-t border-slate-100 dark:border-[#1e1f24] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  <span>📅 {ev.date}</span>
                  <span>📍 {ev.location}</span>
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Village Units & Multi-Tenant Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage village chapters, local unit assignments, and local administrators
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              + Register New Village Unit
            </h4>
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Village Name (Hindi / Local, e.g. जमुआ)"
                  value={villageNameHindi}
                  onChange={(e) => setVillageNameHindi(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Register Village Unit
              </button>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {villages.map((v) => (
              <div
                key={v.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs"
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
                        onClick={() => deleteVillage(v.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Media & Visual Gallery
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage visual documentation of village initiatives, meetings, and achievements
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              + Add Media Item
            </h4>
            {galleryMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl">
                {galleryMsg}
              </div>
            )}
            <form onSubmit={handleGallerySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Caption / Description"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
                <input
                  type="url"
                  required
                  placeholder="Image URL (https://...)"
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Add to Gallery
              </button>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl overflow-hidden shadow-xs group"
              >
                <div className="h-32 bg-slate-100 dark:bg-[#18181c] relative overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={item.caption || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
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
                      onClick={() => deleteGalleryItem(item.id)}
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
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Senior Citizens & Elder Honors
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Directory honoring respected senior villagers and their lifelong community contributions
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              + Add Senior Citizen Record
            </h4>
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Contributions / Field of Service"
                value={elderDetails}
                onChange={(e) => setElderDetails(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold text-xs rounded-xl shadow cursor-pointer"
              >
                Save Record
              </button>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {elders.map((el) => (
              <div
                key={el.id}
                className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-5 space-y-3 shadow-xs"
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
                      onClick={() => deleteElder(el.id)}
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
          TAB 10: SETTINGS & DATABASE RESET
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

          <div className="bg-white dark:bg-[#121215] border border-slate-200 dark:border-[#222328] rounded-2xl p-6 space-y-5 shadow-xs">
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
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
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
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Register New Member
              </h3>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {newMemMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {newMemMsg}
              </div>
            )}
            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newMemName}
                onChange={(e) => setNewMemName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                required
                placeholder="10-digit Mobile Number"
                value={newMemMobile}
                onChange={(e) => setNewMemMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />

              {/* State, District & Village Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-0.5">
                    State
                  </label>
                  <select
                    value={newMemState}
                    onChange={(e) => {
                      setNewMemState(e.target.value);
                      const dists = STATE_DISTRICT_MAP[e.target.value] || [];
                      if (dists[0]) setNewMemDistrict(dists[0]);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {Object.keys(STATE_DISTRICT_MAP).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-0.5">
                    District
                  </label>
                  <select
                    value={newMemDistrict}
                    onChange={(e) => setNewMemDistrict(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {(STATE_DISTRICT_MAP[newMemState] || []).map((dst) => (
                      <option key={dst} value={dst}>
                        {dst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-0.5">
                    Role
                  </label>
                  <select
                    value={newMemRole}
                    onChange={(e) => setNewMemRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block mb-0.5">
                    Village Unit
                  </label>
                  <select
                    value={newMemVillage}
                    onChange={(e) => setNewMemVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.nameHindi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold text-xs rounded-xl cursor-pointer shadow"
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
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Member Profile
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            {editMemMsg && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg">
                {editMemMsg}
              </div>
            )}
            <form onSubmit={handleUpdateMemberSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={editMemName}
                onChange={(e) => setEditMemName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                required
                value={editMemMobile}
                onChange={(e) => setEditMemMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editMemRole}
                  onChange={(e) => setEditMemRole(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <select
                  value={editMemStatus}
                  onChange={(e) => setEditMemStatus(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="w-full">
                <select
                  value={editMemVillage}
                  onChange={(e) => setEditMemVillage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-[#27272a] rounded-xl text-xs text-slate-900 dark:text-white font-bold"
                >
                  {villages.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.nameHindi})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
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
          MODAL: EDIT COMPLAINT / GRIEVANCE
      ───────────────────────────────────────────────────────────── */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272a] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Grievance #{editingComplaint.id}
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
                Edit Event #{editingEvent.id}
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
    </AdminLayout>
  );
};
export default AdminPanel;
