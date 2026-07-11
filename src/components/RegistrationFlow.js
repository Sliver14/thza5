'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, UserPlus, CheckCircle, AlertCircle, Calendar, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function RegistrationFlow({ program }) {
  const customFieldDefs = JSON.parse(program.customFields || '[]');
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step tracker: 'lookup' | 'register-member' | 'register-program' | 'success'
  const [step, setStep] = useState('lookup');
  
  // Lookup state
  const [identifier, setIdentifier] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  
  // Resolved member details
  const [member, setMember] = useState(null);
  
  // Core Member registration states (if not in db)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [kcUsername, setKcUsername] = useState('');
  const [chapter, setChapter] = useState('');
  const [careGroup, setCareGroup] = useState('');
  const [role, setRole] = useState('');
  const [occupation, setOccupation] = useState('');
  const [password, setPassword] = useState('');

  // Program custom fields values state
  const [customFieldValues, setCustomFieldValues] = useState({});
  
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [regResult, setRegResult] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    setLookupLoading(true);

    try {
      const res = await fetch('/api/members/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lookup failed');

      if (data.found) {
        // Member exists - skip member registration and go to program details
        setMember(data.member);
        
        // Auto-check if the member is already registered for this specific program
        const checkRes = await fetch(`/api/programs/${program.id}/registrations`);
        const registrations = await checkRes.json();
        
        const isRegistered = registrations.some(r => r.memberId === data.member.id);
        if (isRegistered) {
          setSubmitError('You are already registered for this program.');
          setStep('register-program'); // Stays on confirmation showing the error
          return;
        }

        setStep('register-program');
      } else {
        // Member does not exist - guide them to register as a member first.
        // Pre-fill email or phone depending on user entry pattern
        if (identifier.includes('@')) {
          setEmail(identifier);
        } else {
          setPhone(identifier);
        }
        setStep('register-member');
      }
    } catch (err) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCustomFieldChange = (key, val) => {
    setCustomFieldValues(prev => ({ ...prev, [key]: val }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    const payload = {
      programId: program.id,
      fieldResponses: customFieldValues,
    };

    if (step === 'register-member') {
      payload.isNewMember = true;
      payload.firstName = firstName;
      payload.lastName = lastName;
      payload.email = email;
      payload.phone = phone;
      payload.kcUsername = kcUsername;
      payload.chapter = chapter;
      payload.careGroup = careGroup;
      payload.role = role;
      payload.occupation = occupation;
      payload.password = password;
    } else {
      payload.isNewMember = false;
      payload.memberId = member.id;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setRegResult(data.registration);
      setStep('success');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between py-12 px-4 relative overflow-hidden">
      {/* Visual background layers */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto space-y-8 relative z-10 text-left">
        
        {/* Dynamic header info */}
        <div className="text-center">
          <a href="/" className="w-20 h-20 flex items-center justify-center shrink-0 mb-3 mx-auto hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </a>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {program.title}
          </h1>
          <p className="text-xs text-foreground/50 tracking-wider uppercase font-semibold mt-1">
            Program Registration
          </p>
        </div>

        {/* Program info block */}
        <div className="glass overflow-hidden rounded-2xl border border-border/80 text-xs text-foreground/60 font-semibold flex flex-col">
          {program.flyerUrl && (
            <div className="w-full h-48 md:h-64 relative bg-neutral-100 overflow-hidden border-b border-border/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={program.flyerUrl} 
                alt={`${program.title} Banner`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          
          <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{mounted ? new Date(program.startDate).toLocaleString() : 'Loading schedule...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{program.venue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form screens switcher */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-border/80 shadow-2xl relative">
          
          {step === 'lookup' && (
            <form onSubmit={handleLookup} className="space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Search className="w-5 h-5 text-secondary" />
                  Member Validation
                </h3>
                <p className="text-xs text-foreground/50 mt-1">Verify your details in the database to fast-track your registration.</p>
              </div>

              {lookupError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p>{lookupError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Email Address or Phone Number</label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {lookupLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking database...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'register-member' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Haven Member Profile Setup
                </h3>
                <p className="text-xs text-foreground/50 mt-1">We couldn&apos;t find your profile. Fill this once to register as a Haven Member.</p>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">KingsChat Username</label>
                  <input
                    type="text"
                    required
                    value={kcUsername}
                    onChange={(e) => setKcUsername(e.target.value)}
                    placeholder="@kingschat"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Chapter</label>
                  <input
                    type="text"
                    required
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="A5 Chapter"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Care Group</label>
                  <input
                    type="text"
                    required
                    value={careGroup}
                    onChange={(e) => setCareGroup(e.target.value)}
                    placeholder="Group 1"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Haven Role</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Member / Coordinator"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Occupation</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Developer"
                    className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">Account Password (For Portal Login)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary placeholder-foreground/20"
                />
              </div>

              {/* Custom fields section if any */}
              {customFieldDefs.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h4 className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Program specific questions</h4>
                  {customFieldDefs.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          required={field.required}
                          value={customFieldValues[field.key] || ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                      )}
                      {field.type === 'select' && (
                        <select
                          required={field.required}
                          value={customFieldValues[field.key] || ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="">Select option</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === 'boolean' && (
                        <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            required={field.required}
                            checked={!!customFieldValues[field.key]}
                            onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary bg-card"
                          />
                          Yes, please
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting registration...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          {step === 'register-program' && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Profile Found!
                </h3>
                <p className="text-xs text-foreground/50 mt-1">
                  Welcome back, <span className="text-foreground font-bold">{member.firstName} {member.lastName}</span>. Click register below to enroll.
                </p>
              </div>

              {submitError && submitError.includes('already registered') ? (
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                    <p>{submitError}</p>
                  </div>
                  <a
                    href="/"
                    className="w-full py-3 bg-card border border-border hover:border-primary/20 text-foreground font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    Go Back to Homepage
                  </a>
                </div>
              ) : (
                <>
                  {/* Custom fields section if any */}
                  {customFieldDefs.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Program specific questions</h4>
                      {customFieldDefs.map((field) => (
                        <div key={field.key} className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </label>
                          {field.type === 'text' && (
                            <input
                              type="text"
                              required={field.required}
                              value={customFieldValues[field.key] || ''}
                              onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                              className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                            />
                          )}
                          {field.type === 'select' && (
                            <select
                              required={field.required}
                              value={customFieldValues[field.key] || ''}
                              onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                              className="w-full px-4 py-2 rounded bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                            >
                              <option value="">Select option</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'boolean' && (
                            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer pt-1">
                              <input
                                type="checkbox"
                                required={field.required}
                                checked={!!customFieldValues[field.key]}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
                                className="rounded border-border text-primary focus:ring-primary bg-card"
                              />
                              Yes, please
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-foreground/60">
                      No additional questions are required for this program.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Confirm & Register'
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-200 text-green-600 mb-2 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-foreground">Congratulations!</h3>
                <p className="text-sm text-foreground/60 leading-relaxed max-w-sm mx-auto">
                  You are now registered for <span className="font-bold text-foreground">{program.title}</span>.
                </p>
                <div className="bg-neutral-50 border border-neutral-200/80 p-3 rounded-lg max-w-md mx-auto text-xs text-neutral-600 mt-2">
                  <span className="font-semibold text-neutral-800 block mb-1">Portal Account Created</span>
                  You can now log in to the Member Workspace using your email and password to track registrations and view your passes.
                </div>
              </div>

              {/* Attendance ticket pass check */}
              {regResult?.ticketQrUrl && (
                <div className="glass max-w-xs mx-auto p-4 rounded-xl border border-border space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">Your Attendance Pass</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={regResult.ticketQrUrl}
                    alt="Attendance Pass QR Code"
                    className="w-40 h-40 mx-auto rounded border border-border p-1 bg-white"
                  />
                  <p className="text-[11px] text-foreground/50">Show this QR code at the entrance to verify your attendance.</p>
                  <a
                    href={regResult.ticketQrUrl}
                    download={`${program.slug}-pass.png`}
                    className="inline-block text-xs text-primary font-bold hover:underline"
                  >
                    Download Pass Image
                  </a>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <a
                  href="/login"
                  className="inline-block px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 shadow-md cursor-pointer"
                >
                  Log In To Portal
                </a>
                <a
                  href="/"
                  className="inline-block px-6 py-2.5 bg-card border border-border hover:border-neutral-300 text-xs font-semibold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                >
                  Back Home
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
