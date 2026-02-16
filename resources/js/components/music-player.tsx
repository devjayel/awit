import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Song {
    id: number;
    uuid: string;
    title: string;
    songName: string;
    category: string;
    url: string;
}

interface MusicPlayerProps {
    songs: Song[];
    currentSongIndex: number;
    onSongChange: (index: number) => void;
    isShuffled: boolean;
    onShuffleToggle: () => void;
}

export function MusicPlayer({ 
    songs, 
    currentSongIndex, 
    onSongChange, 
    isShuffled, 
    onShuffleToggle 
}: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentSong = songs[currentSongIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentSongIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(console.error);
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = () => {
        const nextIndex = (currentSongIndex + 1) % songs.length;
        onSongChange(nextIndex);
    };

    const handlePrevious = () => {
        const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
        onSongChange(prevIndex);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current && isFinite(value[0]) && isFinite(duration) && duration > 0) {
            audioRef.current.currentTime = value[0];
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

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!currentSong) return null;

    return (
        <div className="border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
            <audio
                ref={audioRef}
                src={currentSong.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div className="container mx-auto px-4 py-3">
                <div className="mb-2 space-y-1">
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

                <div className="flex items-center justify-between gap-4">
                    {/* Left section - Song info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-primary/10">
                            <Music className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{currentSong.title}</p>
                            <p className="truncate text-sm text-muted-foreground">{currentSong.songName}</p>
                        </div>
                    </div>

                    {/* Center section - Controls */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onShuffleToggle}
                            className={cn('hidden sm:inline-flex', isShuffled && 'text-primary')}
                        >
                            <Shuffle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handlePrevious}>
                            <SkipBack className="h-5 w-5" />
                        </Button>
                        <Button size="icon" className="h-10 w-10" onClick={handlePlayPause}>
                            {isPlaying ? (
                                <Pause className="h-5 w-5" />
                            ) : (
                                <Play className="h-5 w-5" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNext}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Right section - Volume */}
                    <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
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
                            className="w-24"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
