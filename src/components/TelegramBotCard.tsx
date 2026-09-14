import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Terminal,
  Volume2,
  Activity,
  Users,
} from 'lucide-react';

interface TelegramBotStatus {
  connected: boolean;
  isPolling: boolean;
  botId: number | null;
  username: string | null;
  firstName: string | null;
  totalMessagesProcessed: number;
  totalVoicesGenerated: number;
  startedAt: number;
  lastActive: number | null;
  botLink: string;
  activeUsersCount: number;
  recentLogs?: Array<{
    id: string;
    user: string;
    text: string;
    voice: string;
    emotion: string;
    timestamp: number;
    success: boolean;
  }>;
}

interface TelegramBotCardProps {
  isDark: boolean;
}

export const TelegramBotCard: React.FC<TelegramBotCardProps> = ({ isDark }) => {
  const [status, setStatus] = useState<TelegramBotStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCommands, setShowCommands] = useState<boolean>(false);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch Telegram bot status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    // Refresh status periodically
    const interval = setInterval(fetchBotStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  const botUsername = status?.username || 'Lyunavoiceai71_bot';
  const botLink = status?.botLink || `https://t.me/${botUsername}`;

  return (
    <div
      id="telegram-bot-card"
      className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
        isDark
          ? 'bg-slate-900/80 border-sky-500/20 shadow-sky-950/20'
          : 'bg-white border-sky-200/80 shadow-sky-500/5'
      }`}
    >
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600" />

      <div className="p-5 sm:p-6 space-y-5">
        {/* Header Row: Bot Identity & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Telegram Icon Avatar */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0">
              <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5" />
              {/* Online Pulse Beacon */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">
                  {status?.firstName || 'Lyuna Voice AI'}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  @{botUsername}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Bot Connected & Polling</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official Telegram AI Voice Assistant • Generates Bengali audio from Telegram messages
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchBotStatus}
              title="Refresh status"
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 text-slate-400 hover:text-sky-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Open in Telegram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <MessageSquare className="w-3 h-3 text-sky-400" />
              <span>Messages Received</span>
            </div>
            <div className="text-lg font-bold text-slate-100 dark:text-slate-100">
              {status?.totalMessagesProcessed ?? 0}
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>Audio Generated</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {status?.totalVoicesGenerated ?? 0}
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Active Chatters</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {status?.activeUsersCount ?? 0}
            </div>
          </div>
        </div>

        {/* Expandable Commands Guide */}
        <div
          className={`rounded-2xl border transition-colors overflow-hidden ${
            isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50/70 border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowCommands(!showCommands)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sky-400">
              <Terminal className="w-4 h-4" />
              <span>Telegram Bot Commands & Usage Guide</span>
            </div>
            <span className="text-xs text-slate-400 hover:underline">
              {showCommands ? 'Hide Commands' : 'View Commands'}
            </span>
          </button>

          {showCommands && (
            <div className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-slate-800/50">
              <p className="text-slate-400 leading-relaxed">
                You and your users can message <strong>@{botUsername}</strong> on Telegram. The bot
                will automatically synthesize Bengali voice notes and reply with instant audio playback!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-mono font-bold text-purple-400">/start & /help</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Greets user in Bengali and shows voice options
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-mono font-bold text-purple-400">/voice female | male | cute_girl | deep</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Switch voice (Farhana, Kabir, Rodela, Iqbal)
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-mono font-bold text-purple-400">/emotion normal | happy | sad | angry | excited</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Change voice tone and emotional cadence
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-mono font-bold text-purple-400">/settings</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    View active voice model and parameters
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Bot Activity Logs (if any) */}
        {status?.recentLogs && status.recentLogs.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Telegram Activity Stream</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {status.recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                    isDark
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-sky-400">@{log.user}: </span>
                    <span className="truncate italic">"{log.text}"</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
                      {log.voice}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
