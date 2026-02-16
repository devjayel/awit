import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit2, Eye, FileAudio, FileText, FileVideo, Plus, Trash2, Upload } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import InputError from '@/components/input-error';
import { MusicPlayer } from '@/components/music-player';
import { VideoPlayer } from '@/components/video-player';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData, PaginationLink } from '@/types';
import { cn } from '@/lib/utils';
import * as songRoutes from '@/routes/songs';

type SongAsset = {
    id: number;
    uuid: string;
    song_id: number;
    name: string;
    type: 'mp3' | 'mp4' | 'pdf';
    path: string;
    active: boolean;
    created_at: string;
    updated_at: string;
};

type Song = {
    id: number;
    uuid: string;
    name: string;
};

type Props = {
    song: Song;
    assets: PaginatedData<SongAsset>;
};

const FILE_TYPE_OPTIONS = ['mp3', 'mp4', 'pdf'];

const getFileIcon = (type: string) => {
    switch (type) {
        case 'mp3':
            return <FileAudio className="h-4 w-4 text-purple-600" />;
        case 'mp4':
            return <FileVideo className="h-4 w-4 text-blue-600" />;
        case 'pdf':
            return <FileText className="h-4 w-4 text-red-600" />;
        default:
            return null;
    }
};

const getAcceptedFileTypes = (type: string) => {
    switch (type) {
        case 'mp3':
            return 'audio/mpeg,audio/mp3';
        case 'mp4':
            return 'video/mp4';
        case 'pdf':
            return 'application/pdf';
        default:
            return '';
    }
};

interface FileUploadProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept: string;
    error?: string;
}

function FileUpload({ file, onFileChange, accept, error }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
                onFileChange(droppedFile);
            }
        },
        [onFileChange]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileChange(selectedFile);
        }
    };

    return (
        <div className="grid gap-2">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400',
                    error && 'border-red-500'
                )}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                {file ? (
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Drag and drop your file here, or click to browse
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Accepted formats: {accept.split(',').join(', ')}
                        </p>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {file && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        onFileChange(null);
                    }}
                >
                    Clear file
                </Button>
            )}
        </div>
    );
}

export default function SongAssetsIndex({ song, assets }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isPdfViewOpen, setIsPdfViewOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<SongAsset | null>(null);
    const [selectedAudioAsset, setSelectedAudioAsset] = useState<SongAsset | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isPageDragging, setIsPageDragging] = useState(false);

    // Music player state
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [playlistOrder, setPlaylistOrder] = useState<number[]>([]);
    
    // Video player state
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isVideoShuffled, setIsVideoShuffled] = useState(false);
    const [videoPlaylistOrder, setVideoPlaylistOrder] = useState<number[]>([]);

    // Transform MP3 assets for music player
    const mp3Songs = useMemo(() => {
        return assets.data
            .filter(asset => asset.type === 'mp3' && asset.active)
            .map((asset) => ({
                id: asset.id,
                uuid: asset.uuid,
                title: asset.name,
                songName: song.name,
                category: asset.type,
                url: `/song-assets/${asset.uuid}/serve`,
            }));
    }, [assets.data, song.name]);
    
    // Transform MP4 assets for video player
    const mp4Videos = useMemo(() => {
        return assets.data
            .filter(asset => asset.type === 'mp4' && asset.active)
            .map((asset) => ({
                id: asset.id,
                uuid: asset.uuid,
                title: asset.name,
                songName: song.name,
                category: asset.type,
                url: `/song-assets/${asset.uuid}/serve`,
            }));
    }, [assets.data, song.name]);

    // Initialize playlist order
    useMemo(() => {
        if (mp3Songs.length > 0 && playlistOrder.length === 0) {
            setPlaylistOrder(mp3Songs.map((_, i) => i));
        }
    }, [mp3Songs, playlistOrder.length]);
    
    // Initialize video playlist order
    useMemo(() => {
        if (mp4Videos.length > 0 && videoPlaylistOrder.length === 0) {
            setVideoPlaylistOrder(mp4Videos.map((_, i) => i));
        }
    }, [mp4Videos, videoPlaylistOrder.length]);

    // Get display songs in current order
    const displaySongs = useMemo(() => {
        if (!isShuffled) return mp3Songs;
        return playlistOrder.map(index => mp3Songs[index]).filter(Boolean);
    }, [mp3Songs, isShuffled, playlistOrder]);
    
    // Get display videos in current order
    const displayVideos = useMemo(() => {
        if (!isVideoShuffled) return mp4Videos;
        return videoPlaylistOrder.map(index => mp4Videos[index]).filter(Boolean);
    }, [mp4Videos, isVideoShuffled, videoPlaylistOrder]);

    const createForm = useForm<{
        song_id: number;
        name: string;
        type: string;
        file: File | null;
        active: boolean;
    }>({
        song_id: song.id,
        name: '',
        type: '',
        file: null,
        active: true,
    });

    const editForm = useForm<{
        song_id: number;
        name: string;
        type: string;
        file: File | null;
        active: boolean;
    }>({
        song_id: song.id,
        name: '',
        type: '',
        file: null,
        active: true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Songs',
            href: '/songs',
        },
        {
            title: song.name,
            href: `/songs/${song.uuid}/assets`,
        },
    ];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('song_id', createForm.data.song_id.toString());
        formData.append('name', createForm.data.name);
        formData.append('type', createForm.data.type);
        formData.append('active', createForm.data.active ? '1' : '0');
        if (createForm.data.file) {
            formData.append('file', createForm.data.file);
        }

        router.post('/song-assets', formData, {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEdit = (asset: SongAsset) => {
        setSelectedAsset(asset);
        editForm.setData({
            song_id: asset.song_id,
            name: asset.name,
            type: asset.type,
            file: null,
            active: asset.active,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;

        const formData = new FormData();
        formData.append('song_id', editForm.data.song_id.toString());
        formData.append('name', editForm.data.name);
        formData.append('type', editForm.data.type);
        formData.append('active', editForm.data.active ? '1' : '0');
        formData.append('_method', 'PUT');
        if (editForm.data.file) {
            formData.append('file', editForm.data.file);
        }

        router.post(`/song-assets/${selectedAsset.uuid}`, formData, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedAsset(null);
            },
        });
    };

    const handleView = (asset: SongAsset) => {
        setSelectedAsset(asset);
        if (asset.type === 'pdf') {
            setPageNumber(1);
            // Set first MP3 as default audio if available
            const firstMp3 = assets.data.find(a => a.type === 'mp3');
            setSelectedAudioAsset(firstMp3 || null);
            setIsPdfViewOpen(true);
        } else {
            setIsViewOpen(true);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleDelete = (asset: SongAsset) => {
        setSelectedAsset(asset);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedAsset) return;

        router.delete(`/song-assets/${selectedAsset.uuid}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);

                setSelectedAsset(null);
            },
        });
    };

    const goBack = () => {
        router.visit(songRoutes.index.url());
    };

    const handleShuffleToggle = () => {
        if (!isShuffled) {
            // Shuffle the playlist
            const shuffled = [...Array(mp3Songs.length).keys()];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setPlaylistOrder(shuffled);
            setCurrentSongIndex(0);
        } else {
            // Reset to original order
            setPlaylistOrder(mp3Songs.map((_, i) => i));
            setCurrentSongIndex(0);
        }
        setIsShuffled(!isShuffled);
    };

    const handleSongSelect = (index: number) => {
        setCurrentSongIndex(index);
    };
    
    const handleVideoShuffleToggle = () => {
        if (!isVideoShuffled) {
            // Shuffle the video playlist
            const shuffled = [...Array(mp4Videos.length).keys()];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setVideoPlaylistOrder(shuffled);
            setCurrentVideoIndex(0);
        } else {
            // Reset to original order
            setVideoPlaylistOrder(mp4Videos.map((_, i) => i));
            setCurrentVideoIndex(0);
        }
        setIsVideoShuffled(!isVideoShuffled);
    };
    
    const handleVideoSelect = (index: number) => {
        setCurrentVideoIndex(index);
    };

    const getFileTypeFromExtension = (filename: string): string | null => {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp3':
                return 'mp3';
            case 'mp4':
                return 'mp4';
            case 'pdf':
                return 'pdf';
            default:
                return null;
        }
    };

    const handlePageDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPageDragging(true);
    }, []);

    const handlePageDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if we're leaving the container itself
        if (e.currentTarget === e.target) {
            setIsPageDragging(false);
        }
    }, []);

    const handlePageDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPageDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const fileType = getFileTypeFromExtension(droppedFile.name);
            if (fileType) {
                // Set form data with the dropped file
                createForm.setData({
                    song_id: song.id,
                    name: droppedFile.name.replace(/\.[^/.]+$/, ''), // Remove extension from name
                    type: fileType,
                    file: droppedFile,
                    active: true,
                });
                // Open the create modal
                setIsCreateOpen(true);
            }
        }
    }, [createForm, song.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${song.name} - Assets`} />

            <div
                className={cn(
                    "flex h-full flex-1 flex-col gap-4 rounded-xl p-4 pb-44 transition-colors relative",
                    isPageDragging && "bg-blue-50 border-2 border-dashed border-blue-400"
                )}
                onDragOver={handlePageDragOver}
                onDragLeave={handlePageDragLeave}
                onDrop={handlePageDrop}
            >
                {isPageDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/90 rounded-xl pointer-events-none">
                        <div className="flex flex-col items-center gap-4">
                            <Upload className="h-16 w-16 text-blue-600 animate-bounce" />
                            <p className="text-lg font-semibold text-blue-900">Drop file to add asset</p>
                            <p className="text-sm text-blue-700">Supports MP3, MP4, and PDF files</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goBack}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-amber-950">
                                {song.name}
                            </h1>
                            <p className="text-sm text-gray-700">
                                Manage song assets
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Asset
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        No assets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.data.map((asset: SongAsset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getFileIcon(asset.type)}
                                                <span className="font-mono text-xs uppercase">
                                                    {asset.type}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {asset.name}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${asset.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {asset.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleView(asset)
                                                    }
                                                    title="View/Play"
                                                >
                                                    <Eye className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(asset)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(asset)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {assets.links && assets.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {assets.links.map((link: PaginationLink, index: number) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Asset</DialogTitle>
                        <DialogDescription>
                            Upload a new asset for this song.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">Name</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={createForm.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-type">File Type</Label>
                                <Select
                                    value={createForm.data.type}
                                    onValueChange={(value) =>
                                        createForm.setData('type', value)
                                    }
                                    required
                                >
                                    <SelectTrigger id="create-type">
                                        <SelectValue placeholder="Select file type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FILE_TYPE_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={createForm.errors.type} />
                            </div>
                            {createForm.data.type && (
                                <div className="grid gap-2">
                                    <Label>Upload File</Label>
                                    <FileUpload
                                        file={createForm.data.file}
                                        onFileChange={(file) =>
                                            createForm.setData('file', file)
                                        }
                                        accept={getAcceptedFileTypes(
                                            createForm.data.type
                                        )}
                                        error={createForm.errors.file}
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    createForm.processing ||
                                    !createForm.data.file
                                }
                            >
                                Add Asset
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Asset</DialogTitle>
                        <DialogDescription>
                            Update the asset information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={editForm.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-type">File Type</Label>
                                <Select
                                    value={editForm.data.type}
                                    onValueChange={(value) =>
                                        editForm.setData('type', value)
                                    }
                                    required
                                >
                                    <SelectTrigger id="edit-type">
                                        <SelectValue placeholder="Select file type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FILE_TYPE_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={editForm.errors.type} />
                            </div>
                            {editForm.data.type && (
                                <div className="grid gap-2">
                                    <Label>
                                        Upload New File (Optional)
                                    </Label>
                                    <FileUpload
                                        file={editForm.data.file}
                                        onFileChange={(file) =>
                                            editForm.setData('file', file)
                                        }
                                        accept={getAcceptedFileTypes(
                                            editForm.data.type
                                        )}
                                        error={editForm.errors.file}
                                    />
                                    {!editForm.data.file && (
                                        <p className="text-xs text-gray-500">
                                            Leave empty to keep the existing file
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update Asset
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View/Player Modal for Audio and Video */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="md:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedAsset?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedAsset?.type.toUpperCase()} file viewer
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedAsset && (
                            <div className="w-full">
                                {selectedAsset.type === 'mp3' && mp3Songs.length > 0 && (
                                    <MusicPlayer
                                        songs={displaySongs}
                                        currentSongIndex={currentSongIndex}
                                        onSongChange={handleSongSelect}
                                        isShuffled={isShuffled}
                                        onShuffleToggle={handleShuffleToggle}
                                    />
                                )}
                                {selectedAsset.type === 'mp4' && mp4Videos.length > 0 && (
                                    <VideoPlayer
                                        videos={displayVideos}
                                        currentVideoIndex={currentVideoIndex}
                                        onVideoChange={handleVideoSelect}
                                        isShuffled={isVideoShuffled}
                                        onShuffleToggle={handleVideoShuffleToggle}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsViewOpen(false)}
                        >
                            Close
                        </Button>
                        {selectedAsset && (
                            <Button
                                type="button"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `/song-assets/${selectedAsset.uuid}/serve`;
                                    link.download = selectedAsset.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                Download
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PDF Viewer Sheet - Right Side Panel */}
            <Sheet open={isPdfViewOpen} onOpenChange={setIsPdfViewOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl">
                    <SheetHeader className='border-b'>
                        <SheetTitle>{selectedAsset?.name}</SheetTitle>
                        <SheetDescription>
                            {numPages ? `${numPages} pages` : 'Loading...'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        {/* PDF Viewer Section */}
                        {selectedAsset && (
                            <div className="flex flex-col items-center gap-4">
                                <Document
                                    file={`/song-assets/${selectedAsset.uuid}/serve`}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex h-96 items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-16 w-16 animate-pulse text-red-600" />
                                                <p className="text-sm text-gray-600">Loading PDF...</p>
                                            </div>
                                        </div>
                                    }
                                    error={
                                        <div className="flex h-96 items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="h-16 w-16 text-red-600" />
                                                <p className="text-sm text-red-600">Failed to load PDF</p>
                                            </div>
                                        </div>
                                    }
                                >
                                    {numPages && Array.from(new Array(numPages), (_, index) => (
                                        <div key={`page_${index + 1}`} className="mb-4">
                                            <Page
                                                pageNumber={index + 1}
                                                renderTextLayer={true}
                                                renderAnnotationLayer={true}
                                                width={Math.min(window.innerWidth * 0.5, 800)}
                                            />

                                        </div>
                                    ))}
                                </Document>
                            </div>
                        )}
                    </div>
                    <SheetFooter className="border-t p-4">
                        <div className="w-full flex flex-col gap-4">
                            {/* Music Player Section */}
                            {mp3Songs.length > 0 && (
                                <div className="w-full">
                                    <MusicPlayer
                                        songs={displaySongs}
                                        currentSongIndex={currentSongIndex}
                                        onSongChange={handleSongSelect}
                                        isShuffled={isShuffled}
                                        onShuffleToggle={handleShuffleToggle}
                                    />
                                </div>
                            )}
                            {selectedAsset && (
                                <Button
                                    type="button"
                                    className="w-full"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `/song-assets/${selectedAsset.uuid}/serve`;
                                        link.download = selectedAsset.name;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                >
                                    Download PDF
                                </Button>
                            )}
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Asset</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{selectedAsset?.name}</strong>? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
