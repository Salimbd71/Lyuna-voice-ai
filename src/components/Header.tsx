import React from 'react';
import { Moon, Sun, Volume2, Globe } from 'lucide-react';
import { LanguageMode } from '../types';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  language,
  onLanguageChange,
}) => {
  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950/80 border-purple-900/30'
          : 'bg-white/80 border-purple-100 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 shadow-md shadow-purple-500/20 text-white">
            <Volume2 className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                Lyuna Voice AI
              </h1>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                বাংলা ভয়েস
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 hidden sm:block">
              ElevenLabs Style Bengali & Multilingual Voice Synthesis
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Telegram Bot Link Badge */}
          <a
            href="https://t.me/Lyunavoiceai71_bot"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Lyuna Voice AI bot in Telegram"
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>@Lyunavoiceai71_bot</span>
          </a>

          {/* Language Mode Toggle */}
          <div
            className={`inline-flex items-center p-1 rounded-xl border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              id="btn-lang-bn"
              onClick={() => onLanguageChange('bn')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                language === 'bn'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs">🇧🇩</span>
              <span>বাংলা (Default)</span>
            </button>
            <button
              type="button"
              id="btn-lang-en"
              onClick={() => onLanguageChange('en')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            id="btn-theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle Dark/Light mode"
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
