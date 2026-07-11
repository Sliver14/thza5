'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { 
  Calendar, MapPin, QrCode, ClipboardList, LogOut, Loader2, Sparkles, CheckCircle, 
  Download, Users, Award, ShieldCheck, Clock, BookmarkCheck, ArrowUpRight, X, AlertCircle, Lock, ChevronRight
} from 'lucide-react';

export default function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  
  // Dashboard Navigation State: 'events' | 'profile' | 'security'
  const [activeTab, setActiveTab] = useState('events');

  // Custom enrollment modal state
  const [registeringProgram, setRegisteringProgram] = useState(null);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [submittingRegistration, setSubmittingRegistration] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');

  // Selected registration detail view modal state
  const [selectedReg, setSelectedReg] = useState(null);

  // Profile Form States
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editKc, setEditKc] = useState('');
  const [editChapter, setEditChapter] = useState('');
  const [editCareGroup, setEditCareGroup] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPrograms();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/members/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        // Pre-fill profile form fields
        setEditFirstName(data.firstName || '');
        setEditLastName(data.lastName || '');
        setEditEmail(data.email || '');
        setEditPhone(data.phone || '');
        setEditKc(data.kcUsername || '');
        setEditChapter(data.chapter || '');
        setEditCareGroup(data.careGroup || '');
        setEditRole(data.role || '');
        setEditOccupation(data.occupation || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const res = await fetch(`/api/members/${profile.id}`, {
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
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setProfileSuccessMsg('Profile updated successfully.');
      fetchProfile();
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setUpdatingPassword(true);

    try {
      const res = await fetch('/api/members/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setRegistrationError('');
    setRegistrationSuccessMsg('');
    setSubmittingRegistration(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: registeringProgram.id,
          memberId: profile.id,
          isNewMember: false,
          fieldResponses: customFieldValues
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Enrollment failed');

      setRegistrationSuccessMsg('Enrolled successfully! Check-in pass generated.');
      setCustomFieldValues({});
      fetchProfile(); // Reload registrations
      setTimeout(() => {
        setRegisteringProgram(null);
        setRegistrationSuccessMsg('');
      }, 3000);
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setSubmittingRegistration(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-foreground/50 font-medium">Loading profile...</span>
      </div>
    );
  }

  const now = new Date();
  const upcoming = programs.filter(p => new Date(p.startDate) >= now && p.status !== 'COMPLETED');

  // Filter registrations into attended history list
  const attendedHistory = profile?.registrations?.filter(r => r.attended) || [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDFBFD] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#A8006E]" />
        <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Verifying Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-neutral-900 flex flex-col relative overflow-hidden antialiased">
      {/* Soft, High-End Luxury Lighting */}
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#A8006E]/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[#FFDF00]/5 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#A8006E03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-neutral-200/60 bg-[#FDFBFD]/60 backdrop-blur-md sticky top-0 z-30 px-8 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center shrink-0 p-1.5 bg-white rounded-xl shadow-md border border-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-light tracking-widest text-neutral-900 uppercase">
              THE HAVEN <span className="text-[#A8006E] font-semibold">ZONE A5</span>
            </h1>
            <p className="text-[9px] text-[#E5007F] font-bold uppercase tracking-[0.35em] mt-0.5">Member Workspace</p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-neutral-600 gap-1 border border-neutral-200">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'events' ? 'bg-[#A8006E] text-white shadow-sm' : 'hover:text-neutral-900'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'profile' ? 'bg-[#A8006E] text-white shadow-sm' : 'hover:text-neutral-900'
            }`}
          >
            My Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'security' ? 'bg-[#A8006E] text-white shadow-sm' : 'hover:text-neutral-900'
            }`}
          >
            Security
          </button>
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#FFDF00]" />
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-12 z-10 animate-fade-in-up">
        
        {/* Profile Intro Card */}
        <section className="glass p-6 md:p-8 rounded-2xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary px-2.5 py-1 rounded bg-secondary/10 border border-secondary/20">
              {profile.role}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-foreground/60 text-xs font-medium">
              Chapter: {profile.chapter} | Care Group: {profile.careGroup}
            </p>
          </div>

          <div className="flex gap-4 text-center shrink-0">
            <div className="bg-card px-4 py-3 rounded-xl border border-border min-w-[100px]">
              <div className="text-2xl font-black text-primary">{profile?.registrations?.length || 0}</div>
              <div className="text-[10px] text-foreground/45 uppercase tracking-wide font-bold mt-1">Registrations</div>
            </div>
            <div className="bg-card px-4 py-3 rounded-xl border border-border min-w-[100px]">
              <div className="text-2xl font-black text-secondary">{attendedHistory.length}</div>
              <div className="text-[10px] text-foreground/45 uppercase tracking-wide font-bold mt-1">Attended</div>
            </div>
          </div>
        </section>

        {/* Tab Content rendering switcher */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Events list */}
            <section className="lg:col-span-8 space-y-6 text-left">
              <div className="border-b border-border pb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Upcoming Program Events</h3>
              </div>

              {loadingPrograms ? (
                <div className="flex items-center gap-2 py-6 text-sm text-foreground/50">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Loading events...
                </div>
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-foreground/40 py-4">No upcoming programs listed. Check back soon!</p>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((prog) => {
                    const isRegistered = profile?.registrations?.some(r => r.programId === prog.id);
                    return (
                      <div 
                        key={prog.id} 
                        className="p-5 bg-card rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/20 transition-colors"
                      >
                        <div className="space-y-2">
                          <h4 className="font-bold text-base text-foreground">{prog.title}</h4>
                          <p className="text-xs text-foreground/60 leading-relaxed max-w-xl">{prog.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50 font-medium">
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

                        <div className="shrink-0 w-full md:w-auto">
                          {isRegistered ? (
                            <span className="w-full md:w-auto text-xs bg-green-50 text-green-700 font-bold border border-green-200 px-4 py-2 rounded-lg inline-flex items-center justify-center gap-1.5">
                              <BookmarkCheck className="w-4 h-4" />
                              Enrolled
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setRegisteringProgram(prog);
                                setCustomFieldValues({});
                              }}
                              className="w-full md:w-auto text-xs bg-primary text-white font-bold hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1"
                            >
                              Register
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right: Registration tickets click-trigger list */}
            <section className="lg:col-span-4 space-y-6 text-left">
              <div className="border-b border-border pb-2 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-bold">Your Registered Events</h3>
              </div>

              <div className="space-y-3">
                {profile?.registrations?.length === 0 ? (
                  <p className="text-xs text-foreground/45 py-4 text-center border border-dashed border-border rounded-lg">
                    You haven&apos;t enrolled in any program setups yet.
                  </p>
                ) : (
                  profile.registrations.map((reg) => (
                    <div 
                      key={reg.id} 
                      onClick={() => setSelectedReg(reg)}
                      className="p-4 bg-card hover:bg-neutral-50/50 rounded-xl border border-border transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-neutral-800">{reg.program.title}</h4>
                        <div className="flex items-center gap-1 text-[9px] text-foreground/50">
                          <Calendar className="w-3 h-3 text-primary" />
                          {new Date(reg.program.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          reg.attended ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {reg.attended ? 'Attended' : 'Pass Active'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#A8006E] transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Tab View: Profile Edit Screen */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto glass p-8 rounded-2xl border border-border text-left space-y-6">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#A8006E]" />
              <h3 className="text-lg font-bold text-foreground">Edit Profile Details</h3>
            </div>

            {profileSuccessMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200/80 text-green-700 p-3 rounded-lg text-xs">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <p>{profileSuccessMsg}</p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">KingsChat Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Username without @"
                    value={editKc}
                    onChange={(e) => setEditKc(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Chapter</label>
                  <input
                    type="text"
                    required
                    value={editChapter}
                    onChange={(e) => setEditChapter(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Care Group</label>
                  <input
                    type="text"
                    required
                    value={editCareGroup}
                    onChange={(e) => setEditCareGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Role / Office</label>
                  <select
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="PASTORAL">Pastoral</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Occupation</label>
                  <input
                    type="text"
                    required
                    value={editOccupation}
                    onChange={(e) => setEditOccupation(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex justify-center items-center gap-1.5"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab View: Security / Password Change */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto glass p-8 rounded-2xl border border-border text-left space-y-6">
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#A8006E]" />
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

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E] placeholder-foreground/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:border-[#A8006E] placeholder-foreground/20"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex justify-center items-center gap-1.5"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Selected Registration Ticket Pass Modal Details view */}
        {selectedReg && (
          <div 
            onClick={() => setSelectedReg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm p-6 rounded-2xl border border-border space-y-5 text-center relative"
            >
              <button 
                onClick={() => setSelectedReg(null)}
                className="absolute top-4 right-4 text-foreground/45 hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-border pb-3">
                <h3 className="font-bold text-sm text-neutral-800">{selectedReg.program.title}</h3>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-foreground/50 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{new Date(selectedReg.program.startDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-foreground/50 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary" />
                  <span>{selectedReg.program.venue}</span>
                </div>
              </div>

              {selectedReg.ticketQrUrl ? (
                <div className="bg-white p-4 rounded-xl border border-border max-w-[200px] mx-auto relative group shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={selectedReg.ticketQrUrl} 
                    alt="Check-in Pass QR" 
                    className="w-full h-auto object-contain"
                  />
                  <a
                    href={selectedReg.ticketQrUrl}
                    download={`${selectedReg.program.slug}-pass.png`}
                    className="absolute inset-0 bg-[#A8006E]/95 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded font-bold text-xs"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download Pass
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-foreground/40 border border-dashed border-border rounded-xl">
                  Generating check-in pass...
                </div>
              )}

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-foreground/40">Check-in Status</div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
                  selectedReg.attended ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedReg.attended ? 'Checked In / Present' : 'Pending Check-in'}
                </span>
                {selectedReg.attended && selectedReg.attendedAt && (
                  <p className="text-[9px] text-neutral-400 mt-1">Checked in at: {new Date(selectedReg.attendedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Modal */}
        {registeringProgram && (
          <div 
            onClick={() => setRegisteringProgram(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-lg p-6 rounded-2xl border border-border space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar text-left relative"
            >
              <div className="border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Program Registration</h2>
                  <p className="text-xs text-foreground/50 mt-0.5">{registeringProgram.title}</p>
                </div>
                <button
                  onClick={() => setRegisteringProgram(null)}
                  className="text-foreground/45 hover:text-foreground p-1 transition-colors cursor-pointer border border-border rounded-lg bg-card"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {registrationSuccessMsg && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs justify-center animate-pulse">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  <p>{registrationSuccessMsg}</p>
                </div>
              )}

              {registrationError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs justify-center">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p>{registrationError}</p>
                </div>
              )}

              <form onSubmit={handleEnroll} className="space-y-4 text-xs">
                {JSON.parse(registeringProgram.customFields || '[]').length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Program specific questions</h4>
                    {JSON.parse(registeringProgram.customFields || '[]').map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            required={field.required}
                            value={customFieldValues[field.key] || ''}
                            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                          />
                        )}
                        {field.type === 'select' && (
                          <select
                            required={field.required}
                            value={customFieldValues[field.key] || ''}
                            onChange={(e) => setCustomFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="">Select option</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground/60 leading-relaxed py-2">
                    Click the button below to confirm enrollment. No custom fields are required for this setup.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingRegistration}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {submittingRegistration ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Confirm Enrollment'
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
