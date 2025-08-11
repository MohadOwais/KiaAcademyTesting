'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  RotateCcw,
  SkipBack,
  SkipForward,
  Clock,
  Monitor
} from 'lucide-react';
import './AdvancedVideoPlayer.css';

interface VideoQuality {
  label: string;
  value: string;
  resolution?: string;
}

interface AdvancedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  onQualityChange?: (quality: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
  src,
  poster,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onVolumeChange,
  onQualityChange,
  onFullscreenChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock quality options - in real implementation, these would come from the video source
  const qualityOptions: VideoQuality[] = [
    { label: 'Auto', value: 'auto' },
    { label: '1080p', value: '1080p', resolution: '1920x1080' },
    { label: '720p', value: '720p', resolution: '1280x720' },
    { label: '480p', value: '480p', resolution: '854x480' },
    { label: '360p', value: '360p', resolution: '640x360' },
  ];

  const playbackRateOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  // Format time to MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      onVolumeChange?.(newVolume);
    }
  }, [onVolumeChange]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Handle seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
      onFullscreenChange?.(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      onFullscreenChange?.(false);
    }
  }, [onFullscreenChange]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: string) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
    onQualityChange?.(quality);
    // In a real implementation, you would switch video sources here
  }, [onQualityChange]);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackRateMenu(false);
    }
  }, []);

  // Skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  }, []);

  // Show/hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  }, [isPlaying, controlsTimeout]);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate, duration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, handleVolumeChange, volume]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  return (
    <div
      ref={containerRef}
      className={`advanced-video-player ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ width, height }}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="video-element"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}

      {/* Center play button */}
      {!isPlaying && showControls && (
        <div className="center-play-button" onClick={togglePlay}>
          <Play size={60} />
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="controls-overlay">
          {/* Top controls */}
          <div className="top-controls">
            {title && <div className="video-title">{title}</div>}
            <div className="top-right-controls">
              <button
                className="control-button"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Center controls */}
          <div className="center-controls">
            <button
              className="control-button large"
              onClick={() => skipTime(-10)}
              title="Skip 10 seconds backward"
            >
              <SkipBack size={30} />
            </button>
            <button
              className="control-button large"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={40} /> : <Play size={40} />}
            </button>
            <button
              className="control-button large"
              onClick={() => skipTime(10)}
              title="Skip 10 seconds forward"
            >
              <SkipForward size={30} />
            </button>
          </div>

          {/* Bottom controls */}
          <div className="bottom-controls">
            {/* Progress bar */}
            <div className="progress-container">
              <div
                ref={progressRef}
                className="progress-bar"
                onClick={handleSeek}
              >
                <div className="progress-buffered" style={{ width: `${buffered}%` }} />
                <div className="progress-played" style={{ width: `${(currentTime / duration) * 100}%` }} />
                <div
                  className="progress-thumb"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control buttons */}
            <div className="control-buttons">
              <div className="left-controls">
                <button
                  className="control-button"
                  onClick={togglePlay}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  className="control-button"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                <div
                  className="volume-container"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  {showVolumeSlider && (
                    <div
                      ref={volumeSliderRef}
                      className="volume-slider"
                      onClick={(e) => {
                        const rect = volumeSliderRef.current?.getBoundingClientRect();
                        if (rect) {
                          const clickY = e.clientY - rect.top;
                          const percentage = 1 - (clickY / rect.height);
                          handleVolumeChange(Math.max(0, Math.min(1, percentage)));
                        }
                      }}
                    >
                      <div className="volume-track">
                        <div
                          className="volume-fill"
                          style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="time-display">
                  <Clock size={16} />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>

              <div className="right-controls">
                <div className="settings-menu">
                  <button
                    className="control-button"
                    onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
                    title="Playback Speed"
                  >
                    {playbackRate}x
                  </button>
                  {showPlaybackRateMenu && (
                    <div className="settings-dropdown">
                      {playbackRateOptions.map((rate) => (
                        <button
                          key={rate}
                          className={`settings-option ${playbackRate === rate ? 'active' : ''}`}
                          onClick={() => handlePlaybackRateChange(rate)}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="settings-menu">
                  <button
                    className="control-button"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    title="Quality"
                  >
                    <Monitor size={20} />
                  </button>
                  {showQualityMenu && (
                    <div className="settings-dropdown">
                      {qualityOptions.map((quality) => (
                        <button
                          key={quality.value}
                          className={`settings-option ${selectedQuality === quality.value ? 'active' : ''}`}
                          onClick={() => handleQualityChange(quality.value)}
                        >
                          {quality.label}
                          {quality.resolution && <span className="resolution">{quality.resolution}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="control-button"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedVideoPlayer; 