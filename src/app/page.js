import prisma from '@/lib/db';
import PremiumImageSlider from '@/components/PremiumImageSlider';
import { Calendar, MapPin, Sparkles, LogIn, Crown, Shield } from 'lucide-react';

export const revalidate = 0; // Fetch fresh data on every request

export default async function Home() {
  // Retrieve programs matching upcoming and past status
  const programs = await prisma.program.findMany({
    orderBy: { startDate: 'asc' },
  });

  const upcoming = programs.filter(p => new Date(p.startDate) >= new Date() && p.status !== 'COMPLETED');
  const past = programs.filter(p => new Date(p.startDate) < new Date() || p.status === 'COMPLETED');

  // Take the closest next upcoming program
  const nextProgram = upcoming[0] || null;

  return (
    // Sophisticated soft alabaster/ivory base canvas with high-end dark neutral text
    <div className="min-h-screen bg-[#FDFBFD] text-neutral-900 flex flex-col relative overflow-hidden antialiased font-sans">

      {/* Soft, High-End Luxury Lighting – Using brand colors subtly as delicate daylight ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#A8006E]/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[#E5007F]/3 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] rounded-full bg-[#FFDF00]/10 blur-[140px] pointer-events-none" />

      {/* Micro-grid structural overlay for subtle texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#A8006E04_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Main navigation header */}
      <header className="max-w-7xl w-full mx-auto px-8 py-6 flex items-center justify-between z-10 border-b border-neutral-200/60 backdrop-blur-md bg-[#FDFBFD]/60">
        <a href="/" className="flex items-center gap-4 group">
          <div className="w-14 h-14 flex items-center justify-center shrink-0 p-1.5 bg-white rounded-xl shadow-md border border-neutral-200 transition-transform duration-300 group-hover:scale-[1.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/haven-logo.png" alt="Haven Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-widest text-neutral-900 uppercase">
              THE HAVEN <span className="text-[#A8006E] font-semibold">ZONE A5</span>
            </h1>
            <p className="text-[9px] text-[#E5007F] font-bold uppercase tracking-[0.35em] mt-0.5">Wealth & Purpose Network</p>
          </div>
        </a>

        <div>
          <a
            href="/login"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#FFDF00]" />
            Portal Login
          </a>
        </div>
      </header>

      {/* Hero content & Premium slide panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12 space-y-16 z-10 animate-fade-in-up">

        {/* Minimalist, Powerful Hero Tagline */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <span className="text-[10px] text-[#A8006E] font-bold uppercase tracking-[0.4em] block bg-[#A8006E]/5 w-max mx-auto px-3 py-1 rounded-md">By Invitation Only</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 leading-tight">
            Where Business Meets <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#A8006E] via-[#E5007F] to-[#A8006E]">Higher Purpose</span>
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-[#A8006E] to-[#FFDF00] mx-auto mt-6" />
        </section>

        {/* Embedded Slider Section */}
        <section className="rounded-2xl overflow-hidden border border-neutral-200 bg-white p-2 shadow-xl shadow-neutral-100">
          <PremiumImageSlider programs={programs} />
        </section>

        {/* Display next upcoming program feature card */}
        {nextProgram && (
          <section className="relative bg-white p-8 md:p-10 rounded-2xl border border-neutral-200/80 shadow-xl shadow-neutral-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Elegant luxury top gradient indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#A8006E] via-[#E5007F] to-[#FFDF00]" />

            <div className="space-y-4 max-w-3xl text-left relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#A8006E] bg-[#A8006E]/5 px-2.5 py-1 rounded-md border border-[#A8006E]/10 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#E5007F]" /> Signature Briefing
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900">
                {nextProgram.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl font-light">
                {nextProgram.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500 pt-2">
                <span className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200/60">
                  <Calendar className="w-3.5 h-3.5 text-[#A8006E]" />
                  {new Date(nextProgram.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <span className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-md border border-neutral-200/60">
                  <MapPin className="w-3.5 h-3.5 text-[#E5007F]" />
                  {nextProgram.venue}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0 relative z-10">
              <a
                href={`/register/${nextProgram.slug}`}
                className="block w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-[#A8006E] to-[#E5007F] hover:from-[#E5007F] hover:to-[#A8006E] text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 text-center shadow-md shadow-[#A8006E]/10 border border-transparent active:scale-[0.98]"
              >
                Register
              </a>
            </div>
          </section>
        )}

        {/* Program lists split */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Upcoming Programs list */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 border-b border-neutral-200 pb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E5007F]" /> Forthcoming Calendars
            </h4>
            {upcoming.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 italic">No pending schedules available. Private invitation cycles pending.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((prog) => (
                  <a
                    key={prog.id}
                    href={`/register/${prog.slug}`}
                    className="block p-5 bg-white rounded-xl border border-neutral-200 hover:border-[#A8006E]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <h5 className="font-semibold text-sm text-neutral-800 hover:text-[#A8006E] transition-colors">{prog.title}</h5>
                    <div className="flex items-center gap-4 text-[10px] text-neutral-500 mt-2.5 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A8006E]" />
                        {new Date(prog.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E5007F]" />
                        {prog.venue}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Past programs history */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 border-b border-neutral-200 pb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-neutral-400" /> Executive History
            </h4>
            {past.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 italic">No completed archives on register.</p>
            ) : (
              <div className="space-y-3">
                {past.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-5 bg-neutral-50/60 rounded-xl border border-neutral-200/60 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <h5 className="font-normal text-sm text-neutral-600">{prog.title}</h5>
                    <div className="flex items-center gap-4 text-[10px] text-neutral-400 mt-2.5 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(prog.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {prog.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      </main>

      {/* Elegant, clean layout footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-10 text-center z-10 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-400">
          <p>© {new Date().getFullYear()} The Haven Zone A5.</p>
          <p className="text-neutral-400/80">Stewardship · Integrity · Influence</p>
        </div>
      </footer>
    </div>
  );
}
