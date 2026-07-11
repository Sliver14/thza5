'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function MemberLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('member-credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBFD] px-4 relative overflow-hidden antialiased">
      {/* Soft, High-End Luxury Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#A8006E]/4 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFDF00]/6 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#A8006E03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl relative z-10">
        <div className="text-center mb-8">
          <a href="/" className="w-20 h-20 flex items-center justify-center shrink-0 mb-4 mx-auto hover:opacity-90 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </a>
          <h2 className="text-2xl font-light tracking-widest text-neutral-900 uppercase">
            MEMBER <span className="text-[#A8006E] font-semibold">PORTAL</span>
          </h2>
          <p className="text-xs text-[#E5007F] font-bold uppercase tracking-[0.25em] mt-1.5">
            Zone A5 Verification
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/75 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/75 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-semibold transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer glow-primary disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-xs text-foreground/40 mt-6 text-center">
          Don&apos;t have a member account?{' '}
          <a href="/register" className="text-primary hover:underline font-bold">
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}
