import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  Share2,
  Check,
} from 'lucide-react';
import { GeneratedVoiceRecord } from '../types';
import { formatTime, downloadAudioFile } from '../utils/audioUtils';

interface AudioPlayerProps {
  currentRecord: GeneratedVoiceRecord;
  isDark: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentRecord,
  isDark,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentRecord.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(currentRecord.speed || 1);
  const [copied, setCopied] = useState(false);

  // Audio animation visualizer bars count
  const visualizerBars = 36;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    // When record changes, load and optionally autoplay
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentRecord.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const sanitizedVoice = currentRecord.voiceName.toLowerCase().replace(/\s+/g, '-');
    const filename = `lyuna-voice-${sanitizedVoice}-${currentRecord.emotionId}-${Date.now()}.wav`;
    downloadAudioFile(currentRecord.audioUrl, filename);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        currentRecord.bengaliText || currentRecord.spokenText
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy text failed', e);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="audio-player-card"
      className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-xl ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-purple-800/40 shadow-purple-950/20'
          : 'bg-gradient-to-b from-white via-purple-50/40 to-white border-purple-200/80 shadow-purple-200/40'
      }`}
    >
      <audio
        ref={audioRef}
        src={currentRecord.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current?.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
      />

      {/* Top Header: Voice Info + Download MP3 Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/20 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold text-sm">
            {currentRecord.voiceName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {currentRecord.voiceName}
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                {currentRecord.emotionId}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bengali Voice Generator • 24kHz Studio Audio
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Text & Download MP3 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-copy-script"
            onClick={handleCopyText}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Script</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>

          {/* Download MP3 / WAV button */}
          <button
            type="button"
            id="btn-download-audio"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Audio</span>
          </button>
        </div>
      </div>

      {/* Script Preview Card */}
      <div
        className={`my-4 p-3.5 rounded-2xl border text-sm leading-relaxed transition-colors ${
          isDark
            ? 'bg-slate-950/60 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-purple-400 font-semibold mb-1">
          <span>SPOKEN BENGALI SCRIPT (উচ্চারিত বাংলা স্ক্রিপ্ট):</span>
          <span className="text-[10px] text-slate-400">
            {currentRecord.spokenText.length} characters
          </span>
        </div>
        <p className="font-normal font-sans text-sm sm:text-base">
          {currentRecord.bengaliText || currentRecord.spokenText}
        </p>
      </div>

      {/* Animated Sound Waveform Visualizer */}
      <div className="my-5 flex items-center justify-center gap-1 sm:gap-1.5 h-16 sm:h-20 px-4 rounded-2xl bg-black/10 dark:bg-black/40 overflow-hidden">
        {Array.from({ length: visualizerBars }).map((_, i) => {
          const barProgress = (i / visualizerBars) * 100;
          const isPassed = barProgress <= progressPercent;
          const baseHeight = Math.sin(i * 0.4) * 35 + 45;
          const dynamicHeight = isPlaying
            ? Math.max(15, Math.min(95, baseHeight + Math.sin(currentTime * 8 + i * 0.8) * 30))
            : baseHeight * 0.45;

          return (
            <div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${
                isPassed
                  ? 'bg-gradient-to-t from-purple-500 to-blue-400 shadow-xs shadow-purple-500/50'
                  : isDark
                  ? 'bg-slate-800'
                  : 'bg-slate-300'
              }`}
              style={{
                height: `${dynamicHeight}%`,
              }}
            />
          );
        })}
      </div>

      {/* Scrubber / Progress Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="relative flex items-center">
          <input
            type="range"
            id="audio-progress-bar"
            min="0"
            max={duration || 1}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-700/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          {/* Play / Pause Primary Button */}
          <button
            type="button"
            id="btn-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Replay Button */}
          <button
            type="button"
            id="btn-restart-audio"
            onClick={handleRestart}
            title="Restart playback"
            className="p-2.5 rounded-xl border border-slate-700/40 dark:bg-slate-800/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed switcher in player */}
          <div className="flex items-center gap-1 border border-slate-700/40 rounded-xl p-1 bg-slate-900/40 text-xs">
            {[0.75, 1.0, 1.25, 1.5].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setPlaybackSpeed(sp)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                  playbackSpeed === sp
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Mute Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-mute-toggle"
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-24 h-1.5 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
