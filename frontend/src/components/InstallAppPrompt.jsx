import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for Android/Desktop installation prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[LifeOS PWA] Application was installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback hint for browsers that do not fire beforeinstallprompt automatically
      alert('To install LifeOS on your device: Open your browser menu (⋮ or Share) and tap "Install app" or "Add to Home screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[LifeOS PWA] User install choice: ${outcome}`);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Install Button */}
      <button
        onClick={handleInstallClick}
        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 transition-all active:scale-95 animate-pulse"
        title="Install LifeOS App on Mobile / Desktop"
      >
        <Smartphone className="w-4 h-4" />
        <span>Install App</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Install LifeOS on iPhone / iPad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Follow these simple steps in Safari to add LifeOS to your home screen:
            </p>

            <div className="space-y-3 text-left text-xs text-slate-700 dark:text-slate-300 font-medium mb-6">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
                  <Share className="w-4 h-4" />
                </div>
                <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>3. Tap <strong>Add</strong> at top right to complete installation.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppPrompt;
