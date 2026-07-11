'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScanSuccess, onScanError }) {
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let html5Qrcode = null;

    // Delayed init to make sure DOM node "reader" is fully painted
    const initTimer = setTimeout(() => {
      if (!isMounted) return;

      try {
        html5Qrcode = new Html5Qrcode('reader');
        html5QrcodeRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: (width, height) => {
            const calculated = Math.min(width, height) * 0.65;
            const size = Math.max(calculated, 150);
            return { width: size, height: size };
          }
        };

        html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (isMounted && onScanError) onScanError(errorMessage);
          }
        ).catch((err) => {
          if (!isMounted) return;
          console.warn('Camera auto-start failed, trying fallback...', err);
          
          html5Qrcode.start(
            { facingMode: 'user' },
            config,
            (decodedText) => {
              if (isMounted) onScanSuccess(decodedText);
            },
            (errorMessage) => {
              if (isMounted && onScanError) onScanError(errorMessage);
            }
          ).catch((fallbackErr) => {
            console.error('All camera initialization options failed', fallbackErr);
          });
        });
      } catch (err) {
        console.error('Html5Qrcode initialization failed', err);
      }
    }, 100);

    // Cleanup scanner instance on unmount
    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      
      if (html5QrcodeRef.current) {
        const scanner = html5QrcodeRef.current;
        html5QrcodeRef.current = null;

        if (scanner.isScanning) {
          scanner.stop()
            .then(() => {
              try {
                scanner.clear();
              } catch (e) {}
            })
            .catch((err) => {
              console.warn('Failed to stop camera stream gracefully', err);
            });
        } else {
          try {
            scanner.clear();
          } catch (e) {}
        }
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border p-4 rounded-xl space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-black/5 aspect-square relative flex items-center justify-center">
        <div id="reader" className="w-full h-full" />
      </div>
      <p className="text-[10px] text-center text-foreground/40 font-medium">
        Align the member check-in ticket pass QR code inside the box.
      </p>
    </div>
  );
}
