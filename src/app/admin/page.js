'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { 
  Calendar, MapPin, QrCode, ClipboardList, LogOut, ChevronRight, CheckCircle, 
  ExternalLink, Loader2, Sparkles, Plus, X, Download, Users, Settings, Lock, Edit2, Check, Copy, AlertCircle, Scan
} from 'lucide-react';
import CustomFieldsBuilder from '@/components/CustomFieldsBuilder';
import FlyerUpload from '@/components/FlyerUpload';
import dynamic from 'next/dynamic';

// Dynamically import scanner to prevent server-side navigator/window compilation error
const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

export default function AdminDashboard() {
  // Navigation Tabs state: 'programs' | 'members' | 'settings' | 'scanner'
  const [activeTab, setActiveTab] = useState('programs');
  
  // Programs Tab Filter state: 'all' | 'upcoming' | 'past'
  const [programFilter, setProgramFilter] = useState('all');

  // Toggle creation form visibility (modal)
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form Program states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Selection states
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState('');

  // Attendance scanner states
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const [processingScan, setProcessingScan] = useState(false);
  const [lookupIdentifier, setLookupIdentifier] = useState('');
  const [lookupProgramId, setLookupProgramId] = useState('');
  const [processingManualMark, setProcessingManualMark] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Member editing states
  const [editingMember, setEditingMember] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editKc, setEditKc] = useState('');
  const [editChapter, setEditChapter] = useState('');
  const [editCareGroup, setEditCareGroup] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [savingMember, setSavingMember] = useState(false);

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (res.ok) setPrograms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (res.ok) setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'members') fetchMembers();
    if (tab === 'programs') fetchPrograms();
  };

  const handleTitleChange = (val) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          slug,
          startDate,
          endDate,
          venue,
          flyerUrl,
          customFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create program');

      setTitle('');
      setDescription('');
      setSlug('');
      setStartDate('');
      setEndDate('');
      setVenue('');
      setFlyerUrl('');
      setCustomFields([]);
      setShowCreateForm(false);
      fetchPrograms();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectProgram = async (program) => {
    setSelectedProgram(program);
    setLoadingRegs(true);
    try {
      const res = await fetch(`/api/programs/${program.id}/registrations`);
      const data = await res.json();
      if (res.ok) setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegs(false);
    }
  };

  const startEditMember = (m) => {
    setEditingMember(m);
    setEditFirstName(m.firstName);
    setEditLastName(m.lastName);
    setEditEmail(m.email);
    setEditPhone(m.phone);
    setEditKc(m.kcUsername);
    setEditChapter(m.chapter);
    setEditCareGroup(m.careGroup);
    setEditRole(m.role);
    setEditOccupation(m.occupation);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setSavingMember(true);
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone,
          kcUsername: editKc,
          chapter: editChapter,
          careGroup: editCareGroup,
          role: editRole,
          occupation: editOccupation
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingMember(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setUpdatingPassword(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    // Avoid double trigger if processing or if the scanned text matches the current display value
    if (processingScan || scanResult === decodedText) return;

    setProcessingScan(true);
    setScanResult(decodedText);
    setScanError('');
    setScanSuccessMsg('');

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: decodedText }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Check-in failed');
      }

      setScanSuccessMsg(data.message);
      
      // Close the scanner camera viewport for success screen
      setIsScannerOpen(false);

      // If we are currently viewing the registrants list of the program, refresh it
      if (selectedProgram) {
        selectProgram(selectedProgram);
      }

    } catch (err) {
      setScanError(err.message);
      setIsScannerOpen(false);
    }
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    if (!lookupProgramId) {
      alert('Please select a program.');
      return;
    }
    if (!lookupIdentifier) {
      alert('Please enter an email or phone number.');
      return;
    }

    setProcessingManualMark(true);
    setScanError('');
    setScanSuccessMsg('');

    // Detect if identifier looks like email or phone
    const isEmail = lookupIdentifier.includes('@');
    const payload = {
      programId: lookupProgramId,
      [isEmail ? 'email' : 'phone']: lookupIdentifier.trim()
    };

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      setScanSuccessMsg(data.message);
      setLookupIdentifier('');

      // Refresh list if the current program matches
      if (selectedProgram && selectedProgram.id === lookupProgramId) {
        selectProgram(selectedProgram);
      }

      setTimeout(() => {
        setScanSuccessMsg('');
      }, 3000);
    } catch (err) {
      setScanError(err.message);
      setTimeout(() => {
        setScanError('');
      }, 4000);
    } finally {
      setProcessingManualMark(false);
    }
  };

  const downloadRegistrationsCSV = (programTitle, regsList) => {
    if (regsList.length === 0) return;
    
    // Set headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Phone,KingsChat,Chapter,Care Group,Role,Occupation,Attended,Check-in Date,Registration Date";
    
    // Add dynamic custom responses headers if any
    const customKeys = Array.from(new Set(regsList.flatMap(r => Object.keys(r.fieldResponses || {}))));
    if (customKeys.length > 0) {
      csvContent += "," + customKeys.join(",");
    }
    csvContent += "\n";

    regsList.forEach((r) => {
      let row = `"${r.member.firstName} ${r.member.lastName}","${r.member.email}","${r.member.phone}","${r.member.kcUsername}","${r.member.chapter}","${r.member.careGroup}","${r.member.role}","${r.member.occupation}","${r.attended ? 'Yes' : 'No'}","${r.attendedAt ? new Date(r.attendedAt).toLocaleString() : ''}","${new Date(r.registeredAt).toLocaleDateString()}"`;
      
      customKeys.forEach((key) => {
        const val = r.fieldResponses?.[key] || "";
        row += `,"${String(val).replace(/"/g, '""')}"`;
      });
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_registrants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadMembersCSV = () => {
    if (members.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "First Name,Last Name,Email,Phone,KingsChat,Chapter,Care Group,Role,Occupation,Joined Date,Total Programs Registered\n";

    members.forEach((m) => {
      const row = `"${m.firstName}","${m.lastName}","${m.email}","${m.phone}","${m.kcUsername}","${m.chapter}","${m.careGroup}","${m.role}","${m.occupation}","${new Date(m.createdAt).toLocaleDateString()}","${m.registrations?.length || 0}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "thza5_members_profile_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredPrograms = () => {
    const now = new Date();
    return programs.filter((p) => {
      if (programFilter === 'upcoming') {
        return new Date(p.startDate) >= now && p.status !== 'COMPLETED';
      }
      if (programFilter === 'past') {
        return new Date(p.startDate) < now || p.status === 'COMPLETED';
      }
      return true; // All
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-neutral-900 flex flex-col relative overflow-hidden antialiased">
      {/* Soft, High-End Luxury Lighting */}
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#A8006E]/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[#FFDF00]/5 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#A8006E03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-neutral-200/60 bg-[#FDFBFD]/60 backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center shrink-0 p-1.5 bg-white rounded-xl shadow-md border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-widest text-neutral-900 uppercase">
              THE HAVEN <span className="text-[#A8006E] font-semibold">ZONE A5</span>
            </h1>
            <p className="text-[9px] text-[#E5007F] font-bold uppercase tracking-[0.35em] mt-0.5">Portal Admin</p>
          </div>
        </div>

        {/* Tab switcher navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-card/50 border border-neutral-200 p-1 rounded-lg">
          <button
            onClick={() => handleTabChange('programs')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === 'programs' ? 'bg-[#A8006E] text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Programs
          </button>
          <button
            onClick={() => handleTabChange('scanner')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === 'scanner' ? 'bg-[#A8006E] text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            Scanner
          </button>
          <button
            onClick={() => handleTabChange('members')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === 'members' ? 'bg-[#A8006E] text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Members
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#A8006E] text-white shadow-md' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Security
          </button>
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#FFDF00]" />
          Sign Out
        </button>
      </header>

      {/* Tab Switcher for Mobile */}
      <nav className="flex md:hidden border-b border-neutral-200 bg-white p-2 justify-around text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        <button 
          onClick={() => handleTabChange('programs')}
          className={`pb-1 ${activeTab === 'programs' ? 'text-[#A8006E] border-b-2 border-[#A8006E]' : 'text-neutral-500'}`}
        >
          Programs
        </button>
        <button 
          onClick={() => handleTabChange('scanner')}
          className={`pb-1 ${activeTab === 'scanner' ? 'text-[#A8006E] border-b-2 border-[#A8006E]' : 'text-neutral-500'}`}
        >
          Scanner
        </button>
        <button 
          onClick={() => handleTabChange('members')}
          className={`pb-1 ${activeTab === 'members' ? 'text-[#A8006E] border-b-2 border-[#A8006E]' : 'text-neutral-500'}`}
        >
          Members
        </button>
        <button 
          onClick={() => handleTabChange('settings')}
          className={`pb-1 ${activeTab === 'settings' ? 'text-[#A8006E] border-b-2 border-[#A8006E]' : 'text-neutral-500'}`}
        >
          Security
        </button>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 z-10 animate-fade-in-up">
        
        {/* Programs Tab View */}
        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Modal program creation setup */}
            {showCreateForm && (
              <div 
                onClick={() => setShowCreateForm(false)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="glass w-full max-w-3xl p-6 md:p-8 rounded-2xl border border-border glow-gold space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar"
                >
                  <div className="border-b border-border pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-secondary" />
                        One-Click Program Setup
                      </h2>
                      <p className="text-xs text-foreground/50">Setup a new program and generate its registration links instantly.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-foreground/45 hover:text-foreground p-1 transition-colors cursor-pointer border border-border rounded-lg bg-card"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                      <p>{formError}</p>
                    </div>
                  )}

                  <form onSubmit={handleCreateProgram} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">Program Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="e.g. Money Night 4.0"
                          className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">URL Slug</label>
                        <input
                          type="text"
                          required
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="money-night-4"
                          className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Program overview and info..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">Start Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">End Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">Venue</label>
                      <input
                        type="text"
                        required
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="e.g. Haven Center Auditorium"
                        className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                      />
                    </div>

                    <FlyerUpload value={flyerUrl} onChange={setFlyerUrl} />

                    <CustomFieldsBuilder fields={customFields} onChange={setCustomFields} />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating program...
                        </>
                      ) : (
                        'Launch Program Setup'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Programs Listing Area */}
            <section className="lg:col-span-12 space-y-6">
              <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 mb-4 gap-2">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Launches
                    </h3>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="py-1 px-3 bg-primary text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-primary-dark transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Program
                    </button>
                  </div>
                  {/* Internal Filter Tabs */}
                  <div className="flex border border-border rounded bg-card p-0.5 text-xs">
                    <button 
                      onClick={() => setProgramFilter('all')}
                      className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${programFilter === 'all' ? 'bg-primary text-white' : 'text-foreground/70'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setProgramFilter('upcoming')}
                      className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${programFilter === 'upcoming' ? 'bg-primary text-white' : 'text-foreground/70'}`}
                    >
                      Upcoming
                    </button>
                    <button 
                      onClick={() => setProgramFilter('past')}
                      className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${programFilter === 'past' ? 'bg-primary text-white' : 'text-foreground/70'}`}
                    >
                      Past
                    </button>
                  </div>
                </div>

                {loadingPrograms ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-foreground/50">Fetching programs...</span>
                  </div>
                ) : getFilteredPrograms().length === 0 ? (
                  <div className="text-center py-10 text-foreground/45 text-sm">
                    No active setups launched matching filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredPrograms().map((prog) => (
                      <div
                        key={prog.id}
                        onClick={() => selectProgram(prog)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedProgram?.id === prog.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-border/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground">{prog.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-foreground/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {new Date(prog.startDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-secondary" />
                              {prog.venue}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          {prog.qrCodeUrl && (
                            <div 
                              className="relative group/qr bg-white p-1 rounded border border-border flex items-center justify-center cursor-default"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={prog.qrCodeUrl} 
                                alt="Program QR" 
                                className="w-8 h-8 object-contain"
                              />
                              <a
                                href={prog.qrCodeUrl}
                                download={`${prog.slug}-qrcode.png`}
                                className="absolute inset-0 bg-primary/95 text-white flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity rounded"
                                title="Download QR Code"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                          <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                            {prog._count?.registrations || 0} Regs
                          </span>
                          <ChevronRight className="w-4 h-4 text-foreground/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registrations viewer modal/panel if program is selected */}
              {selectedProgram && (
                <div className="glass p-6 rounded-2xl border border-primary/20 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{selectedProgram.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <a
                          href={`/register/${selectedProgram.slug}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          View Registration Page
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => {
                            const link = `${window.location.protocol}//${window.location.host}/register/${selectedProgram.slug}`;
                            navigator.clipboard.writeText(link);
                            setCopiedSlug(selectedProgram.slug);
                            setTimeout(() => setCopiedSlug(''), 2000);
                          }}
                          className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedSlug === selectedProgram.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied Link!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProgram(null)}
                      className="text-foreground/40 hover:text-foreground p-1 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* QR Code and CSV download links */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => downloadRegistrationsCSV(selectedProgram.title, registrations)}
                        disabled={registrations.length === 0}
                        className="flex-1 py-2 px-3 rounded-lg border border-primary/20 hover:bg-primary/5 text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        <Download className="w-4 h-4" />
                        Download Registrations CSV
                      </button>
                    </div>

                    {selectedProgram.qrCodeUrl && (
                      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedProgram.qrCodeUrl}
                          alt="Program QR Link"
                          className="w-20 h-20 rounded bg-white p-1 shrink-0 border border-border"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-foreground/75 flex items-center gap-1 uppercase tracking-wide">
                            <QrCode className="w-3.5 h-3.5 text-secondary" />
                            Program QR Link
                          </h4>
                          <p className="text-[11px] text-foreground/50 mt-1 font-medium">Scan to instantly load the registration form.</p>
                          <a
                            href={selectedProgram.qrCodeUrl}
                            download={`${selectedProgram.slug}-qrcode.png`}
                            className="text-xs text-secondary hover:underline font-semibold inline-block mt-2"
                          >
                            Download QR Image
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Registrations List */}
                    <div>
                      <h4 className="text-xs font-bold text-foreground/60 uppercase tracking-wide mb-3">Registrants List</h4>
                      {loadingRegs ? (
                        <div className="flex items-center gap-2 py-4 justify-center text-xs text-foreground/40">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          Loading registrations...
                        </div>
                      ) : registrations.length === 0 ? (
                        <div className="text-center py-6 text-foreground/45 text-xs border border-dashed border-border rounded-lg">
                          No registrations recorded yet.
                        </div>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                          {registrations.map((reg) => (
                            <div key={reg.id} className="bg-card p-3 rounded-lg border border-border text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-foreground">
                                  {reg.member.firstName} {reg.member.lastName}
                                </span>
                                <span className="text-[10px] text-foreground/45">
                                  {new Date(reg.registeredAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-foreground/60 grid grid-cols-2 gap-x-2 gap-y-0.5">
                                <span>Phone: {reg.member.phone}</span>
                                <span>KC: {reg.member.kcUsername}</span>
                                <span>Chapter: {reg.member.chapter}</span>
                                <span>Role: {reg.member.role}</span>
                                <span className="col-span-2 mt-1">
                                  Attendance Status: {' '}
                                  <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                                    reg.attended ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {reg.attended ? `Present (Checked-in: ${new Date(reg.attendedAt).toLocaleString()})` : 'Absent'}
                                  </span>
                                </span>
                              </div>
                              {Object.keys(reg.fieldResponses || {}).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border/60 text-[10px] space-y-0.5">
                                  <span className="font-semibold uppercase tracking-wider text-foreground/45">Custom responses:</span>
                                  {Object.entries(reg.fieldResponses).map(([key, val]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-foreground/50">{key}:</span>
                                      <span className="text-foreground/75 font-semibold">{val}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Attendance Scanner Tab View */}
        {activeTab === 'scanner' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="glass p-6 rounded-2xl border border-border space-y-5 text-center">
              <div className="border-b border-border pb-3 flex items-center justify-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Attendance check-in</h3>
              </div>

              {scanSuccessMsg || scanError ? (
                <div className="py-6 flex flex-col items-center justify-center gap-4">
                  {scanSuccessMsg && (
                    <div className="flex flex-col items-center justify-center gap-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 p-6 rounded-xl text-center shadow-lg shadow-emerald-100/50 animate-scale-in w-full">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-900">Check-In Successful</h4>
                        <p className="text-xs font-medium text-emerald-700/90 leading-relaxed">{scanSuccessMsg}</p>
                      </div>
                    </div>
                  )}

                  {scanError && (
                    <div className="flex flex-col items-center justify-center gap-3 bg-rose-50 border border-rose-200/80 text-rose-800 p-6 rounded-xl text-center shadow-lg shadow-rose-100/50 animate-scale-in w-full">
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-rose-900">Check-In Failed</h4>
                        <p className="text-xs font-medium text-rose-700/90 leading-relaxed">{scanError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setScanResult('');
                      setScanSuccessMsg('');
                      setScanError('');
                      setProcessingScan(false);
                      setIsScannerOpen(true);
                    }}
                    className="py-2.5 px-6 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-[1.02] w-full"
                  >
                    Scan Next Ticket
                  </button>
                </div>
              ) : isScannerOpen ? (
                <div className="space-y-4">
                  <QrScanner
                    onScanSuccess={handleScanSuccess}
                    onScanError={(err) => console.log('Scanning...')}
                  />
                  <button
                    onClick={() => setIsScannerOpen(false)}
                    className="py-2 px-4 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Close Camera Viewport
                  </button>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Scan className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Camera stream is offline</h4>
                    <p className="text-xs text-foreground/50">Click below to grant camera access and start scanning.</p>
                  </div>
                  <button
                    onClick={() => {
                      setScanResult('');
                      setScanSuccessMsg('');
                      setScanError('');
                      setProcessingScan(false);
                      setIsScannerOpen(true);
                    }}
                    className="py-2.5 px-6 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Activate QR Scanner Camera
                  </button>
                </div>
              )}

              {/* Manual search check-in section */}
              <div className="border-t border-border pt-5 space-y-4 text-left">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Manual Check-In</h4>
                  <p className="text-[10px] text-neutral-400">Search and check in a member manually using their email or phone number.</p>
                </div>

                <form onSubmit={handleManualAttendance} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Select Launch Event</label>
                    <select
                      required
                      value={lookupProgramId}
                      onChange={(e) => setLookupProgramId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs focus:outline-none focus:border-[#A8006E]"
                    >
                      <option value="">-- Choose Program --</option>
                      {programs.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {prog.title} ({new Date(prog.startDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Identifier (Email or Phone)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. member@example.com / +234..."
                      value={lookupIdentifier}
                      onChange={(e) => setLookupIdentifier(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border text-xs focus:outline-none focus:border-[#A8006E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processingManualMark}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {processingManualMark ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Processing check-in...
                      </>
                    ) : (
                      'Mark Present'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Members Directory Tab View */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Members Directory
                </h2>
                <p className="text-xs text-foreground/50 mt-1">Manage and edit all registering member profile details here.</p>
              </div>
              <button
                onClick={downloadMembersCSV}
                disabled={members.length === 0}
                className="py-2.5 px-4 bg-primary text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Export Members Database
              </button>
            </div>

            {/* Member Editor Form Modal (If active) */}
            {editingMember && (
              <div 
                onClick={() => setEditingMember(null)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="glass w-full max-w-2xl p-6 rounded-2xl border border-primary/20 space-y-4 max-h-[90vh] overflow-y-auto hide-scrollbar"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                      <Edit2 className="w-4 h-4 text-secondary" />
                      Edit Profile: {editingMember.firstName} {editingMember.lastName}
                    </h3>
                    <button onClick={() => setEditingMember(null)} className="text-foreground/50 hover:text-foreground cursor-pointer">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">First Name</label>
                        <input 
                          type="text" required value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Last Name</label>
                        <input 
                          type="text" required value={editLastName} onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Email</label>
                        <input 
                          type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Phone</label>
                        <input 
                          type="text" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">KingsChat</label>
                        <input 
                          type="text" required value={editKc} onChange={(e) => setEditKc(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Chapter</label>
                        <input 
                          type="text" required value={editChapter} onChange={(e) => setEditChapter(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Care Group</label>
                        <input 
                          type="text" required value={editCareGroup} onChange={(e) => setEditCareGroup(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Role</label>
                        <input 
                          type="text" required value={editRole} onChange={(e) => setEditRole(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-foreground/75">Occupation</label>
                        <input 
                          type="text" required value={editOccupation} onChange={(e) => setEditOccupation(e.target.value)}
                          className="w-full p-2 rounded bg-card border border-border"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingMember}
                      className="w-full py-2.5 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm"
                    >
                      {savingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Members Directory Grid Listing */}
            <div className="glass p-6 rounded-2xl border border-border overflow-x-auto">
              {loadingMembers ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-foreground/50">Fetching directory...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-10 text-foreground/45 text-sm">
                  No registered members on record yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-foreground/60 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4 font-semibold">KingsChat</th>
                      <th className="py-3 px-4">Chapter</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Registrations</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-border/40 hover:bg-card/25 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{m.firstName} {m.lastName}</td>
                        <td className="py-3 px-4">{m.email}</td>
                        <td className="py-3 px-4">{m.phone}</td>
                        <td className="py-3 px-4 text-foreground/80">@{m.kcUsername}</td>
                        <td className="py-3 px-4">{m.chapter}</td>
                        <td className="py-3 px-4">{m.role}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[10px]">
                            {m.registrations?.length || 0} Events
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => startEditMember(m)}
                            className="text-primary hover:text-primary-dark p-1.5 rounded hover:bg-primary/5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Admin Security Tab View */}
        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="glass p-6 rounded-2xl border border-border space-y-5">
              <div className="border-b border-border pb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Change Password</h3>
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <p>{passwordSuccess}</p>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p>{passwordError}</p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/75">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {updatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
