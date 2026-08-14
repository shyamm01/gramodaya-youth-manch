'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volume2, Plus, Calendar, Shield, Trash2, Send, Share2 } from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Textarea,
  Dialog,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../ui';
import { WhatsAppIcon } from '../common';

export const AnnouncementsSection: React.FC = () => {
  const {
    announcements,
    publicInfos,
    publishAnnouncement,
    deleteAnnouncement,
    submitPublicInfo,
    authSession,
    updatePublicInfoStatus,
    deletePublicInfo,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('announcements');
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annMsg, setAnnMsg] = useState('');

  // Public Info Form State
  const [infoName, setInfoName] = useState('');
  const [infoMobile, setInfoMobile] = useState('');
  const [infoText, setInfoText] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const approvedInfos = publicInfos.filter((i) => i.status === 'approved');
  const pendingInfos = publicInfos.filter((i) => i.status === 'pending');

  const handlePublishAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const res = await publishAnnouncement(annTitle, annContent);
    if (res.success) {
      setAnnMsg('सूचना सफलतापूर्वक प्रकाशित हुई!');
      setAnnTitle('');
      setAnnContent('');
      setTimeout(() => {
        setIsAnnModalOpen(false);
        setAnnMsg('');
      }, 1200);
    } else {
      setAnnMsg(res.error || 'त्रुटि हुई।');
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoText) return;

    const res = await submitPublicInfo({
      name: infoName || 'ग्रामवासी',
      mobile: infoMobile || 'Hidden',
      information: infoText,
    });

    if (res.success) {
      setInfoMsg('आपकी जानकारी प्राप्त हो गई है और एडमिन स्वीकृति की प्रतीक्षा है।');
      setInfoName('');
      setInfoMobile('');
      setInfoText('');
      setTimeout(() => {
        setIsInfoModalOpen(false);
        setInfoMsg('');
      }, 2000);
    } else {
      setInfoMsg('त्रुटि हुई।');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2C3327] dark:text-white tracking-tight flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t('nav.announcements')}</span>
          </h1>
          <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1 font-medium">
            {t('home.noticesSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {authSession.isAdminLoggedIn && (
            <Button
              variant="amber"
              size="default"
              onClick={() => setIsAnnModalOpen(true)}
              className="rounded-xl font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>{t('announcements.publishNotice')}</span>
            </Button>
          )}

          <Button
            variant="default"
            size="default"
            onClick={() => setIsInfoModalOpen(true)}
            className="rounded-xl font-bold cursor-pointer"
          >
            <Send className="w-4 h-4 mr-1" />
            <span>{t('announcements.tabPublicInfo')}</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="announcements" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="announcements">
            {t('announcements.tabAnnouncements')} ({announcements.length})
          </TabsTrigger>
          <TabsTrigger value="public-info">
            {t('announcements.tabPublicInfo')} ({approvedInfos.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Official Announcements */}
        <TabsContent value="announcements">
          {announcements.length === 0 ? (
            <Card className="p-10 text-center text-[#8C8675] dark:text-slate-400">
              <Volume2 className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#2C3327] dark:text-white">अभी कोई सार्वजनिक सूचना उपलब्ध नहीं है।</p>
              <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1">ग्रामोदय यूथ मंच की आधिकारिक घोषणाएं यहाँ प्रकाशित होंगी।</p>
            </Card>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {announcements.map((ann) => {
                const shareText = encodeURIComponent(
                  `*ग्रामोदय यूथ मंच - आधिकारिक घोषणा*\n\n📢 *${ann.title}*\n\n${ann.content}\n\n📅 दिनांक: ${ann.date}\n— ${ann.publishedBy}`
                );
                const waUrl = `https://wa.me/?text=${shareText}`;

                return (
                  <Card key={ann.id} className="p-5 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                        <Shield className="w-3 h-3" />
                        <span>{ann.publishedBy}</span>
                      </Badge>
                      <span className="text-xs text-[#8C8675] dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {ann.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#2C3327] dark:text-white text-base mb-2">{ann.title}</h3>
                    <p className="text-xs sm:text-sm text-[#2C3327] dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">{ann.content}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#E0DCCF] dark:border-slate-800">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>व्हाट्सएप पर शेयर करें</span>
                      </a>

                      {authSession.isAdminLoggedIn && (
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => deleteAnnouncement(ann.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>हटाएं</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Public Information Submissions */}
        <TabsContent value="public-info">
          {/* Admin Pending Info Reviews */}
          {authSession.isAdminLoggedIn && pendingInfos.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-3">
                स्वीकृति हेतु लंबित जन सूचनाएं ({pendingInfos.length})
              </h3>
              <div className="space-y-3">
                {pendingInfos.map((pi) => (
                  <Card key={pi.id} className="p-4 shadow-2xs">
                    <p className="text-xs sm:text-sm font-medium text-[#2C3327] dark:text-white mb-2">{pi.information}</p>
                    <div className="flex items-center justify-between text-xs text-[#8C8675] dark:text-slate-400 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
                      <span>प्रेषक: {pi.name} ({pi.mobile})</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => updatePublicInfoStatus(pi.id, 'approved')}
                        >
                          स्वीकार करें
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => deletePublicInfo(pi.id)}
                        >
                          हटाएं
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {approvedInfos.length === 0 ? (
            <Card className="p-10 text-center text-[#8C8675] dark:text-slate-400">
              <Volume2 className="w-10 h-10 text-[#8C8675] dark:text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#2C3327] dark:text-white">अभी कोई सार्वजनिक सूचना उपलब्ध नहीं है।</p>
              <p className="text-xs text-[#8C8675] dark:text-slate-400 mt-1">ग्रामवासियों द्वारा प्रेषित सूचनाएं यहाँ दिखाई देंगी।</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedInfos.map((info) => {
                const shareText = encodeURIComponent(
                  `*ग्रामोदय यूथ मंच - जन सूचना*\n\n📝 ${info.information}\n— प्रेषक: ${info.name}\nग्राम रसूलपुर`
                );
                const waUrl = `https://wa.me/?text=${shareText}`;

                return (
                  <Card key={info.id} className="p-4 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all">
                    <div>
                      <p className="text-xs sm:text-sm text-[#2C3327] dark:text-slate-200 leading-relaxed font-medium mb-3">{info.information}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#8C8675] dark:text-slate-400 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">प्रेषक: {info.name}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>व्हाट्सएप शेयर</span>
                        </a>
                        {authSession.isAdminLoggedIn && (
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => deletePublicInfo(info.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Announcement Modal */}
      <Dialog
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title="नई आधिकारिक घोषणा जारी करें"
        description="ग्राम रसूलपुर के लिए आधिकारिक सूचना प्रकाशित करें।"
      >
        <form onSubmit={handlePublishAnn} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">शीर्षक *</label>
            <Input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="उदा. ग्राम सभा बैठक सूचना"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">घोषणा का विवरण *</label>
            <Textarea
              required
              rows={4}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="पूरी सूचना लिखें..."
            />
          </div>

          {annMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl">
              {annMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAnnModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="amber"
              size="sm"
            >
              प्रकाशित करें
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Submit Public Info Modal */}
      <Dialog
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="अपनी जन सूचना दें"
        description="ग्रामवासियों के साथ साझा करने हेतु सूचना प्रेषित करें।"
      >
        <form onSubmit={handleInfoSubmit} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">आपका नाम *</label>
            <Input
              type="text"
              required
              value={infoName}
              onChange={(e) => setInfoName(e.target.value)}
              placeholder="अपना पूरा नाम लिखें"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">मोबाइल नंबर</label>
            <Input
              type="text"
              value={infoMobile}
              onChange={(e) => setInfoMobile(e.target.value)}
              placeholder="उदा. 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] dark:text-slate-200 mb-1">सूचना का विवरण *</label>
            <Textarea
              required
              rows={4}
              value={infoText}
              onChange={(e) => setInfoText(e.target.value)}
              placeholder="सूचना लिखें..."
            />
          </div>

          {infoMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl whitespace-pre-line">
              {infoMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E0DCCF] dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInfoModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
            >
              {t('common.submit')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
