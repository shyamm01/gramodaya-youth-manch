'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintStatus, EventStatus, Member, Complaint, SocialWork, EventItem, Elder, VillageSettings } from '../../types';
import { SupabaseSetupScreen } from '../features/SupabaseSetupScreen';
import {
  Shield,
  Users,
  AlertTriangle,
  HeartHandshake,
  Volume2,
  Calendar,
  Image as ImageIcon,
  LogOut,
  Camera,
  UserCheck,
  PhoneCall,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Key,
  FileText,
  Activity,
  Database,
  RefreshCw,
  Lock,
  Edit3,
  Search,
  Filter,
  Server,
  Check,
  Award,
  TrendingUp,
  LayoutDashboard,
  Eye,
  Clock,
  Sparkles,
  ChevronRight,
  HelpCircle,
  X,
  Share2,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    villageSettings,
    villages,
    activeVillageId,
    setActiveVillageId,
    addVillage,
    updateVillage,
    deleteVillage,
    isSuperAdmin,
    canManageVillage,
    changeMemberRole,
    authSession,
    adminLogout,
    admins,
    members,
    addMember,
    approveMember,
    updateMember,
    deleteMember,
    complaints,
    submitComplaint,
    updateComplaintStatus,
    deleteComplaint,
    socialWorks,
    submitSocialWork,
    updateSocialWorkStatus,
    deleteSocialWork,
    publicInfos,
    updatePublicInfoStatus,
    deletePublicInfo,
    announcements,
    publishAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    events,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    gallery,
    uploadGalleryPhoto,
    approveGalleryPhoto,
    editGalleryCaption,
    deleteGalleryItem,
    elders,
    addElder,
    editElder,
    deleteElder,
    auditLogs,
    integrations,
    saveIntegrationConfig,
    testIntegration,
    disconnectIntegration,
    exportDataJson,
    importDataJson,
    resetDataStore,
    stats,
    uploadPhoto,
    setAdminPassword,
    setIsAdminLoginModalOpen,
    setSelectedIdCardMember,
  } = useApp();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'members'
    | 'problems'
    | 'social-work'
    | 'public-info'
    | 'announcements'
    | 'events'
    | 'gallery'
    | 'elders'
    | 'villages'
    | 'helpline'
    | 'security'
    | 'supabase-setup'
    | 'api-integrations'
    | 'settings'
  >('dashboard');

  // ── JSON & Database Reset State ──
  const [dataJsonMsg, setDataJsonMsg] = useState('');
  const [resetDataConfirmOpen, setResetDataConfirmOpen] = useState(false);

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setDataJsonMsg('डेटा प्रोसेसिंग हो रहा है...');
        const res = await importDataJson(json);
        if (res.success) {
          setDataJsonMsg('डेटा सफलता पूर्वक रिस्टोर/अपडेट किया गया!');
        } else {
          setDataJsonMsg(`त्रुटि: ${res.error}`);
        }
      } catch (err) {
        setDataJsonMsg('अमान्य JSON फ़ाइल प्रारूप।');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    setDataJsonMsg('डेटा रीसेट किया जा रहा है...');
    const res = await resetDataStore();
    setResetDataConfirmOpen(false);
    if (res.success) {
      setDataJsonMsg('डेटा बेस डिफ़ॉल्ट स्थिति में रीसेट कर दिया गया है।');
    } else {
      setDataJsonMsg(`त्रुटि: ${res.error}`);
    }
  };

  // ── Member CRUD State ──
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'ALL' | 'active' | 'pending'>('ALL');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'ALL' | 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('ALL');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemMobile, setNewMemMobile] = useState('');
  const [newMemPhoto, setNewMemPhoto] = useState('');
  const [newMemOrg, setNewMemOrg] = useState('ग्रामोदय यूथ मंच');
  const [newMemDate, setNewMemDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [memMsg, setMemMsg] = useState('');
  const [deleteConfirmMemberId, setDeleteConfirmMemberId] = useState<string | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editMemName, setEditMemName] = useState('');
  const [editMemMobile, setEditMemMobile] = useState('');
  const [editMemRole, setEditMemRole] = useState<'MEMBER' | 'ADMIN' | 'SUPER_ADMIN'>('MEMBER');
  const [editMemStatus, setEditMemStatus] = useState<'active' | 'pending' | 'suspended'>('active');
  const [editMemVillageId, setEditMemVillageId] = useState('');
  const [editMemFatherName, setEditMemFatherName] = useState('');
  const [editMemDob, setEditMemDob] = useState('');
  const [editMemAddress, setEditMemAddress] = useState('');
  const [editMemOrg, setEditMemOrg] = useState('');
  const [editMemMsg, setEditMemMsg] = useState('');

  const openEditMemberModal = (m: Member) => {
    setEditingMember(m);
    setEditMemName(m.name);
    setEditMemMobile(m.mobile);
    setEditMemRole(m.role || 'MEMBER');
    setEditMemStatus(m.status || 'active');
    setEditMemVillageId(m.villageId || activeVillageId);
    setEditMemFatherName(m.fatherName || '');
    setEditMemDob(m.dob || '');
    setEditMemAddress(m.address || '');
    setEditMemOrg(m.organizationName || villageSettings.orgNameHindi);
    setEditMemMsg('');
  };

  const handleUpdateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditMemMsg('अपडेट किया जा रहा है...');
    const res = await updateMember(editingMember.id, {
      name: editMemName.trim(),
      mobile: editMemMobile.trim(),
      role: editMemRole,
      status: editMemStatus,
      villageId: editMemVillageId,
      fatherName: editMemFatherName.trim(),
      dob: editMemDob.trim(),
      address: editMemAddress.trim(),
      organizationName: editMemOrg.trim(),
    });
    if (res.success) {
      setEditMemMsg('सदस्य विवरण सफलतापूर्वक अपडेट हो गया!');
      setTimeout(() => {
        setEditingMember(null);
        setEditMemMsg('');
      }, 1000);
    } else {
      setEditMemMsg(res.error || 'अपडेट करने में विफल।');
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemMobile) return;
    const res = await addMember(
      newMemName,
      newMemMobile,
      newMemPhoto,
      newMemDate,
      newMemOrg.trim() || 'ग्रामोदय यूथ मंच'
    );
    if (res.success) {
      setMemMsg('नया सदस्य सफलतापूर्वक जोड़ा गया।');
      setNewMemName('');
      setNewMemMobile('');
      setNewMemPhoto('');
      setNewMemOrg('ग्रामोदय यूथ मंच');
      setNewMemDate(new Date().toISOString().split('T')[0]);
      setTimeout(() => {
        setIsAddMemberOpen(false);
        setMemMsg('');
      }, 1500);
    } else {
      setMemMsg(res.error || 'त्रुटि हुई।');
    }
  };

  const handleDeleteMemberConfirmed = async () => {
    if (deleteConfirmMemberId) {
      await deleteMember(deleteConfirmMemberId);
      setDeleteConfirmMemberId(null);
    }
  };

  // ── Grievances / Problems CRUD State ──
  const [problemStatusFilter, setProblemStatusFilter] = useState<string>('ALL');
  const [problemSearch, setProblemSearch] = useState('');
  const [isAddProblemOpen, setIsAddProblemOpen] = useState(false);
  const [newProbTitle, setNewProbTitle] = useState('');
  const [newProbDesc, setNewProbDesc] = useState('');
  const [newProbLocation, setNewProbLocation] = useState('रसूलपुर');
  const [newProbReporter, setNewProbReporter] = useState('');
  const [newProbPhone, setNewProbPhone] = useState('');
  const [probMsg, setProbMsg] = useState('');

  // Edit Problem State
  const [editingProblem, setEditingProblem] = useState<Complaint | null>(null);
  const [editProbTitle, setEditProbTitle] = useState('');
  const [editProbDesc, setEditProbDesc] = useState('');
  const [editProbLocation, setEditProbLocation] = useState('');
  const [editProbStatus, setEditProbStatus] = useState<ComplaintStatus>('NEW');

  const openEditProblemModal = (p: Complaint) => {
    setEditingProblem(p);
    setEditProbTitle(p.title);
    setEditProbDesc(p.description);
    setEditProbLocation(p.location);
    setEditProbStatus(p.status);
  };

  const handleAddProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbTitle || !newProbDesc) return;
    setProbMsg('समस्या दर्ज की जा रही है...');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProbTitle.trim(),
          description: newProbDesc.trim(),
          location: newProbLocation.trim(),
          reporterName: newProbReporter.trim() || authSession.adminName || 'ग्रामवासी',
          reporterMobile: newProbPhone.trim() || authSession.adminMobile || '',
          villageId: activeVillageId,
        }),
      });
      if (res.ok) {
        setProbMsg('समस्या सफलतापूर्वक दर्ज की गई!');
        setNewProbTitle('');
        setNewProbDesc('');
        setNewProbReporter('');
        setNewProbPhone('');
        setTimeout(() => {
          setIsAddProblemOpen(false);
          setProbMsg('');
        }, 1200);
      } else {
        setProbMsg('त्रुटि हुई।');
      }
    } catch (err: any) {
      setProbMsg(err.message || 'त्रुटि हुई।');
    }
  };

  const handleUpdateProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    try {
      await fetch(`/api/complaints/${editingProblem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editProbTitle.trim(),
          description: editProbDesc.trim(),
          location: editProbLocation.trim(),
          status: editProbStatus,
          updaterName: authSession.adminName,
          updaterMobile: authSession.adminMobile,
        }),
      });
      setEditingProblem(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Social Work CRUD State ──
  const [socialStatusFilter, setSocialStatusFilter] = useState<string>('ALL');
  const [socialSearch, setSocialSearch] = useState('');
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);
  const [newSocTitle, setNewSocTitle] = useState('');
  const [newSocDesc, setNewSocDesc] = useState('');
  const [newSocLoc, setNewSocLoc] = useState('रसूलपुर');
  const [newSocSubmitter, setNewSocSubmitter] = useState('');
  const [editingSocial, setEditingSocial] = useState<SocialWork | null>(null);
  const [editSocTitle, setEditSocTitle] = useState('');
  const [editSocDesc, setEditSocDesc] = useState('');
  const [editSocLoc, setEditSocLoc] = useState('');

  const handleAddSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocTitle || !newSocDesc) return;
    await submitSocialWork({
      title: newSocTitle.trim(),
      description: newSocDesc.trim(),
      location: newSocLoc.trim(),
      date: new Date().toISOString().split('T')[0],
      submitterName: newSocSubmitter.trim() || authSession.adminName || 'ग्रामवासी',
      submitterMobile: authSession.adminMobile || '',
    });
    setNewSocTitle('');
    setNewSocDesc('');
    setNewSocSubmitter('');
    setIsAddSocialOpen(false);
  };

  const openEditSocialModal = (s: SocialWork) => {
    setEditingSocial(s);
    setEditSocTitle(s.title);
    setEditSocDesc(s.description);
    setEditSocLoc(s.location);
  };

  const handleUpdateSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial) return;
    try {
      await fetch(`/api/social-work/${editingSocial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editSocTitle.trim(),
          description: editSocDesc.trim(),
          location: editSocLoc.trim(),
        }),
      });
      setEditingSocial(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Public Info Filter ──
  const [infoStatusFilter, setInfoStatusFilter] = useState<string>('ALL');
  const [infoSearch, setInfoSearch] = useState('');

  // ── Announcements CRUD State ──
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<{ id: string; title: string; content: string } | null>(null);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    await publishAnnouncement(newAnnTitle, newAnnContent);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleUpdateAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    await updateAnnouncement(editingAnnouncement.id, editingAnnouncement.title, editingAnnouncement.content);
    setEditingAnnouncement(null);
  };

  // ── Events CRUD State ──
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('ALL');
  const [eventSearch, setEventSearch] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    await createEvent({
      title: newEventTitle,
      name: newEventTitle,
      date: newEventDate,
      time: newEventTime || '10:00 AM',
      location: newEventLoc || 'Rasoolpur Village',
      description: newEventDesc,
      status: 'PUBLISHED',
    });
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setNewEventLoc('');
    setNewEventDesc('');
  };

  const openEditEventModal = (e: EventItem) => {
    setEditingEvent(e);
  };

  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    await updateEvent(editingEvent.id, {
      title: editingEvent.title || editingEvent.name,
      name: editingEvent.title || editingEvent.name,
      date: editingEvent.date,
      time: editingEvent.time,
      location: editingEvent.location,
      description: editingEvent.description,
      status: editingEvent.status,
    });
    setEditingEvent(null);
  };

  // ── Gallery CRUD State ──
  const [galleryStatusFilter, setGalleryStatusFilter] = useState<string>('ALL');
  const [gallerySearch, setGallerySearch] = useState('');
  const [editingGalleryItem, setEditingGalleryItem] = useState<{ id: string; caption: string } | null>(null);

  // ── Elders CRUD State ──
  const [elderSearch, setElderSearch] = useState('');
  const [elderName, setElderName] = useState('');
  const [elderMobile, setElderMobile] = useState('');
  const [elderLocation, setElderLocation] = useState('रसूलपुर');
  const [elderDetails, setElderDetails] = useState('');
  const [editingElder, setEditingElder] = useState<Elder | null>(null);

  const handleAddElderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elderName) return;
    await addElder({
      name: elderName,
      mobile: elderMobile,
      location: elderLocation,
      details: elderDetails,
    });
    setElderName('');
    setElderMobile('');
    setElderDetails('');
  };

  const openEditElderModal = (el: Elder) => {
    setEditingElder(el);
  };

  const handleUpdateElderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElder) return;
    await editElder(editingElder.id, {
      name: editingElder.name,
      mobile: editingElder.mobile,
      location: editingElder.location,
      details: editingElder.details,
    });
    setEditingElder(null);
  };

  // ── Village Management State ──
  const [isAddVillageOpen, setIsAddVillageOpen] = useState(false);
  const [newVilName, setNewVilName] = useState('');
  const [newVilNameHindi, setNewVilNameHindi] = useState('');
  const [newVilGramPanchayat, setNewVilGramPanchayat] = useState('');
  const [newVilDistrict, setNewVilDistrict] = useState('Jaunpur');
  const [newVilTagline, setNewVilTagline] = useState('');
  const [vilMsg, setVilMsg] = useState('');
  const [deleteConfirmVillageId, setDeleteConfirmVillageId] = useState<string | null>(null);

  const handleAddVillageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVilName || !newVilNameHindi) return;
    setVilMsg('ग्राम इकाई जोड़ी जा रही है...');
    const res = await addVillage({
      name: newVilName.trim(),
      nameHindi: newVilNameHindi.trim(),
      gramPanchayatName: newVilGramPanchayat.trim(),
      gramPanchayatNameHindi: newVilGramPanchayat.trim(),
      districtName: newVilDistrict.trim(),
      taglineHindi: newVilTagline.trim() || 'युवा शक्ति से ग्रामोदय की ओर',
    });
    if (res.success) {
      setVilMsg('नयी ग्राम इकाई सफलतापूर्वक पंजीकृत की गई!');
      setNewVilName('');
      setNewVilNameHindi('');
      setNewVilGramPanchayat('');
      setNewVilTagline('');
      setTimeout(() => {
        setIsAddVillageOpen(false);
        setVilMsg('');
      }, 1500);
    } else {
      setVilMsg(res.error || 'त्रुटि हुई।');
    }
  };

  const handleDeleteVillageConfirmed = async () => {
    if (deleteConfirmVillageId) {
      await deleteVillage(deleteConfirmVillageId);
      setDeleteConfirmVillageId(null);
    }
  };

  // ── Integrations Modal State ──
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const [configApiKey, setConfigApiKey] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);
  const [disconnectConfirmId, setDisconnectConfirmId] = useState<string | null>(null);

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntegration) return;
    const res = await saveIntegrationConfig(selectedIntegration.id, configApiKey);
    if (res.success) {
      setIsConfigModalOpen(false);
      setConfigApiKey('');
      setSelectedIntegration(null);
    }
  };

  const handleTestIntegration = async (id: string) => {
    setTestResultMsg(null);
    const res = await testIntegration(id);
    setTestResultMsg({
      id,
      msg: res.message || (res.success ? 'सफलतापूर्वक कनेक्टेड' : 'कनेक्शन विफल'),
      type: res.success ? 'success' : 'error',
    });
  };

  const handleDisconnectConfirmed = async () => {
    if (disconnectConfirmId) {
      await disconnectIntegration(disconnectConfirmId);
      setDisconnectConfirmId(null);
    }
  };

  // ── Password Change State ──
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword !== confirmAdminPassword) {
      setPwdMsg('पासवर्ड मैच नहीं कर रहे हैं।');
      return;
    }
    if (newAdminPassword.length < 6) {
      setPwdMsg('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    const res = await setAdminPassword(authSession.adminMobile!, '', newAdminPassword);
    if (res.success) {
      setPwdMsg('पासवर्ड सफलतापूर्वक अपडेट हो गया।');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } else {
      setPwdMsg(res.error || 'पासवर्ड अपडेट करने में विफल।');
    }
  };

  const handleAdminPhotoUpload = (adminId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          uploadPhoto('admin', adminId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered lists
  const filteredMembersList = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.mobile.includes(memberSearch);
    const matchesStatus = memberStatusFilter === 'ALL' || m.status === memberStatusFilter;
    const matchesRole = memberRoleFilter === 'ALL' || (m.role || 'MEMBER') === memberRoleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredProblemsList = complaints.filter((c) => {
    const matchesStatus = problemStatusFilter === 'ALL' || c.status === problemStatusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(problemSearch.toLowerCase()) ||
      c.reporterName.toLowerCase().includes(problemSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredSocialList = socialWorks.filter((s) => {
    const matchesStatus = socialStatusFilter === 'ALL' || s.status === socialStatusFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(socialSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(socialSearch.toLowerCase()) ||
      (s.submitterName || '').toLowerCase().includes(socialSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredInfoList = publicInfos.filter((p) => {
    const matchesStatus = infoStatusFilter === 'ALL' || p.status === infoStatusFilter;
    const matchesSearch =
      (p.information || '').toLowerCase().includes(infoSearch.toLowerCase()) ||
      (p.name || '').toLowerCase().includes(infoSearch.toLowerCase()) ||
      (p.mobile || '').includes(infoSearch);
    return matchesStatus && matchesSearch;
  });

  const filteredEventsList = events.filter((e) => {
    const matchesStatus = eventStatusFilter === 'ALL' || e.status === eventStatusFilter;
    const matchesSearch =
      (e.title || e.name || '').toLowerCase().includes(eventSearch.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(eventSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredGalleryList = gallery.filter((g) => {
    const matchesStatus = galleryStatusFilter === 'ALL' || g.status === galleryStatusFilter;
    const matchesSearch =
      g.caption.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      g.uploadedBy.toLowerCase().includes(gallerySearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredEldersList = elders.filter(
    (e) =>
      e.name.toLowerCase().includes(elderSearch.toLowerCase()) ||
      e.mobile.includes(elderSearch) ||
      e.location.toLowerCase().includes(elderSearch.toLowerCase())
  );

  // Authentication check
  if (!authSession || !authSession.isAdminLoggedIn) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            अनाधिकृत पहुंच (Unauthorized Access)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            यह स्थान केवल अधिकृत ग्रामोदय यूथ मंच एडमिन के लिए सुरक्षित है। एडमिन पैनल तक पहुँचने के लिए कृपया सुरक्षित एडमिन लॉगिन करें।
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs rounded-2xl transition shadow-md cursor-pointer inline-flex items-center gap-2 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>🔐 अधिकृत एडमिन लॉगिन (Admin Login)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grievance resolution calculation
  const totalComplaintsCount = complaints.length || 1;
  const resolvedPct = Math.round(((complaints.filter((c) => c.status === 'RESOLVED').length) / totalComplaintsCount) * 100);

  return (
    <div className="py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      {/* ── Top Executive Hero Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 border border-slate-750/80 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-700/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                  isSuperAdmin
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white ring-1 ring-amber-400/40'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {isSuperAdmin
                    ? '🌐 Global Super Admin (मुख्य प्रशासक — पूर्ण अधिकार)'
                    : `🏡 Village Admin (${villageSettings.nameHindi})`}
                </span>
              </div>

              {isSuperAdmin && villages.length > 1 && (
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-xl border border-white/20 text-xs">
                  <span className="text-amber-300 font-bold">ग्राम चुनें:</span>
                  <select
                    value={activeVillageId}
                    onChange={(e) => setActiveVillageId(e.target.value)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                        {v.nameHindi} ({v.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              <span>{villageSettings.orgName} — {villageSettings.nameHindi}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap font-medium">
              <span>ग्राम पंचायत: <strong>{villageSettings.gramPanchayatHindi}</strong></span>
              <span>•</span>
              <span>कार्यकारी एडमिन: <strong>{authSession.adminName || 'Admin'}</strong> ({authSession.adminMobile || ''})</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>डैशबोर्ड होम</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md active:scale-95 border border-rose-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* 4 Main Admins Showcase */}
        <div className="mt-6">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>मुख्य संरक्षक मंडल (Main Admins):</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-2xl border border-slate-700/70 flex items-center gap-3 relative group transition-colors shadow-xs"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl border-2 border-amber-400/80 overflow-hidden bg-slate-800 flex items-center justify-center relative shadow-sm">
                    {admin.photoUrl ? (
                      <img
                        src={admin.photoUrl}
                        alt={admin.name}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <UserCheck className="w-6 h-6 text-amber-400" />
                    )}
                  </div>
                  <label
                    className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-full cursor-pointer shadow-xs z-20 transition hover:scale-110"
                    title={`${admin.name} की फ़ोटो बदलें`}
                  >
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAdminPhotoUpload(admin.id, e)}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white truncate">{admin.name}</p>
                  <p className="text-[10px] text-amber-300 font-mono truncate">{admin.mobile}</p>
                  <p className="text-[9px] text-slate-300 font-medium truncate">{admin.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Speed Quick-Actions Action Bar ── */}
      <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>त्वरित क्रियाएं (Quick Actions & CRUD Operations)</span>
          </h3>
          <span className="text-[10px] text-slate-400">एक क्लिक में नया रिकॉर्ड बनाएं</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button
            onClick={() => {
              setActiveTab('members');
              setIsAddMemberOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ नया सदस्य</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('problems');
              setIsAddProblemOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ नयी समस्या</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('social-work');
              setIsAddSocialOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ सामाजिक कार्य</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ घोषणा जारी करें</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ कार्यक्रम जोड़ें</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ गैलरी फोटो</span>
          </button>

          <button
            onClick={() => setActiveTab('elders')}
            className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/60 hover:bg-orange-100 dark:hover:bg-orange-900/80 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4 text-orange-600" />
            <span className="text-[11px] font-extrabold leading-tight">+ बुजुर्ग सम्मान</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('villages');
              setIsAddVillageOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center gap-1.5 transition text-center active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="text-[11px] font-extrabold leading-tight">+ ग्राम इकाई</span>
          </button>
        </div>
      </div>

      {/* ── Pending Members Alert Banner ── */}
      {stats.pendingMembers > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-black shadow-xs">
              {stats.pendingMembers}
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 dark:text-amber-200 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>नया सदस्यता आवेदन स्वीकृति हेतु लंबित है!</span>
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                आवेदन की जांच करके एक क्लिक में स्वीकृत अथवा भूमिका आवंटित करें।
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('members')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer self-start sm:self-auto flex-shrink-0 active:scale-95"
          >
            सदस्यों की जांच व स्वीकृति करें →
          </button>
        </div>
      )}

      {/* ── Navigation Tabs Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'dashboard', label: '📊 डैशबोर्ड होम', count: null },
          { id: 'members', label: '👥 सदस्य (Members)', count: stats.pendingMembers },
          { id: 'problems', label: '📢 समस्याएं (Grievances)', count: stats.newProblems },
          { id: 'social-work', label: '🤝 सामाजिक कार्य', count: stats.pendingSocialWork },
          { id: 'public-info', label: 'ℹ️ जन सूचना', count: stats.pendingInformation },
          { id: 'announcements', label: '📣 घोषणाएं', count: null },
          { id: 'events', label: '📅 कार्यक्रम', count: null },
          { id: 'gallery', label: '🖼️ गैलरी', count: null },
          { id: 'elders', label: '👴 बुजुर्ग सम्मान', count: null },
          { id: 'villages', label: '🏡 ग्राम इकाइयां', count: villages.length },
          { id: 'helpline', label: '📞 हेल्पलाइन', count: null },
          { id: 'security', label: '🔐 सुरक्षा व ऑडिट लॉग', count: null },
          { id: 'supabase-setup', label: '⚡ डेटाबेस सेटअप', count: null },
          { id: 'api-integrations', label: '🔑 इंटीग्रेशन', count: null },
          { id: 'settings', label: '⚙️ सेटिंग्स व बैकअप', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 0: DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Real-time KPI Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">कुल सदस्य (Active)</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.actualMembers}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">✓ सत्यापित</span>
            </div>
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">लंबित आवेदन (Pending)</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingMembers}</p>
              <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">● स्वीकृति हेतु</span>
            </div>
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">कुल समस्याएं दर्ज</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.actualProblems}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">निस्तारण दर: {resolvedPct}%</span>
            </div>
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">नयी समस्याएं (New)</p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.newProblems}</p>
              <span className="text-[10px] text-rose-500 font-bold mt-1 inline-block">● तुरंत कार्यवाही</span>
            </div>
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">कार्यवाही जारी (Progress)</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.inProgressProblems}</p>
              <span className="text-[10px] text-blue-500 font-bold mt-1 inline-block">● प्रगति पर</span>
            </div>
            <div className="bg-white dark:bg-[#131B2E] p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">निस्तारित समस्याएं</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolvedProblems}</p>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">✓ सफल समाधान</span>
            </div>
          </div>

          {/* Visual Analytics Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>समस्या निस्तारण दर (Resolution Progress)</span>
                </h4>
                <span className="text-xs font-black text-emerald-600">{resolvedPct}%</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(stats.resolvedProblems / (totalComplaintsCount || 1)) * 100}%` }}
                  title="निस्तारित"
                />
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(stats.inProgressProblems / (totalComplaintsCount || 1)) * 100}%` }}
                  title="प्रगति पर"
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${(stats.newProblems / (totalComplaintsCount || 1)) * 100}%` }}
                  title="नयी"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> निस्तारित ({stats.resolvedProblems})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> प्रगति पर ({stats.inProgressProblems})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> नयी ({stats.newProblems})</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>सामाजिक कार्य व जन सहभागिता</span>
                </h4>
                <span className="text-xs font-black text-purple-600">{stats.publishedSocialWork} स्वीकृत</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">आगामी कार्यक्रम</p>
                  <p className="text-lg font-black text-purple-600 mt-0.5">{stats.upcomingEvents}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">गैलरी फोटो</p>
                  <p className="text-lg font-black text-teal-600 mt-0.5">{stats.galleryPhotos}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold">पंजीकृत गांव</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{villages.length}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                डेटाबेस: <strong>PostgreSQL via Supabase</strong> | कनेक्शन: <span className="text-emerald-600 font-bold">सक्रिय (Live Realtime)</span>
              </div>
            </div>
          </div>

          {/* Pending Triage Table on Dashboard Home */}
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>लंबित कार्य एवं हालिया शिकायतें (Action Items)</span>
              </h3>
              <button
                onClick={() => setActiveTab('members')}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>सभी सदस्य देखें</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {members.filter((m) => m.status === 'pending').slice(0, 4).map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-black flex items-center justify-center flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name} <span className="text-[10px] text-amber-600 font-bold px-2 py-0.2 bg-amber-100 dark:bg-amber-950/80 rounded-md">लंबित</span></p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{m.mobile} • {m.organizationName || villageSettings.orgNameHindi}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveMember(m.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      स्वीकृत करें (Approve)
                    </button>
                    <button
                      onClick={() => openEditMemberModal(m)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      संपादित करें
                    </button>
                  </div>
                </div>
              ))}

              {complaints.filter((c) => c.status === 'NEW').slice(0, 3).map((c) => (
                <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-black flex items-center justify-center flex-shrink-0">
                      📢
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{c.title} <span className="text-[10px] text-rose-600 font-bold px-2 py-0.2 bg-rose-100 dark:bg-rose-950/80 rounded-md">नयी शिकायत</span></p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.description.slice(0, 60)}... • {c.reporterName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateComplaintStatus(c.id, 'ACTION IN PROGRESS')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      कार्यवाही शुरू करें
                    </button>
                    <button
                      onClick={() => updateComplaintStatus(c.id, 'RESOLVED')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      निस्तारित
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: MEMBERS (FULL CRUD) ── */}
      {activeTab === 'members' && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="नाम या मोबाइल से खोजें..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">सभी स्थिति</option>
                <option value="active">सक्रिय (Active)</option>
                <option value="pending">लंबित (Pending)</option>
              </select>

              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">सभी भूमिका</option>
                <option value="MEMBER">सदस्य (MEMBER)</option>
                <option value="ADMIN">ग्राम एडमिन (ADMIN)</option>
                <option value="SUPER_ADMIN">सुपर एडमिन (SUPER)</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddMemberOpen ? 'फ़ॉर्म बंद करें' : 'नया सदस्य जोड़ें (Create Member)'}</span>
            </button>
          </div>

          {/* Create Member Form */}
          {isAddMemberOpen && (
            <form onSubmit={handleAddMemberSubmit} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>नया सदस्य विवरण दर्ज करें (Add New Member)</span>
              </h4>
              {memMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  {memMsg}
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {newMemPhoto ? (
                    <img src={newMemPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    <span>{newMemPhoto ? 'फ़ोटो बदलें' : 'सदस्य की फ़ोटो अपलोड करें'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setNewMemPhoto(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">डिजिटल ID कार्ड में यही फ़ोटो प्रदर्शित होगी</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    value={newMemName}
                    onChange={(e) => setNewMemName(e.target.value)}
                    placeholder="उदा. अमित कुमार"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={newMemMobile}
                    onChange={(e) => setNewMemMobile(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">सदस्यता दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={newMemDate}
                    onChange={(e) => setNewMemDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">संगठन का नाम *</label>
                  <input
                    type="text"
                    required
                    value={newMemOrg}
                    onChange={(e) => setNewMemOrg(e.target.value)}
                    placeholder="उदा. ग्रामोदय यूथ मंच"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  सदस्य सुरक्षित करें (Save Member)
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>सदस्य सूची ({filteredMembersList.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredMembersList.map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="relative group w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-slate-400" />
                      )}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-white">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  uploadPhoto('member', m.id, reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.fatherName && <span className="text-[10px] text-slate-400">({m.fatherName})</span>}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{m.mobile}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{m.organizationName || villageSettings.orgNameHindi} • {(m as any).joiningDate || m.createdAt || 'सदस्य'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Role selector / badge */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                        <span className="text-[10px] font-bold text-slate-500">भूमिका:</span>
                        <select
                          value={m.role || 'MEMBER'}
                          onChange={(e) =>
                            changeMemberRole(
                              m.id,
                              e.target.value as 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER',
                              m.villageId || activeVillageId
                            )
                          }
                          className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="MEMBER" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                            👤 MEMBER
                          </option>
                          <option value="ADMIN" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400">
                            🛡️ ADMIN
                          </option>
                          <option value="SUPER_ADMIN" className="bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400">
                            🌐 SUPER_ADMIN
                          </option>
                        </select>
                      </div>
                    ) : (
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          m.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : m.role === 'ADMIN'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {m.role === 'SUPER_ADMIN'
                          ? '🌐 SUPER'
                          : m.role === 'ADMIN'
                          ? '🛡️ ADMIN'
                          : '👤 MEMBER'}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        m.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse'
                      }`}
                    >
                      {m.status === 'active' ? 'सक्रिय (Active)' : 'लंबित (Pending)'}
                    </span>

                    {/* ID Card Button */}
                    <button
                      onClick={() => setSelectedIdCardMember(m)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                      title="ID कार्ड देखें व डाउनलोड करें"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>ID कार्ड</span>
                    </button>

                    {/* Edit Member Button */}
                    <button
                      onClick={() => openEditMemberModal(m)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                      title="सदस्य संपादित करें"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>संपादित</span>
                    </button>

                    {m.status === 'pending' && (
                      <button
                        onClick={() => approveMember(m.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition cursor-pointer active:scale-95"
                      >
                        स्वीकृत करें
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteConfirmMemberId(m.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer active:scale-95"
                      title="सदस्य हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROBLEMS / GRIEVANCES (FULL CRUD) ── */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="समस्या खोजें..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={problemStatusFilter}
                onChange={(e) => setProblemStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="ALL">सभी स्थितियां (ALL)</option>
                <option value="NEW">नयी समस्या (NEW)</option>
                <option value="ACTION IN PROGRESS">कार्य प्रगति पर (IN PROGRESS)</option>
                <option value="RESOLVED">निस्तारित (RESOLVED)</option>
              </select>

              <button
                onClick={() => setIsAddProblemOpen(!isAddProblemOpen)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ समस्या दर्ज करें</span>
              </button>
            </div>
          </div>

          {/* Add Problem Form */}
          {isAddProblemOpen && (
            <form onSubmit={handleAddProblemSubmit} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>नयी ग्राम समस्या दर्ज करें (Log Problem)</span>
              </h4>
              {probMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 text-rose-800 dark:text-rose-200 text-xs font-bold">
                  {probMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="समस्या का शीर्षक *"
                  value={newProbTitle}
                  onChange={(e) => setNewProbTitle(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="स्थान (उदा. मुख्य मार्ग / रसूलपुर)"
                  value={newProbLocation}
                  onChange={(e) => setNewProbLocation(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="शिकायतकर्ता का नाम"
                  value={newProbReporter}
                  onChange={(e) => setNewProbReporter(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="शिकायतकर्ता मोबाइल"
                  value={newProbPhone}
                  onChange={(e) => setNewProbPhone(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <textarea
                required
                rows={2}
                placeholder="समस्या का पूरा विवरण..."
                value={newProbDesc}
                onChange={(e) => setNewProbDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProblemOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  समस्या दर्ज करें
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblemsList.map((p) => (
              <div key={p.id} className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-amber-400 font-bold">
                      {p.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{p.title}</h4>
                  </div>

                  <select
                    value={p.status}
                    onChange={(e) => updateComplaintStatus(p.id, e.target.value as ComplaintStatus)}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border outline-none cursor-pointer ${
                      p.status === 'NEW'
                        ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : p.status === 'ACTION IN PROGRESS'
                        ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{p.description}</p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span>स्थान: {p.location} | शिकायतकर्ता: {p.reporterName}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditProblemModal(p)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="संपादित करें"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComplaint(p.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer active:scale-95"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SOCIAL WORK (FULL CRUD) ── */}
      {activeTab === 'social-work' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="सामाजिक कार्य खोजें..."
              value={socialSearch}
              onChange={(e) => setSocialSearch(e.target.value)}
              className="w-full max-w-md px-3.5 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            <div className="flex items-center gap-2">
              <select
                value={socialStatusFilter}
                onChange={(e) => setSocialStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="ALL">सभी (ALL)</option>
                <option value="pending">लंबित (Pending)</option>
                <option value="approved">स्वीकृत (Approved)</option>
                <option value="published">प्रकाशित (Published)</option>
              </select>
              <button
                onClick={() => setIsAddSocialOpen(!isAddSocialOpen)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ कार्य जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Add Social Work Form */}
          {isAddSocialOpen && (
            <form onSubmit={handleAddSocialSubmit} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>नया सामाजिक कार्य जोड़ें (Add Social Work)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="कार्य का शीर्षक *"
                  value={newSocTitle}
                  onChange={(e) => setNewSocTitle(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="स्थान (उदा. रसूलपुर)"
                  value={newSocLoc}
                  onChange={(e) => setNewSocLoc(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <textarea
                required
                rows={2}
                placeholder="कार्य का विवरण..."
                value={newSocDesc}
                onChange={(e) => setNewSocDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSocialOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSocialList.map((s) => (
              <div key={s.id} className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.description}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">प्रस्तुतकर्ता: {s.submitterName} | स्थान: {s.location}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {s.status === 'pending' ? (
                    <button
                      onClick={() => updateSocialWorkStatus(s.id, 'approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition active:scale-95 shadow-xs"
                    >
                      स्वीकृत करें (Approve)
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ स्वीकृत (Approved)
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditSocialModal(s)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      title="संपादित करें"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSocialWork(s.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition active:scale-95"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: PUBLIC INFO (CRUD) ── */}
      {activeTab === 'public-info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInfoList.map((p) => (
              <div key={p.id} className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name} ({p.mobile})</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{p.information}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {p.status === 'pending' ? (
                    <button
                      onClick={() => updatePublicInfoStatus(p.id, 'approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition active:scale-95 shadow-xs"
                    >
                      स्वीकृत करें
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ सक्रिय
                    </span>
                  )}
                  <button
                    onClick={() => deletePublicInfo(p.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition active:scale-95"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: ANNOUNCEMENTS (FULL CRUD) ── */}
      {activeTab === 'announcements' && (
        <div className="space-y-5">
          <form onSubmit={handleCreateAnnouncement} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>नयी घोषणा जारी करें (Publish Announcement)</span>
            </h4>
            <input
              type="text"
              required
              placeholder="घोषणा का शीर्षक"
              value={newAnnTitle}
              onChange={(e) => setNewAnnTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              required
              rows={3}
              placeholder="घोषणा का विवरण"
              value={newAnnContent}
              onChange={(e) => setNewAnnContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95">
              घोषणा प्रकाशित करें
            </button>
          </form>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{a.title}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{a.content}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingAnnouncement({ id: a.id, title: a.title, content: a.content })}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    title="संपादित करें"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition active:scale-95"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: EVENTS (FULL CRUD) ── */}
      {activeTab === 'events' && (
        <div className="space-y-5">
          <form onSubmit={handleCreateEventSubmit} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>नया कार्यक्रम जोड़ें (Add Event)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="कार्यक्रम शीर्षक *"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="समय (उदा. 10:00 AM)"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="स्थान (उदा. रसूलपुर)"
                value={newEventLoc}
                onChange={(e) => setNewEventLoc(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <textarea
              rows={2}
              placeholder="विवरण..."
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95">
              कार्यक्रम सहेजें (Save Event)
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => (
              <div key={e.id} className="bg-white dark:bg-[#131B2E] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{e.title || e.name}</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{e.date} | {e.location}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{e.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <select
                    value={e.status}
                    onChange={(evt) => updateEventStatus(e.id, evt.target.value as EventStatus)}
                    className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditEventModal(e)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                      title="संपादित करें"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(e.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition active:scale-95"
                      title="हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: GALLERY (FULL CRUD) ── */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden p-2.5 shadow-xs flex flex-col justify-between">
                <img src={g.photoUrl} alt={g.caption} className="w-full h-32 object-cover rounded-2xl mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{g.caption}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {g.status === 'pending' ? (
                    <button
                      onClick={() => approveGalleryPhoto(g.id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Live</span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingGalleryItem({ id: g.id, caption: g.caption })}
                      className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="कैप्शन बदलें"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGalleryItem(g.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      title="हटाएं"
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

      {/* ── TAB 8: ELDERS (FULL CRUD) ── */}
      {activeTab === 'elders' && (
        <div className="space-y-5">
          <form onSubmit={handleAddElderSubmit} className="bg-white dark:bg-[#131B2E] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span>बुजुर्ग सदस्य का रिकॉर्ड जोड़ें (Elder Honor)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="बुजुर्ग का नाम *"
                value={elderName}
                onChange={(e) => setElderName(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="tel"
                placeholder="संपर्क नंबर"
                value={elderMobile}
                onChange={(e) => setElderMobile(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="स्थान (उदा. रसूलपुर)"
                value={elderLocation}
                onChange={(e) => setElderLocation(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <textarea
              rows={2}
              placeholder="विवरण या स्वास्थ्य संबंधी जानकारी..."
              value={elderDetails}
              onChange={(e) => setElderDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95">
              सुरक्षित करें (Save Elder Info)
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elders.map((el) => (
              <div key={el.id} className="bg-white dark:bg-[#131B2E] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{el.name}</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{el.location} | {el.mobile || 'नंबर उपलब्ध नहीं'}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{el.details}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditElderModal(el)}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    title="संपादित करें"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteElder(el.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer transition active:scale-95"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 9: VILLAGES MANAGEMENT (FULL CRUD) ── */}
      {activeTab === 'villages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B2E] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏡 ग्राम इकाइयां (Village Units)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  {villages.length} ग्राम पंजीकृत
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isSuperAdmin
                  ? '🌐 ग्लोबल सुपर एडमिन: आप सभी ग्राम इकाइयों को जोड़, संपादित अथवा हटा सकते हैं।'
                  : '🏡 ग्राम एडमिन: आप अपनी आवंटित ग्राम इकाई का प्रबंधन कर रहे हैं।'}
              </p>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setIsAddVillageOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer self-start sm:self-auto active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>नयी ग्राम इकाई जोड़ें (Add Village)</span>
              </button>
            )}
          </div>

          {/* Add Village Form */}
          {isAddVillageOpen && (
            <div className="bg-emerald-50/50 dark:bg-slate-900/80 p-5 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>नयी ग्राम इकाई पंजीकृत करें</span>
                </h4>
                <button
                  onClick={() => setIsAddVillageOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {vilMsg && (
                <div className="p-3 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {vilMsg}
                </div>
              )}

              <form onSubmit={handleAddVillageSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ग्राम नाम (अंग्रेजी में) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rasoolpur"
                    value={newVilName}
                    onChange={(e) => setNewVilName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ग्राम नाम (हिंदी में) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. रसूलपुर"
                    value={newVilNameHindi}
                    onChange={(e) => setNewVilNameHindi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ग्राम पंचायत का नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. बहेरा"
                    value={newVilGramPanchayat}
                    onChange={(e) => setNewVilGramPanchayat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    जनपद (District)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Jaunpur / जौनपुर"
                    value={newVilDistrict}
                    onChange={(e) => setNewVilDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    नारा / टैगलाइन
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. युवा शक्ति से ग्रामोदय की ओर"
                    value={newVilTagline}
                    onChange={(e) => setNewVilTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddVillageOpen(false)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs cursor-pointer active:scale-95"
                  >
                    ग्राम इकाई सहेजें (Save Village)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Villages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {villages.map((vil) => {
              const isCurrent = activeVillageId === vil.id || villageSettings.id === vil.id;
              return (
                <div
                  key={vil.id}
                  className={`bg-white dark:bg-[#131B2E] p-5 rounded-3xl border transition shadow-xs flex flex-col justify-between ${
                    isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏡</span>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {vil.nameHindi} ({vil.name})
                        </h4>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-300 dark:border-emerald-700">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">ग्राम पंचायत:</strong>{' '}
                        {vil.gramPanchayatNameHindi || vil.gramPanchayatName || 'बहेरा'}
                      </p>
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">जनपद:</strong>{' '}
                        {vil.districtName || 'जौनपुर'}
                      </p>
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">संगठन:</strong>{' '}
                        {vil.orgNameHindi || vil.orgName}
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        "{vil.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveVillageId(vil.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isCurrent ? '✓ चयनित ग्राम' : 'इस ग्राम को चुनें'}
                    </button>

                    {isSuperAdmin && villages.length > 1 && (
                      <button
                        onClick={() => setDeleteConfirmVillageId(vil.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title="ग्राम इकाई हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 10: HELPLINE ── */}
      {activeTab === 'helpline' && (
        <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>गांव आपातकालीन नंबर निर्देशिका (Helpline Numbers)</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">यह सूची सीधे हेल्पलाइन अनुभाग में प्रदर्शित होती है।</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🚨 ग्राम सुरक्षा कक्ष</p>
              <p className="text-base font-black text-rose-600 mt-1 font-mono">+91 8787220423</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">🏥 प्राथमिक स्वास्थ्य केंद्र</p>
              <p className="text-base font-black text-emerald-600 mt-1 font-mono">+91 9450706183</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">⚡ UPCL बिजली आपातकालीन</p>
              <p className="text-base font-black text-amber-600 mt-1 font-mono">+91 9450706182</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 11: SECURITY & AUDIT LOGS ── */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white p-5 rounded-3xl border border-slate-700 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-400">सुरक्षा एवं भूमिका नियंत्रण (Security & RBAC)</h4>
                <p className="text-xs text-slate-300">
                  सक्रिय सत्र: {authSession.adminName} ({authSession.adminMobile}) — भूमिका: {authSession.role || 'MAIN ADMIN'}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              प्रणाली में केवल अधिकृत मुख्य एडमिन मोबाइल नंबर ही प्रशासनिक अधिकार रखते हैं। सभी संवेदनशील क्रियाएं स्वचालित रूप से ऑडिट लॉग में दर्ज की जाती हैं।
            </p>
          </div>

          <div className="bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>एडमिन गतिविधि ऑडिट लॉग (Audit / Activity History Log)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">{auditLogs.length} रिकॉर्ड्स</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {auditLogs.length === 0 ? (
                <p className="p-6 text-xs text-center text-slate-400">कोई सुरक्षा या ऑडिट लॉग उपलब्ध नहीं है।</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        प्रभावित रिकॉर्ड: <span className="font-semibold text-slate-800 dark:text-slate-200">{log.recordAffected}</span>
                      </p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-[10px] font-bold text-emerald-600">{log.adminName}</p>
                      <p className="text-[9px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('hi-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 12: SUPABASE SETUP ── */}
      {activeTab === 'supabase-setup' && (
        <div className="py-2">
          <SupabaseSetupScreen inlineMode={true} />
        </div>
      )}

      {/* ── TAB 13: API INTEGRATIONS ── */}
      {activeTab === 'api-integrations' && (
        <div className="space-y-5">
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">Supabase डेटाबेस एवं क्लाउड कनेक्ट</h4>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                  ग्रामोदय यूथ मंच का Supabase प्रोजेक्ट कनेक्ट करें (URL और Publishable/Anon Key).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('supabase-setup')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition flex-shrink-0 cursor-pointer active:scale-95"
            >
              ⚡ Supabase कनेक्शन सेट करें →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((int) => (
              <div key={int.id} className="bg-white dark:bg-[#131B2E] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-emerald-600" />
                      <span>{int.name}</span>
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        int.status === 'Connected'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {int.status}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl mb-4 truncate border border-slate-100 dark:border-slate-800">
                    कुंजी: <span className="text-slate-800 dark:text-slate-200 font-bold">{int.keyMasked}</span>
                  </p>

                  {testResultMsg && testResultMsg.id === int.id && (
                    <div
                      className={`text-[11px] font-bold p-2.5 rounded-xl mb-4 ${
                        testResultMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {testResultMsg.msg}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedIntegration(int);
                      setConfigApiKey('');
                      setIsConfigModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                  >
                    Configure
                  </button>

                  <button
                    onClick={() => handleTestIntegration(int.id)}
                    className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                    title="टेस्ट करें"
                  >
                    Test
                  </button>

                  {int.status === 'Connected' && (
                    <button
                      onClick={() => setDisconnectConfirmId(int.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                      title="डिस्कनेक्ट करें"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 14: SETTINGS & BACKUP ── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Password Change */}
          <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>एडमिन पासवर्ड बदलें (Change Password)</span>
            </h4>

            {pwdMsg && <p className="text-xs font-bold text-amber-600">{pwdMsg}</p>}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">नया पासवर्ड *</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="नया गुप्त पासवर्ड दर्ज करें"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">पासवर्ड पुनः दर्ज करें *</label>
                <input
                  type="password"
                  required
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="नया पासवर्ड पुनः दर्ज करें"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition shadow-xs cursor-pointer active:scale-95"
              >
                पासवर्ड अपडेट करें (Update Password)
              </button>
            </form>
          </div>

          {/* Database Backup & Export */}
          <div className="bg-white dark:bg-[#131B2E] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>डेटा बेस प्रबंधन (Data JSON Management & Backup)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              सर्वर के लाइव डेटाबेस (data.json) को बैकअप (डाउनलोड) करें, फ़ाइल से रिस्टोर करें या डिफ़ॉल्ट स्थिति में रीसेट करें।
            </p>

            {dataJsonMsg && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl">
                {dataJsonMsg}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={exportDataJson}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-xs active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>डाटा JSON डाउनलोड करें (Export data.json)</span>
              </button>

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 transition cursor-pointer active:scale-95">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>JSON फ़ाइल अपलोड/रिस्टोर करें (Import data.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setResetDataConfirmOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-200 text-xs font-bold rounded-2xl border border-rose-200 dark:border-rose-800 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>रीसेट डेटा (Reset Database)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT MODALS (FULL CRUD UPDATE CAPABILITIES)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── EDIT MEMBER MODAL ── */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>सदस्य विवरण संपादित करें (Edit Member)</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editMemMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl">
                {editMemMsg}
              </div>
            )}

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    value={editMemName}
                    onChange={(e) => setEditMemName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={editMemMobile}
                    onChange={(e) => setEditMemMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">पिता का नाम</label>
                  <input
                    type="text"
                    value={editMemFatherName}
                    onChange={(e) => setEditMemFatherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">जन्म तिथि (DOB)</label>
                  <input
                    type="date"
                    value={editMemDob}
                    onChange={(e) => setEditMemDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">भूमिका (Role)</label>
                  <select
                    value={editMemRole}
                    onChange={(e) => setEditMemRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="MEMBER">👤 MEMBER (सदस्य)</option>
                    <option value="ADMIN">🛡️ ADMIN (ग्राम एडमिन)</option>
                    <option value="SUPER_ADMIN">🌐 SUPER_ADMIN (सुपर एडमिन)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">स्थिति (Status)</label>
                  <select
                    value={editMemStatus}
                    onChange={(e) => setEditMemStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="active">सक्रिय (Active)</option>
                    <option value="pending">लंबित (Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">पता / ग्राम</label>
                <input
                  type="text"
                  value={editMemAddress}
                  onChange={(e) => setEditMemAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  परिवर्तन सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROBLEM MODAL ── */}
      {editingProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">समस्या संपादित करें</h3>
              <button onClick={() => setEditingProblem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProblemSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">शीर्षक</label>
                <input
                  type="text"
                  required
                  value={editProbTitle}
                  onChange={(e) => setEditProbTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">विवरण</label>
                <textarea
                  rows={3}
                  required
                  value={editProbDesc}
                  onChange={(e) => setEditProbDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">स्थिति</label>
                <select
                  value={editProbStatus}
                  onChange={(e) => setEditProbStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="NEW">नयी (NEW)</option>
                  <option value="ACTION IN PROGRESS">प्रगति पर (IN PROGRESS)</option>
                  <option value="RESOLVED">निस्तारित (RESOLVED)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingProblem(null)} className="px-4 py-2 text-xs font-bold">रद्द करें</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">सुरक्षित करें</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ANNOUNCEMENT MODAL ── */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">घोषणा संपादित करें</h3>
              <button onClick={() => setEditingAnnouncement(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateAnnouncementSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={editingAnnouncement.title}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <textarea
                rows={3}
                required
                value={editingAnnouncement.content}
                onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingAnnouncement(null)} className="px-4 py-2 text-xs font-bold">रद्द करें</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">सुरक्षित करें</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT EVENT MODAL ── */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">कार्यक्रम संपादित करें</h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEventSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={editingEvent.title || editingEvent.name || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  value={editingEvent.time || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <input
                type="text"
                value={editingEvent.location}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <textarea
                rows={2}
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 text-xs font-bold">रद्द करें</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">सुरक्षित करें</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT ELDER MODAL ── */}
      {editingElder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">बुजुर्ग सम्मान रिकॉर्ड संपादित करें</h3>
              <button onClick={() => setEditingElder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateElderSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={editingElder.name}
                onChange={(e) => setEditingElder({ ...editingElder, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="tel"
                value={editingElder.mobile || ''}
                onChange={(e) => setEditingElder({ ...editingElder, mobile: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="text"
                value={editingElder.location || ''}
                onChange={(e) => setEditingElder({ ...editingElder, location: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <textarea
                rows={2}
                value={editingElder.details || ''}
                onChange={(e) => setEditingElder({ ...editingElder, details: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingElder(null)} className="px-4 py-2 text-xs font-bold">रद्द करें</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl">सुरक्षित करें</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT GALLERY CAPTION MODAL ── */}
      {editingGalleryItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">फ़ोटो कैप्शन बदलें</h3>
            <input
              type="text"
              required
              value={editingGalleryItem.caption}
              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingGalleryItem(null)} className="px-4 py-2 text-xs font-bold">रद्द करें</button>
              <button
                onClick={async () => {
                  await editGalleryCaption(editingGalleryItem.id, editingGalleryItem.caption);
                  setEditingGalleryItem(null);
                }}
                className="px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                सुरक्षित करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODALS ── */}
      {deleteConfirmMemberId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 text-center shadow-xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">क्या आप सदस्य को हटाना चाहते हैं?</h3>
            <p className="text-xs text-slate-500">यह क्रिया सदस्य रिकॉर्ड व संबंधित आईडी को हटा देगी।</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmMemberId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDeleteMemberConfirmed}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                हां, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET DATA CONFIRMATION MODAL ── */}
      {resetDataConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 text-center shadow-xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">क्या आप डेटा बेस को रीसेट करना चाहते हैं?</h3>
            <p className="text-xs text-slate-500">सभी रिकॉर्ड डिफ़ॉल्ट प्रारंभिक स्थिति में रीसेट हो जाएंगे।</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setResetDataConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                हां, रीसेट करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE VILLAGE CONFIRMATION MODAL ── */}
      {deleteConfirmVillageId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-rose-200 dark:border-rose-900 text-center shadow-xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">क्या आप इस ग्राम इकाई को हटाना चाहते हैं?</h3>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmVillageId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDeleteVillageConfirmed}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                हां, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISCONNECT INTEGRATION MODAL ── */}
      {disconnectConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">क्या आप इस सेवा को डिस्कनेक्ट करना चाहते हैं?</h3>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDisconnectConfirmId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDisconnectConfirmed}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                हां, डिस्कनेक्ट करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIGURE INTEGRATION MODAL ── */}
      {isConfigModalOpen && selectedIntegration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {selectedIntegration.name} कॉन्फ़िगरेशन
              </h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              सर्वर-साइड सुरक्षित कुंजी प्रदान करें। यह मान सर्वर डेटाबेस में मास्क करके सहेजा जाता है।
            </p>

            <form onSubmit={handleSaveIntegration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">API Key / Credential Token</label>
                <input
                  type="password"
                  required
                  value={configApiKey}
                  onChange={(e) => setConfigApiKey(e.target.value)}
                  placeholder="उदा. sk_live_••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs"
                >
                  सुरक्षित सहेजें (Save Credentials)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
