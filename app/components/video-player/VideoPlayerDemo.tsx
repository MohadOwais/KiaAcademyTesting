'use client';

import React, { useState } from 'react';
import AdvancedVideoPlayer from './AdvancedVideoPlayer';
import './VideoPlayerDemo.css';

const VideoPlayerDemo: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  // Sample video sources - replace with your actual video URLs
  const videoSources = [
    {
      src: '/videos/banner-video.mp4', // Replace with your video path
      poster: '/images/course-thumbnail.jpg', // Replace with your thumbnail path
      title: 'Sample Course Introduction'
    },
    {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      title: 'Big Buck Bunny (Sample Video)'
    },
    {
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      title: 'Elephants Dream (Sample Video)'
    }
  ];

  const handleVideoChange = (index: number) => {
    setCurrentVideo(index);
  };

  const handlePlay = () => {
    console.log('Video started playing');
  };

  const handlePause = () => {
    console.log('Video paused');
  };

  const handleTimeUpdate = (currentTime: number) => {
    console.log('Current time:', currentTime);
  };

  const handleQualityChange = (quality: string) => {
    console.log('Quality changed to:', quality);
  };

  return (
    <div className="video-player-demo">
      <div className="demo-header">
        <h1>Advanced Video Player Demo</h1>
        <p>A feature-rich video player with YouTube-like controls</p>
      </div>

      <div className="demo-content">
        <div className="video-container">
          <AdvancedVideoPlayer
            src={videoSources[currentVideo].src}
            poster={videoSources[currentVideo].poster}
            title={videoSources[currentVideo].title}
            width="100%"
            height="400px"
            autoPlay={false}
            muted={false}
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onQualityChange={handleQualityChange}
          />
        </div>

        <div className="video-selector">
          <h3>Select Video:</h3>
          <div className="video-options">
            {videoSources.map((video, index) => (
              <button
                key={index}
                className={`video-option ${currentVideo === index ? 'active' : ''}`}
                onClick={() => handleVideoChange(index)}
              >
                {video.title}
              </button>
            ))}
          </div>
        </div>

        <div className="features-list">
          <h3>Features:</h3>
          <ul>
            <li>🎮 Play/Pause with spacebar or click</li>
            <li>⏮️⏭️ Skip 10 seconds with arrow keys</li>
            <li>🔊 Volume control with arrow keys or slider</li>
            <li>🔇 Mute/Unmute with 'M' key</li>
            <li>🖥️ Fullscreen with 'F' key</li>
            <li>⚡ Playback speed control (0.25x to 2x)</li>
            <li>📺 Quality selection (Auto, 1080p, 720p, 480p, 360p)</li>
            <li>📱 Responsive design for mobile devices</li>
            <li>🎨 YouTube-like interface</li>
            <li>⏱️ Auto-hide controls during playback</li>
            <li>🔄 Buffer progress indicator</li>
            <li>♿ Accessibility features</li>
          </ul>
        </div>

        <div className="usage-example">
          <h3>Usage Example:</h3>
          <pre>
{`import AdvancedVideoPlayer from './components/video-player/AdvancedVideoPlayer';

<AdvancedVideoPlayer
  src="/path/to/your/video.mp4"
  poster="/path/to/thumbnail.jpg"
  title="Video Title"
  width="100%"
  height="400px"
  autoPlay={false}
  muted={false}
  onPlay={() => console.log('Video started')}
  onPause={() => console.log('Video paused')}
  onTimeUpdate={(time) => console.log('Current time:', time)}
  onQualityChange={(quality) => console.log('Quality:', quality)}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerDemo; 