import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Video, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoAsset {
    id: number;
    uuid: string;
    title: string;
    songName: string;
    category: string;
    url: string;
}

interface VideoPlayerProps {
    videos: VideoAsset[];
    currentVideoIndex: number;
    onVideoChange: (index: number) => void;
    isShuffled: boolean;
    onShuffleToggle: () => void;
}

export function VideoPlayer({ 
    videos, 
    currentVideoIndex, 
    onVideoChange, 
    isShuffled, 
    onShuffleToggle 
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const currentVideo = videos[currentVideoIndex];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.load();
            if (isPlaying) {
                videoRef.current.play().catch(console.error);
            }
        }
    }, [currentVideoIndex]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(console.error);
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = () => {
        const nextIndex = (currentVideoIndex + 1) % videos.length;
        onVideoChange(nextIndex);
    };

    const handlePrevious = () => {
        const prevIndex = currentVideoIndex === 0 ? videos.length - 1 : currentVideoIndex - 1;
        onVideoChange(prevIndex);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (videoRef.current && isFinite(value[0]) && isFinite(duration) && duration > 0) {
            videoRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
        setIsMuted(false);
    };

    const handleEnded = () => {
        handleNext();
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentVideo) return null;

    return (
        <div className="flex flex-col gap-4">
            {/* Video Display */}
            <div className="relative overflow-hidden rounded-lg bg-black">
                <video
                    ref={videoRef}
                    src={currentVideo.url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    className="w-full"
                    onClick={handlePlayPause}
                />
            </div>

            {/* Video Info & Controls */}
            <div className="rounded-lg border bg-card p-4">
                {/* Video Title */}
                <div className="mb-3">
                    <h3 className="truncate font-semibold">{currentVideo.title}</h3>
                    <p className="truncate text-sm text-muted-foreground">{currentVideo.songName}</p>
                </div>

                {/* Progress Bar and Time */}
                <div className="mb-3 space-y-1">
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                        disabled={!isFinite(duration) || duration === 0}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left: Shuffle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onShuffleToggle}
                        className={cn(isShuffled && 'text-primary')}
                        title="Shuffle"
                    >
                        <Shuffle className="h-4 w-4" />
                    </Button>

                    {/* Center: Playback Controls */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={handlePrevious} title="Previous">
                            <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button size="icon" className="h-10 w-10" onClick={handlePlayPause}>
                            {isPlaying ? (
                                <Pause className="h-5 w-5" />
                            ) : (
                                <Play className="h-5 w-5" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext} title="Next">
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right: Volume & Fullscreen */}
                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-2 sm:flex">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMuted(!isMuted)}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </Button>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={1}
                                step={0.01}
                                onValueChange={handleVolumeChange}
                                className="w-20"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleFullscreen}
                            title="Fullscreen"
                        >
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
