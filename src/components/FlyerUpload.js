'use client';

import { useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

export default function FlyerUpload({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const removeFlyer = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/75 mb-2">
        Program Flyer Image
      </label>

      {error && (
        <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 text-red-200 p-3 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {value ? (
        <div className="relative inline-block group rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Program Flyer preview"
            className="h-48 w-auto object-contain max-w-full"
          />
          <button
            type="button"
            onClick={removeFlyer}
            className="absolute top-2 right-2 bg-background/80 hover:bg-red-500 hover:text-white p-1.5 rounded-full transition-colors cursor-pointer border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer hover:bg-card/30 transition-all group">
          <div className="flex flex-col items-center space-y-2">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-foreground/30 group-hover:text-primary transition-colors" />
            )}
            <span className="text-sm font-medium text-foreground/60 group-hover:text-foreground">
              {loading ? 'Uploading flyer...' : 'Click to upload program flyer'}
            </span>
            <span className="text-xs text-foreground/40">PNG, JPG, or WEBP up to 5MB</span>
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={loading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
