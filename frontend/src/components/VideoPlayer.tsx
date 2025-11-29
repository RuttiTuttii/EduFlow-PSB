import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { useState, useRef } from 'react';
import { GridPattern } from './GridPattern';

interface VideoPlayerProps {
  theme: 'day' | 'night';
  videoUrl?: string;
  title: string;
}

export function VideoPlayer({ theme, videoUrl, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(30);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const controlsBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-950/95';

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div 
      className={`${cardBg} backdrop-blur-2xl border rounded-[32px] overflow-hidden shadow-2xl relative group`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <GridPattern theme={theme} />
      
      {/* Video Area */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-purple-900">
        {/* Placeholder - в реальном проекте здесь был бы <video> */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Play className="w-12 h-12 text-white ml-1" />
            </motion.div>
            <p className="text-white text-xl">{title}</p>
          </div>
        </div>

        {/* Controls Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white text-sm">05:24</span>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${progress}%` }}
                  whileHover={{ scaleY: 1.5 }}
                />
              </div>
              <span className="text-white text-sm">18:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                onClick={toggleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </motion.button>

              {!isMuted && (
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Maximize className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Info */}
      <div className="p-6 relative z-10">
        <h3 className={`text-xl mb-2 ${textClass}`}>{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
            Продолжительность: 18:00
          </span>
          <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
            Просмотрено: 30%
          </span>
        </div>
      </div>
    </div>
  );
}
