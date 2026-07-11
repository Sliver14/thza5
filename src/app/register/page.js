'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, CheckCircle, AlertCircle, Loader2, ArrowRight, Mail, Phone, Lock, 
  User, Shield, Briefcase, MapPin, ClipboardList 
} from 'lucide-react';

export default function RegisterMember() {
  const router = useRouter();
  
  // Registration states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [kcUsername, setKcUsername] = useState('');
  const [chapter, setChapter] = useState('');
  const [careGroup, setCareGroup] = useState('');
  const [role, setRole] = useState('');
  const [occupation, setOccupation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          kcUsername,
          chapter,
          careGroup,
          role,
          occupation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create member account');

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-neutral-900 flex flex-col justify-between py-12 px-4 relative overflow-hidden antialiased">
      {/* Soft, High-End Luxury Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[#A8006E]/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#FFDF00]/6 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#A8006E03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-xl mx-auto space-y-6 relative z-10 text-left">
        <div className="text-center">
          <a href="/" className="w-20 h-20 flex items-center justify-center shrink-0 mb-3 mx-auto hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </a>
          <h1 className="text-2xl font-light tracking-widest text-neutral-900 uppercase">
            MEMBER <span className="text-[#A8006E] font-semibold">REGISTRATION</span>
          </h1>
          <p className="text-xs text-[#E5007F] font-bold uppercase tracking-[0.25em] mt-1.5">
            Create Portal Account
          </p>
        </div>

        <div className="glass p-6 md:p-8 rounded-2xl border border-border/80 shadow-2xl relative">
          {success ? (
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border border-green-200 text-green-600 mb-2 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-foreground">Welcome Aboard!</h3>
                <p className="text-sm text-foreground/60 leading-relaxed max-w-sm mx-auto">
                  Account created successfully. Redirecting you to login portal...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">First Name</label>
                  <input
                    type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground/75 uppercase tracking-wide">Password</label>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set your account password"
                  className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">KingsChat</label>
                  <input
                    type="text" required value={kcUsername} onChange={(e) => setKcUsername(e.target.value)}
                    placeholder="username"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Chapter</label>
                  <input
                    type="text" required value={chapter} onChange={(e) => setChapter(e.target.value)}
                    placeholder="Lagos chapter"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Care Group</label>
                  <input
                    type="text" required value={careGroup} onChange={(e) => setCareGroup(e.target.value)}
                    placeholder="CG 1"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Role</label>
                  <input
                    type="text" required value={role} onChange={(e) => setRole(e.target.value)}
                    placeholder="Haven member"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground/75 uppercase tracking-wide">Occupation</label>
                  <input
                    type="text" required value={occupation} onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Software engineer"
                    className="w-full px-3 py-2 bg-card border border-border rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account & Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
