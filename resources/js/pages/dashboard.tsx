import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Search, Users, Library, Disc3, FolderOpen, FileAudio, FileVideo, FileText, ExternalLink } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Asset {
    id: number;
    uuid: string;
    name: string;
    type: 'mp3' | 'mp4' | 'pdf';
    url: string;
}

interface Song {
    id: number;
    uuid: string;
    name: string;
    category: string;
    description: string | null;
    assets: Asset[];
}

interface Stats {
    totalChoirs: number;
    totalSongs: number;
    totalMp3s: number;
    totalAssets: number;
}

interface DashboardProps {
    songs: Song[];
    stats: Stats;
}

export default function Dashboard({ songs, stats }: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter songs based on search query - includes asset names and types
    const filteredSongs = useMemo(() => {
        if (!searchQuery) return songs;
        const query = searchQuery.toLowerCase();
        return songs.filter(song => {
            const matchesSong = song.name.toLowerCase().includes(query) ||
                song.category.toLowerCase().includes(query) ||
                (song.description?.toLowerCase().includes(query) ?? false);
            
            const matchesAssets = song.assets.some(asset => 
                asset.name.toLowerCase().includes(query) ||
                asset.type.toLowerCase().includes(query)
            );
            
            return matchesSong || matchesAssets;
        });
    }, [songs, searchQuery]);

    const getAssetIcon = (type: string) => {
        switch (type) {
            case 'mp3':
                return <FileAudio className="h-4 w-4" />;
            case 'mp4':
                return <FileVideo className="h-4 w-4" />;
            case 'pdf':
                return <FileText className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getAssetColor = (type: string) => {
        switch (type) {
            case 'mp3':
                return 'bg-blue-500/10 text-blue-500';
            case 'mp4':
                return 'bg-purple-500/10 text-purple-500';
            case 'pdf':
                return 'bg-red-500/10 text-red-500';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    if (songs.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-4">
                    <Library className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">No songs available</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Statistics Section */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalChoirs}</p>
                                <p className="text-sm text-muted-foreground">Choirs</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <Library className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalSongs}</p>
                                <p className="text-sm text-muted-foreground">Songs</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <Disc3 className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalMp3s}</p>
                                <p className="text-sm text-muted-foreground">MP3 Files</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                                <FolderOpen className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalAssets}</p>
                                <p className="text-sm text-muted-foreground">Total Assets</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search songs, categories, or assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Songs List Section */}
                <div className="flex-1 overflow-hidden rounded-lg border bg-card">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Songs ({filteredSongs.length})</h2>
                    </div>
                    <ScrollArea className="h-[calc(100vh-25rem)]">
                        <div className="divide-y">
                            {filteredSongs.map((song) => (
                                <div
                                    key={song.id}
                                    className="p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium">{song.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {song.category}
                                                </p>
                                                {song.description && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {song.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="secondary">
                                                {song.assets.length} {song.assets.length === 1 ? 'asset' : 'assets'}
                                            </Badge>
                                        </div>
                                        
                                        {song.assets.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {song.assets.map((asset) => (
                                                    <a
                                                        key={asset.id}
                                                        href={asset.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
                                                    >
                                                        <div className={`flex h-6 w-6 items-center justify-center rounded ${getAssetColor(asset.type)}`}>
                                                            {getAssetIcon(asset.type)}
                                                        </div>
                                                        <span className="font-medium">{asset.name}</span>
                                                        <span className="text-xs text-muted-foreground uppercase">
                                                            {asset.type}
                                                        </span>
                                                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </AppLayout>
    );
}
