'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplaintStatus, EventStatus } from '../../types';
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
    deleteMember,
    complaints,
    updateComplaintStatus,
    deleteComplaint,
    socialWorks,
    updateSocialWorkStatus,
    deleteSocialWork,
    publicInfos,
    updatePublicInfoStatus,
    deletePublicInfo,
    announcements,
    publishAnnouncement,
    deleteAnnouncement,
    events,
    createEvent,
    updateEventStatus,
    deleteEvent,
    gallery,
    uploadGalleryPhoto,
    approveGalleryPhoto,
    deleteGalleryItem,
    elders,
    addElder,
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
          setDataJsonMsg('डेटा सफलता पूर्वक रिस्टोर/अपडेट किया गया! (Data imported successfully)');
        } else {
          setDataJsonMsg(`त्रुटि: ${res.error}`);
        }
      } catch (err) {
        setDataJsonMsg('अमान्य JSON फ़ाइल। (Invalid JSON file format)');
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

  const [activeTab, setActiveTab] = useState<
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
  >('members');

  // Village Management State
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


  // Member Management State
  const [memberSearch, setMemberSearch] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemMobile, setNewMemMobile] = useState('');
  const [newMemPhoto, setNewMemPhoto] = useState('');
  const [newMemOrg, setNewMemOrg] = useState('ग्रामोदय यूथ मंच');
  const [newMemDate, setNewMemDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [memMsg, setMemMsg] = useState('');
  const [deleteConfirmMemberId, setDeleteConfirmMemberId] = useState<string | null>(null);

  // Filters State
  const [problemStatusFilter, setProblemStatusFilter] = useState<string>('ALL');
  const [problemSearch, setProblemSearch] = useState('');

  const [socialStatusFilter, setSocialStatusFilter] = useState<string>('ALL');
  const [socialSearch, setSocialSearch] = useState('');

  const [infoStatusFilter, setInfoStatusFilter] = useState<string>('ALL');
  const [infoSearch, setInfoSearch] = useState('');

  const [eventStatusFilter, setEventStatusFilter] = useState<string>('ALL');
  const [eventSearch, setEventSearch] = useState('');

  const [galleryStatusFilter, setGalleryStatusFilter] = useState<string>('ALL');
  const [gallerySearch, setGallerySearch] = useState('');

  const [elderSearch, setElderSearch] = useState('');

  // Form states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  const [newGalCaption, setNewGalCaption] = useState('');
  const [newGalPhoto, setNewGalPhoto] = useState('');

  const [elderName, setElderName] = useState('');
  const [elderMobile, setElderMobile] = useState('');
  const [elderLocation, setElderLocation] = useState('रसूलपुर');
  const [elderDetails, setElderDetails] = useState('');

  // Integrations Modal State
  const [selectedIntegration, setSelectedIntegration] = useState<any | null>(null);
  const [configApiKey, setConfigApiKey] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [testResultMsg, setTestResultMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);
  const [disconnectConfirmId, setDisconnectConfirmId] = useState<string | null>(null);

  // Settings State
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  if (!authSession.isAdminLoggedIn) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E0DCCF] shadow-sm">
          <Shield className="w-12 h-12 text-[#D97706] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#2C3327]">एडमिन लॉगिन आवश्यक है</h2>
          <p className="text-xs text-[#8C8675] mt-2 mb-6">
            मुख्य एडमिन पैनल का उपयोग करने के लिए अधिकृत मोबाइल नंबर से लॉगिन करें।
          </p>
        </div>
      </div>
    );
  }

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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    await publishAnnouncement(newAnnTitle, newAnnContent);
    setNewAnnTitle('');
    setNewAnnContent('');
  };

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

  // Filtered lists
  const filteredMembersList = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.mobile.includes(memberSearch)
  );

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

  if (!authSession || !authSession.isAdminLoggedIn) {
    return (
      <div className="py-16 px-4 max-w-xl mx-auto text-center">
        <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#2C3327] tracking-tight">
            अनाधिकृत पहुंच (Unauthorized Access)
          </h2>
          <p className="text-xs text-[#8C8675] font-medium leading-relaxed">
            यह स्थान केवल अधिकृत ग्रामोदय यूथ मंच एडमिन के लिए सुरक्षित है। एडमिन पैनल तक पहुँचने के लिए कृपया सुरक्षित एडमिन लॉगिन करें।
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="px-6 py-3 bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>🔐 अधिकृत एडमिन लॉगिन (Admin Login)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Top Header: 4 Main Admins Profiles */}
      <div className="bg-[#2C3327] text-white rounded-2xl p-6 mb-8 border border-[#3B4F3D] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#3B4F3D]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs ${
                isSuperAdmin ? 'bg-purple-600 text-white' : 'bg-[#D97706] text-white'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                <span>{isSuperAdmin ? '🌐 Global Super Admin (पूर्ण अधिकार — सभी ग्राम)' : `🏡 Village Admin (${villageSettings.nameHindi})`}</span>
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

            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
              {villageSettings.orgName} — {villageSettings.nameHindi}
            </h2>
            <p className="text-xs text-[#E0DCCF] mt-1">
              ग्राम पंचायत — {villageSettings.gramPanchayatHindi} | अधिकृत एडमिन: {authSession.adminName} ({authSession.adminMobile})
            </p>
          </div>

          <button
            onClick={adminLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700 rounded-xl text-xs font-bold transition self-start md:self-auto cursor-pointer shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट (Logout)</span>
          </button>
        </div>

        {/* 4 Main Admins Showcase */}
        <div className="mt-6">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
            मुख्य संरक्षक मंडल (Main Admins):
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="bg-[#1F251B] p-3 rounded-xl border border-[#3B4F3D] flex items-center gap-3 relative group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border border-amber-500 overflow-hidden bg-[#2C3327] flex items-center justify-center relative">
                    <UserCheck className="w-6 h-6 text-amber-400" />
                    {admin.photoUrl && (
                      <img
                        src={admin.photoUrl}
                        alt={admin.name}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <label
                    className="absolute -bottom-1 -right-1 bg-[#D97706] hover:bg-[#B45309] text-white p-1 rounded-full cursor-pointer shadow-xs z-20"
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
                  <p className="text-[9px] text-[#E0DCCF] truncate">{admin.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Dashboard Statistics Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-[#2C3327] dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>डैशबोर्ड आंकड़े (Live Dashboard Statistics)</span>
          </h3>
          <span className="text-[10px] text-[#8C8675] dark:text-slate-400 font-mono">डेटाबेस से रीयल-टाइम संचालित</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">कुल सदस्य (Active)</p>
            <p className="text-xl font-black text-[#2C3327] dark:text-white mt-1">{stats.actualMembers}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">लंबित सदस्य (Pending)</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingMembers}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">कुल समस्याएं</p>
            <p className="text-xl font-black text-[#2C3327] dark:text-white mt-1">{stats.actualProblems}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">नयी समस्याएं (New)</p>
            <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{stats.newProblems}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">प्रगति पर (In Progress)</p>
            <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.inProgressProblems}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">निस्तारित समस्याएं</p>
            <p className="text-xl font-black text-green-600 dark:text-green-400 mt-1">{stats.resolvedProblems}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">लंबित सामाजिक कार्य</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingSocialWork}</p>
          </div>
          <div className="bg-white dark:bg-[#131B2E] p-3.5 rounded-xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675] dark:text-slate-400">स्वीकृत सामाजिक कार्य</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.publishedSocialWork}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E0DCCF] shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675]">लंबित जन सूचनाएं</p>
            <p className="text-xl font-black text-amber-600 mt-1">{stats.pendingInformation}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E0DCCF] shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675]">प्रकाशित सूचनाएं</p>
            <p className="text-xl font-black text-blue-600 mt-1">{stats.publishedInformation}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E0DCCF] shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675]">आगामी कार्यक्रम</p>
            <p className="text-xl font-black text-purple-600 mt-1">{stats.upcomingEvents}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#E0DCCF] shadow-2xs">
            <p className="text-[10px] font-bold text-[#8C8675]">गैलरी फोटो</p>
            <p className="text-xl font-black text-teal-600 mt-1">{stats.galleryPhotos}</p>
          </div>
        </div>
      </div>

      {/* Pending Members Alert Banner for all 4 Admins */}
      {stats.pendingMembers > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-black">
              {stats.pendingMembers}
            </div>
            <div>
              <h4 className="font-extrabold text-[#2C3327] text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>नया सदस्यता आवेदन स्वीकृति हेतु लंबित है!</span>
              </h4>
              <p className="text-xs text-[#8C8675] mt-0.5">
                यह अनुरोध चारों मुख्य एडमिनों (१. आलोक कुमार, २. देवरत्न, ३. अरविन्द, ४. अनूप) के पास भेजा गया है।
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('members')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            सदस्यों की जांच व स्वीकृति करें →
          </button>
        </div>
      )}

      {/* Admin Panel Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#E0DCCF] dark:border-slate-800 scrollbar-none">
        {[
          { id: 'members', label: '👥 सदस्य', count: stats.pendingMembers },
          { id: 'problems', label: '📢 समस्याएं', count: stats.newProblems },
          { id: 'social-work', label: '🤝 सामाजिक कार्य', count: stats.pendingSocialWork },
          { id: 'public-info', label: 'ℹ️ जन सूचना', count: stats.pendingInformation },
          { id: 'announcements', label: '📣 घोषणाएं', count: null },
          { id: 'events', label: '📅 कार्यक्रम', count: null },
          { id: 'gallery', label: '🖼️ गैलरी', count: null },
          { id: 'elders', label: '👴 बुजुर्ग', count: null },
          { id: 'villages', label: '🏡 ग्राम इकाइयां (Villages)', count: villages.length },
          { id: 'helpline', label: '📞 हेल्पलाइन', count: null },
          { id: 'security', label: '🔐 सुरक्षा व लॉग', count: null },
          { id: 'supabase-setup', label: '⚡ डेटाबेस सेटअप', count: null },
          { id: 'api-integrations', label: '🔑 इंटीग्रेशन', count: null },
          { id: 'settings', label: '⚙️ सेटिंग्स', count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1E3A2F] text-white dark:bg-emerald-600 shadow-2xs'
                : 'bg-white dark:bg-[#131B2E] text-[#2C3327] dark:text-slate-200 hover:bg-[#F0EDE4] dark:hover:bg-slate-800 border border-[#E0DCCF] dark:border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C8675] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="नाम या मोबाइल नंबर से खोजें..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327] focus:outline-none focus:ring-2 focus:ring-[#4B634D]"
              />
            </div>

            <button
              onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4B634D] text-white rounded-xl text-xs font-bold hover:bg-[#3B4F3D] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>नया सदस्य जोड़ें (Add Member)</span>
            </button>
          </div>

          {isAddMemberOpen && (
            <form onSubmit={handleAddMemberSubmit} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] mb-6 shadow-2xs">
              <h4 className="text-sm font-bold text-[#2C3327] mb-4">नया सदस्य जोड़ें</h4>
              {memMsg && <p className="text-xs font-bold text-[#D97706] mb-3">{memMsg}</p>}
              
              {/* Photo Upload Input */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#F0EDE4] rounded-xl border border-[#E0DCCF]">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E0DCCF] overflow-hidden flex items-center justify-center">
                  {newMemPhoto ? (
                    <img src={newMemPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-[#8C8675]" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer text-xs font-bold text-[#4B634D] hover:underline flex items-center gap-1">
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
                  <p className="text-[10px] text-[#8C8675]">ID कार्ड में यही फोटो प्रदर्शित होगी</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">पूरा नाम *</label>
                  <input
                    type="text"
                    required
                    value={newMemName}
                    onChange={(e) => setNewMemName(e.target.value)}
                    placeholder="उदा. अमित कुमार"
                    className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={newMemMobile}
                    onChange={(e) => setNewMemMobile(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">सदस्यता दिनांक (Joining Date) *</label>
                  <input
                    type="date"
                    required
                    value={newMemDate}
                    onChange={(e) => setNewMemDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">संगठन का नाम *</label>
                  <input
                    type="text"
                    required
                    value={newMemOrg}
                    onChange={(e) => setNewMemOrg(e.target.value)}
                    placeholder="उदा. ग्रामोदय यूथ मंच"
                    className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#4B634D] text-white text-xs font-bold rounded-xl hover:bg-[#3B4F3D] transition cursor-pointer"
              >
                सदस्य जोड़ें
              </button>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-[#E0DCCF] overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#F0EDE4] border-b border-[#E0DCCF] flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#2C3327] uppercase tracking-wider">
                सदस्य सूची ({filteredMembersList.length})
              </h3>
            </div>

            <div className="divide-y divide-[#E0DCCF]">
              {filteredMembersList.map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0EDE4]/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="relative group w-11 h-11 rounded-full bg-[#E0DCCF] overflow-hidden flex items-center justify-center flex-shrink-0 border border-[#4B634D]/30">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-[#8C8675]" />
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
                      <p className="text-xs font-bold text-[#2C3327]">{m.name}</p>
                      <p className="text-[11px] font-mono text-[#8C8675]">{m.mobile}</p>
                      <p className="text-[10px] text-[#8C8675]">{m.organizationName || villageSettings.orgNameHindi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Role selector for Super Admin or Badge for others */}
                    {isSuperAdmin ? (
                      <div className="flex items-center gap-1 bg-[#F0EDE4] dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-[#E0DCCF] dark:border-slate-700 text-[11px]">
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
                          className="bg-transparent text-xs font-bold text-[#2C3327] dark:text-white outline-none cursor-pointer"
                        >
                          <option value="MEMBER" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                            👤 MEMBER (सदस्य)
                          </option>
                          <option value="ADMIN" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400">
                            🛡️ ADMIN (ग्राम एडमिन)
                          </option>
                          <option value="SUPER_ADMIN" className="bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400">
                            🌐 SUPER_ADMIN (सुपर एडमिन)
                          </option>
                        </select>
                      </div>
                    ) : (
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          m.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : m.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {m.role === 'SUPER_ADMIN'
                          ? '🌐 SUPER_ADMIN'
                          : m.role === 'ADMIN'
                          ? '🛡️ ADMIN'
                          : '👤 MEMBER'}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        m.status === 'active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {m.status === 'active' ? 'सक्रिय (Active)' : 'लंबित (Pending)'}
                    </span>

                    {/* ID Card Button */}
                    <button
                      onClick={() => setSelectedIdCardMember(m)}
                      className="px-2.5 py-1 bg-[#4B634D] text-white rounded-lg text-[11px] font-bold hover:bg-[#3B4F3D] transition cursor-pointer flex items-center gap-1 shadow-xs"
                      title="ID कार्ड देखें व डाउनलोड करें"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>ID कार्ड</span>
                    </button>

                    {m.status === 'pending' && (
                      <button
                        onClick={() => approveMember(m.id)}
                        className="px-2.5 py-1 bg-green-700 text-white rounded-lg text-[11px] font-bold hover:bg-green-800 transition cursor-pointer"
                      >
                        स्वीकृत करें (Approve)
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteConfirmMemberId(m.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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

      {/* TAB 2: PROBLEMS */}
      {activeTab === 'problems' && (
        <div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C8675] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="समस्या खोजें..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327] focus:outline-none focus:ring-2 focus:ring-[#4B634D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8C8675]" />
              <select
                value={problemStatusFilter}
                onChange={(e) => setProblemStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs font-bold text-[#2C3327]"
              >
                <option value="ALL">सभी स्थितियां (ALL)</option>
                <option value="NEW">नयी समस्या (NEW)</option>
                <option value="ACTION IN PROGRESS">कार्य प्रगति पर (IN PROGRESS)</option>
                <option value="RESOLVED">निस्तारित (RESOLVED)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblemsList.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] shadow-2xs">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2C3327] text-amber-400 font-bold">
                      {p.id}
                    </span>
                    <h4 className="text-sm font-bold text-[#2C3327] mt-1">{p.title}</h4>
                  </div>

                  <select
                    value={p.status}
                    onChange={(e) => updateComplaintStatus(p.id, e.target.value as ComplaintStatus)}
                    className="text-[10px] font-extrabold px-2 py-1 rounded-lg border bg-[#F0EDE4] text-[#2C3327]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACTION IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <p className="text-xs text-[#8C8675] mb-3">{p.description}</p>
                <div className="text-[10px] text-[#8C8675] mb-3">
                  स्थान: {p.location} | शिकायतकर्ता: {p.reporterName} ({p.reporterMobile})
                </div>

                <button
                  onClick={() => deleteComplaint(p.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition cursor-pointer"
                >
                  हटाएं (Delete)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL WORK */}
      {activeTab === 'social-work' && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="सामाजिक कार्य खोजें..."
              value={socialSearch}
              onChange={(e) => setSocialSearch(e.target.value)}
              className="w-full max-w-md px-3 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs"
            />
            <select
              value={socialStatusFilter}
              onChange={(e) => setSocialStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E0DCCF] rounded-xl text-xs font-bold"
            >
              <option value="ALL">सभी (ALL)</option>
              <option value="pending">लंबित (Pending)</option>
              <option value="approved">स्वीकृत (Approved)</option>
              <option value="published">प्रकाशित (Published)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSocialList.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] shadow-2xs">
                <h4 className="text-sm font-bold text-[#2C3327] mb-1">{s.title}</h4>
                <p className="text-xs text-[#8C8675] mb-2">{s.description}</p>
                <p className="text-[10px] text-[#8C8675] mb-4">प्रस्तुतकर्ता: {s.submitterName} | स्थान: {s.location}</p>

                <div className="flex items-center gap-2">
                  {s.status === 'pending' && (
                    <button
                      onClick={() => updateSocialWorkStatus(s.id, 'approved')}
                      className="px-3 py-1 bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      स्वीकृत करें (Approve)
                    </button>
                  )}
                  <button
                    onClick={() => deleteSocialWork(s.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    हटाएं (Delete)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC INFO */}
      {activeTab === 'public-info' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInfoList.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] shadow-2xs">
                <h4 className="text-sm font-bold text-[#2C3327] mb-1">{p.name} ({p.mobile})</h4>
                <p className="text-xs text-[#8C8675] mb-2">{p.information}</p>
                <div className="flex items-center gap-2 mt-4">
                  {p.status === 'pending' && (
                    <button
                      onClick={() => updatePublicInfoStatus(p.id, 'approved')}
                      className="px-3 py-1 bg-green-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      स्वीकृत करें
                    </button>
                  )}
                  <button
                    onClick={() => deletePublicInfo(p.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    हटाएं
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div>
          <form onSubmit={handleCreateAnnouncement} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] mb-6">
            <h4 className="text-sm font-bold text-[#2C3327] mb-3">नयी घोषणा जारी करें (Publish Announcement)</h4>
            <input
              type="text"
              required
              placeholder="घोषणा का शीर्षक"
              value={newAnnTitle}
              onChange={(e) => setNewAnnTitle(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
            />
            <textarea
              required
              rows={3}
              placeholder="घोषणा का विवरण"
              value={newAnnContent}
              onChange={(e) => setNewAnnContent(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
            />
            <button type="submit" className="px-4 py-2 bg-[#4B634D] text-white rounded-xl text-xs font-bold cursor-pointer">
              प्रकाशित करें (Publish)
            </button>
          </form>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="bg-white p-4 rounded-xl border border-[#E0DCCF] flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-extrabold text-[#2C3327]">{a.title}</h5>
                  <p className="text-[11px] text-[#8C8675]">{a.content}</p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-red-600 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EVENTS */}
      {activeTab === 'events' && (
        <div>
          <form onSubmit={handleCreateEventSubmit} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] mb-6">
            <h4 className="text-sm font-bold text-[#2C3327] mb-3">नया कार्यक्रम जोड़ें (Add Event)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                required
                placeholder="कार्यक्रम शीर्षक *"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="समय (उदा. 10:00 AM)"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="स्थान (उदा. रसूलपुर)"
                value={newEventLoc}
                onChange={(e) => setNewEventLoc(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
            </div>
            <textarea
              rows={2}
              placeholder="विवरण..."
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
            />
            <button type="submit" className="px-4 py-2 bg-[#4B634D] text-white rounded-xl text-xs font-bold cursor-pointer">
              कार्यक्रम सहेजें (Save Event)
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded-xl border border-[#E0DCCF]">
                <h5 className="text-xs font-extrabold text-[#2C3327]">{e.title || e.name}</h5>
                <p className="text-[10px] text-[#8C8675]">{e.date} | {e.location}</p>
                <p className="text-xs text-[#8C8675] my-2">{e.description}</p>
                <div className="flex items-center gap-2">
                  <select
                    value={e.status}
                    onChange={(evt) => updateEventStatus(e.id, evt.target.value as EventStatus)}
                    className="text-[10px] px-2 py-1 bg-[#F0EDE4] rounded-lg border font-bold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <button onClick={() => deleteEvent(e.id)} className="p-1 text-red-600 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: GALLERY */}
      {activeTab === 'gallery' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="bg-white rounded-xl border border-[#E0DCCF] overflow-hidden p-2">
                <img src={g.photoUrl} alt={g.caption} className="w-full h-32 object-cover rounded-lg mb-2" />
                <p className="text-xs font-bold text-[#2C3327] truncate">{g.caption}</p>
                <div className="flex items-center justify-between mt-2">
                  {g.status === 'pending' && (
                    <button
                      onClick={() => approveGalleryPhoto(g.id)}
                      className="px-2 py-1 bg-green-700 text-white text-[10px] font-bold rounded-md"
                    >
                      Approve
                    </button>
                  )}
                  <button onClick={() => deleteGalleryItem(g.id)} className="p-1 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ELDERS */}
      {activeTab === 'elders' && (
        <div>
          <form onSubmit={handleAddElderSubmit} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] mb-6">
            <h4 className="text-sm font-bold text-[#2C3327] mb-3">बुजुर्ग सदस्य का रिकॉर्ड जोड़ें</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                required
                placeholder="बुजुर्ग का नाम *"
                value={elderName}
                onChange={(e) => setElderName(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
              <input
                type="tel"
                placeholder="संपर्क नंबर"
                value={elderMobile}
                onChange={(e) => setElderMobile(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="स्थान (उदा. रसूलपुर)"
                value={elderLocation}
                onChange={(e) => setElderLocation(e.target.value)}
                className="px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
              />
            </div>
            <textarea
              rows={2}
              placeholder="विवरण या स्वास्थ्य संबंधी जानकारी..."
              value={elderDetails}
              onChange={(e) => setElderDetails(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs"
            />
            <button type="submit" className="px-4 py-2 bg-[#4B634D] text-white rounded-xl text-xs font-bold cursor-pointer">
              सुरक्षित करें (Save Elder Info)
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elders.map((el) => (
              <div key={el.id} className="bg-white p-4 rounded-xl border border-[#E0DCCF] flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-extrabold text-[#2C3327]">{el.name}</h5>
                  <p className="text-[10px] text-[#8C8675]">{el.location} | {el.mobile || 'नंबर उपलब्ध नहीं'}</p>
                  <p className="text-xs text-[#8C8675] mt-1">{el.details}</p>
                </div>
                <button onClick={() => deleteElder(el.id)} className="p-1.5 text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: HELPLINE */}
      {activeTab === 'helpline' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E0DCCF]">
          <h4 className="text-sm font-bold text-[#2C3327] mb-2">गांव आपातकालीन नंबर निर्देशिका (Helpline Numbers)</h4>
          <p className="text-xs text-[#8C8675] mb-4">यह सूची सीधे हेल्पलाइन अनुभाग में प्रदर्शित होती है।</p>
          <div className="space-y-2">
            <div className="p-3 bg-[#F0EDE4] rounded-xl text-xs font-bold text-[#2C3327]">
              🚨 ग्राम सुरक्षा कक्ष (Village Helpline): +91 8787220423
            </div>
            <div className="p-3 bg-[#F0EDE4] rounded-xl text-xs font-bold text-[#2C3327]">
              🏥 प्राथमिक स्वास्थ्य केंद्र: +91 9450706183
            </div>
            <div className="p-3 bg-[#F0EDE4] rounded-xl text-xs font-bold text-[#2C3327]">
              ⚡ UPCL बिजली आपातकालीन सहायता: +91 9450706182
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: SECURITY & AUDIT LOG (Requirements 5 & 7) */}
      {activeTab === 'security' && (
        <div>
          <div className="bg-[#2C3327] text-white p-5 rounded-2xl border border-[#3B4F3D] mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-400">सुरक्षा एवं भूमिका नियंत्रण (Security & RBAC)</h4>
                <p className="text-xs text-[#E0DCCF]">
                  वर्तमान सत्र: {authSession.adminName} ({authSession.adminMobile}) — भूमिक: MAIN ADMIN
                </p>
              </div>
            </div>
            <p className="text-[11px] text-[#E0DCCF] mt-2">
              प्रणाली में केवल ४ पूर्व-स्वीकृत मुख्य एडमिन मोबाइल नंबर ही प्रशासनिक अधिकार रखते हैं।
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0DCCF] overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#F0EDE4] border-b border-[#E0DCCF] flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#2C3327] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4B634D]" />
                <span>एडमिन गतिविधि लॉग (Audit / Activity History Log)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#8C8675]">{auditLogs.length} रिकॉर्ड्स</span>
            </div>

            <div className="divide-y divide-[#E0DCCF]">
              {auditLogs.length === 0 ? (
                <p className="p-6 text-xs text-center text-[#8C8675]">कोई सुरक्षा या ऑडिट लॉग उपलब्ध नहीं है।</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F0EDE4]/40 transition">
                    <div>
                      <p className="text-xs font-bold text-[#2C3327]">{log.action}</p>
                      <p className="text-[10px] text-[#8C8675]">
                        प्रभावित रिकॉर्ड: <span className="font-semibold text-[#2C3327]">{log.recordAffected}</span>
                      </p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-[10px] font-bold text-[#4B634D]">{log.adminName}</p>
                      <p className="text-[9px] font-mono text-[#8C8675]">{new Date(log.timestamp).toLocaleString('hi-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 9. VILLAGES MANAGEMENT TAB (Super Admin & Village Admin) ── */}
      {activeTab === 'villages' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#131B2E] p-5 rounded-2xl border border-[#E0DCCF] dark:border-slate-800 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-[#2C3327] dark:text-white flex items-center gap-2">
                <span>🏡 ग्राम इकाइयां (Village Units)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  {villages.length} ग्राम पंजीकृत
                </span>
              </h3>
              <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1">
                {isSuperAdmin
                  ? '🌐 ग्लोबल सुपर एडमिन: आप सभी ग्राम इकाइयों को जोड़, संपादित अथवा हटा सकते हैं।'
                  : '🏡 ग्राम एडमिन: आप अपनी आवंटित ग्राम इकाई का प्रबंधन कर रहे हैं।'}
              </p>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setIsAddVillageOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>नयी ग्राम इकाई जोड़ें (Add Village)</span>
              </button>
            )}
          </div>

          {/* Add Village Form Modal / Inline Box */}
          {isAddVillageOpen && (
            <div className="bg-emerald-50/50 dark:bg-slate-900/80 p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#2C3327] dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
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
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    ग्राम नाम (अंग्रेजी में) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rasoolpur"
                    value={newVilName}
                    onChange={(e) => setNewVilName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    ग्राम नाम (हिंदी में) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. रसूलपुर"
                    value={newVilNameHindi}
                    onChange={(e) => setNewVilNameHindi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    ग्राम पंचायत का नाम
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. बहेरा"
                    value={newVilGramPanchayat}
                    onChange={(e) => setNewVilGramPanchayat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    जनपद (District)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Jaunpur / जौनपुर"
                    value={newVilDistrict}
                    onChange={(e) => setNewVilDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">
                    नारा / टैगलाइन
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. युवा शक्ति से ग्रामोदय की ओर"
                    value={newVilTagline}
                    onChange={(e) => setNewVilTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 text-[#2C3327] dark:text-white border border-[#E0DCCF] dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
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
                  className={`bg-white dark:bg-[#131B2E] p-5 rounded-2xl border transition shadow-2xs flex flex-col justify-between ${
                    isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-[#E0DCCF] dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏡</span>
                        <h4 className="text-sm font-extrabold text-[#2C3327] dark:text-white">
                          {vil.nameHindi} ({vil.name})
                        </h4>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-full border border-emerald-300 dark:border-emerald-700">
                          सक्रिय (Active)
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-[#8C8675] dark:text-slate-400 mt-2">
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
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        "{vil.taglineHindi || 'युवा शक्ति से ग्रामोदय की ओर'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-[#E0DCCF] dark:border-slate-800">
                    <button
                      onClick={() => setActiveVillageId(vil.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#F0EDE4] dark:bg-slate-800 text-[#2C3327] dark:text-slate-300 hover:bg-[#E4DFD3]'
                      }`}
                    >
                      {isCurrent ? '✓ चयनित ग्राम' : 'इस ग्राम को चुनें'}
                    </button>

                    {isSuperAdmin && villages.length > 1 && (
                      <button
                        onClick={() => setDeleteConfirmVillageId(vil.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
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

          {/* Delete Village Confirmation Modal */}
          {deleteConfirmVillageId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-300 dark:border-red-800 text-center shadow-xl space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
                <h4 className="text-sm font-extrabold text-[#2C3327] dark:text-white">
                  क्या आप इस ग्राम इकाई को हटाना चाहते हैं?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  यह क्रिया केवल सुपर एडमिन द्वारा की जा सकती है।
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setDeleteConfirmVillageId(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    onClick={handleDeleteVillageConfirmed}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    हां, हटाएं (Delete)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 11: SUPABASE CONNECTION SETUP */}
      {activeTab === 'supabase-setup' && (
        <div className="py-2">
          <SupabaseSetupScreen inlineMode={true} />
        </div>
      )}

      {/* TAB 12: API & INTEGRATIONS */}
      {activeTab === 'api-integrations' && (
        <div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-emerald-900">Supabase डेटाबेस एवं क्लाउड कनेक्ट</h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  ग्रामोदय यूथ मंच का Supabase प्रोजेक्ट कनेक्ट करें (URL और Publishable/Anon Key).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('supabase-setup')}
              className="px-4 py-2 bg-[#4B634D] hover:bg-[#3B4F3D] text-white text-xs font-bold rounded-xl shadow-xs transition flex-shrink-0 cursor-pointer"
            >
              ⚡ Supabase कनेक्शन सेट करें →
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">सुरक्षित API एवं बाहरी सेवा एकीकरण (API Integrations Settings)</h4>
              <p className="text-[11px] text-amber-800 mt-1">

                सभी API कुंजियाँ और सीक्रेट्स केवल सर्वर-साइड सुरक्षित पर्यावरण चर (Environment Variables) में संगृहीत होते हैं। ये कभी भी ब्राउज़र या फ्रंटएंड कोड में उजागर नहीं किए जाते हैं।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((int) => (
              <div key={int.id} className="bg-white p-5 rounded-2xl border border-[#E0DCCF] shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm font-extrabold text-[#2C3327] flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-[#4B634D]" />
                      <span>{int.name}</span>
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        int.status === 'Connected'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {int.status}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[#8C8675] bg-[#F0EDE4] p-2 rounded-lg mb-4 truncate">
                    कूंजी प्रदर्शित: <span className="text-[#2C3327] font-bold">{int.keyMasked}</span>
                  </p>

                  {testResultMsg && testResultMsg.id === int.id && (
                    <div
                      className={`text-[11px] font-bold p-2.5 rounded-lg mb-4 ${
                        testResultMsg.type === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {testResultMsg.msg}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#E0DCCF]">
                  <button
                    onClick={() => {
                      setSelectedIntegration(int);
                      setConfigApiKey('');
                      setIsConfigModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-[#4B634D] text-white text-xs font-bold rounded-xl hover:bg-[#3B4F3D] transition cursor-pointer"
                  >
                    Configure
                  </button>

                  <button
                    onClick={() => handleTestIntegration(int.id)}
                    className="py-2 px-3 bg-[#F0EDE4] hover:bg-[#E0DCCF] text-[#2C3327] text-xs font-bold rounded-xl transition cursor-pointer"
                    title="कनेक्शन टेस्ट करें"
                  >
                    Test
                  </button>

                  {int.status === 'Connected' && (
                    <button
                      onClick={() => setDisconnectConfirmId(int.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
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

      {/* TAB 12: SETTINGS & PASSWORD */}
      {activeTab === 'settings' && (
        <div className="max-w-xl bg-white p-6 rounded-2xl border border-[#E0DCCF] shadow-2xs">
          <h4 className="text-sm font-bold text-[#2C3327] mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#4B634D]" />
            <span>एडमिन पासवर्ड बदलें (Change Password)</span>
          </h4>

          {pwdMsg && <p className="text-xs font-bold text-[#D97706] mb-3">{pwdMsg}</p>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1">नया पासवर्ड *</label>
              <input
                type="password"
                required
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="नया गुप्त पासवर्ड दर्ज करें"
                className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1">पासवर्ड पुनः दर्ज करें *</label>
              <input
                type="password"
                required
                value={confirmAdminPassword}
                onChange={(e) => setConfirmAdminPassword(e.target.value)}
                placeholder="नया पासवर्ड पुनः दर्ज करें"
                className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs text-[#2C3327]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#4B634D] text-white text-xs font-bold rounded-xl hover:bg-[#3B4F3D] transition cursor-pointer"
            >
              पासवर्ड अपडेट करें (Update Password)
            </button>
          </form>

          {/* DATA JSON MANAGEMENT CARD */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0DCCF] shadow-2xs mt-6">
            <h4 className="text-sm font-bold text-[#2C3327] mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#4B634D]" />
              <span>डेटा बेस प्रबंधन (Data JSON Management & Backup)</span>
            </h4>
            <p className="text-xs text-[#8C8675] mb-4">
              सर्वर के लाइव डेटाबेस (data.json) को बैकअप (डाउनलोड) करें, फ़ाइल से रिस्टोर (अपलोड) करें या शुरुआती स्थिति में रीसेट करें।
            </p>

            {dataJsonMsg && (
              <div className="p-3 bg-[#F0EDE4] border border-[#E0DCCF] text-[#2C3327] text-xs font-bold rounded-xl mb-4">
                {dataJsonMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={exportDataJson}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4B634D] text-white text-xs font-bold rounded-xl hover:bg-[#3B4F3D] transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>डाटा JSON डाउनलोड करें (Export data.json)</span>
              </button>

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F0EDE4] hover:bg-[#E0DCCF] text-[#2C3327] text-xs font-bold rounded-xl border border-[#E0DCCF] transition cursor-pointer">
                <Plus className="w-4 h-4 text-[#4B634D]" />
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
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>रीसेट डेटा (Reset Database)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {resetDataConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E0DCCF] text-center shadow-xl">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-[#2C3327] mb-2">क्या आप डेटा बेस को रीसेट करना चाहते हैं?</h3>
            <p className="text-xs text-[#8C8675] mb-6">Are you sure you want to reset all data to default initial state?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setResetDataConfirmOpen(false)}
                className="px-4 py-2 bg-[#F0EDE4] text-[#2C3327] text-xs font-bold rounded-xl hover:bg-[#E0DCCF]"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl hover:bg-red-800"
              >
                हां, रीसेट करें (Reset All)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deleteConfirmMemberId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E0DCCF] text-center shadow-xl">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-[#2C3327] mb-2">क्या आप सदस्य को हटाना चाहते हैं?</h3>
            <p className="text-xs text-[#8C8675] mb-6">Are you sure you want to remove this member?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmMemberId(null)}
                className="px-4 py-2 bg-[#F0EDE4] text-[#2C3327] text-xs font-bold rounded-xl hover:bg-[#E0DCCF]"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={handleDeleteMemberConfirmed}
                className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl hover:bg-red-800"
              >
                हां, हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Integration Confirmation Modal */}
      {disconnectConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E0DCCF] text-center shadow-xl">
            <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-[#2C3327] mb-2">क्या आप इस सेवा को डिस्कनेक्ट करना चाहते हैं?</h3>
            <p className="text-xs text-[#8C8675] mb-6">Are you sure you want to disconnect this service?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDisconnectConfirmId(null)}
                className="px-4 py-2 bg-[#F0EDE4] text-[#2C3327] text-xs font-bold rounded-xl hover:bg-[#E0DCCF]"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={handleDisconnectConfirmed}
                className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-xl hover:bg-red-800"
              >
                हां, डिस्कनेक्ट करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Integration Modal */}
      {isConfigModalOpen && selectedIntegration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#E0DCCF] shadow-xl">
            <h3 className="text-sm font-extrabold text-[#2C3327] mb-1">
              {selectedIntegration.name} कॉन्फ़िगरेशन
            </h3>
            <p className="text-[11px] text-[#8C8675] mb-4">
              सर्वर-साइड सुरक्षित कुंजी प्रदान करें। यह मान सर्वर डेटाबेस में मास्क करके सहेजा जाता है।
            </p>

            <form onSubmit={handleSaveIntegration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">API Key / Credential Token</label>
                <input
                  type="password"
                  required
                  value={configApiKey}
                  onChange={(e) => setConfigApiKey(e.target.value)}
                  placeholder="उदा. sk_live_••••••••••••"
                  className="w-full px-3 py-2 bg-[#F0EDE4] border border-[#E0DCCF] rounded-xl text-xs font-mono text-[#2C3327]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-[#F0EDE4] text-[#2C3327] text-xs font-bold rounded-xl hover:bg-[#E0DCCF]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4B634D] text-white text-xs font-bold rounded-xl hover:bg-[#3B4F3D]"
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
