'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

export default function PremiumImageSlider({ programs }) {
  // Combine flyers and general mock events highlight photos
  const slides = [
    ...programs.filter(p => p.flyerUrl).map(p => ({
      image: p.flyerUrl,
      title: p.title,
      subtitle: 'Program Flyer',
      date: p.startDate,
      venue: p.venue,
      slug: p.slug
    })),
    // Standard default highlight slides fallback
    {
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
      title: 'The Haven Zone A5 Fellowship',
      subtitle: 'Highlight Photo',
      description: 'Kingdom wealth accumulation fellowship and teaching sessions.'
    },
    {
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200',
      title: 'Money Night Highlights',
      subtitle: 'Reliving Moments',
      description: 'Moments of explosive financial declarations and empowerment.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[350px] md:h-[480px] rounded-2xl overflow-hidden shadow-2xl group select-none">
      {/* Background slide images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] group-hover:scale-105"
          style={{ backgroundImage: `url(${currentSlide.image})` }}
        />
      </AnimatePresence>

      {/* Dark luxury vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Floating Info card */}
      <div className="absolute bottom-0 inset-x-0 p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 z-15">
        <motion.div
          key={`info-${currentIndex}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2 max-w-xl text-left"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary-light px-2.5 py-1 rounded bg-primary/20 border border-primary/20">
            {currentSlide.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {currentSlide.title}
          </h2>
          {currentSlide.date && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/75 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {mounted ? new Date(currentSlide.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading schedule...'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary" />
                {currentSlide.venue}
              </span>
            </div>
          )}
          {currentSlide.description && (
            <p className="text-sm text-foreground/60 leading-relaxed">{currentSlide.description}</p>
          )}
        </motion.div>

        {currentSlide.slug && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href={`/register/${currentSlide.slug}`}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer block text-center text-sm"
            >
              Register Now
            </a>
          </motion.div>
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/60 hover:bg-primary text-white border border-border flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/60 hover:bg-primary text-white border border-border flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-foreground/30 hover:bg-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
