import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import * as songRoutes from '@/routes/songs';
import * as songAssetRoutes from '@/routes/songs/assets';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedData, PaginationLink } from '@/types';

type Song = {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    category: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
};

type Props = {
    songs: PaginatedData<Song>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Songs',
        href: '/songs',
    },
];

const CATEGORY_OPTIONS = ['Tanging Awit', 'Hymn', 'Other'];

export default function SongsIndex({ songs }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [createCategoryOther, setCreateCategoryOther] = useState(false);
    const [editCategoryOther, setEditCategoryOther] = useState(false);

    const createForm = useForm({
        name: '',
        description: '',
        category: '',
        active: true,
    });

    const editForm = useForm({
        name: '',
        description: '',
        category: '',
        active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/songs', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                setCreateCategoryOther(false);
            },
        });
    };

    const handleEdit = (song: Song) => {
        setSelectedSong(song);
        
        const isCategoryOther = Boolean(
            song.category && !CATEGORY_OPTIONS.slice(0, -1).includes(song.category)
        );
        
        setEditCategoryOther(isCategoryOther);
        
        editForm.setData({
            name: song.name,
            description: song.description ?? '',
            category: (isCategoryOther ? song.category : song.category) ?? '',
            active: song.active,
        });
        
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSong) return;

        editForm.put(`/songs/${selectedSong.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedSong(null);
                setEditCategoryOther(false);
            },
        });
    };

    const handleDelete = (song: Song) => {
        setSelectedSong(song);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedSong) return;

        router.delete(`/songs/${selectedSong.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedSong(null);
            },
        });
    };

    const viewAssets = (songUuid: string) => {
        router.visit(songAssetRoutes.index.url(songUuid));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Songs" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-amber-950">
                            Songs
                        </h1>
                        <p className="text-sm text-gray-700">
                            Manage your song collection
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Song
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {songs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        No songs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                songs.data.map((song: Song) => (
                                    <TableRow key={song.id}>
                                        <TableCell className="font-medium">
                                            {song.name}
                                        </TableCell>
                                        <TableCell>
                                            {song.category || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {song.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                                    song.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {song.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        viewAssets(song.uuid)
                                                    }
                                                    title="View Assets"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(song)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(song)
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
                {songs.links && songs.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {songs.links.map((link: PaginationLink, index: number) => (
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Song</DialogTitle>
                        <DialogDescription>
                            Create a new song in your collection.
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
                                <Label htmlFor="create-category">
                                    Category (Optional)
                                </Label>
                                <Select
                                    value={
                                        createCategoryOther
                                            ? 'Other'
                                            : createForm.data.category
                                    }
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setCreateCategoryOther(true);
                                            createForm.setData('category', '');
                                        } else {
                                            setCreateCategoryOther(false);
                                            createForm.setData('category', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="create-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createCategoryOther && (
                                    <Input
                                        placeholder="Enter custom category"
                                        value={createForm.data.category}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}
                                <InputError
                                    message={createForm.errors.category}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="create-description"
                                    value={createForm.data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        createForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                                <InputError
                                    message={createForm.errors.description}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="create-active"
                                    checked={createForm.data.active}
                                    onCheckedChange={(checked) =>
                                        createForm.setData('active', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="create-active"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Active
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setCreateCategoryOther(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Add Song
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Song</DialogTitle>
                        <DialogDescription>
                            Update the song information.
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
                                <Label htmlFor="edit-category">
                                    Category (Optional)
                                </Label>
                                <Select
                                    value={
                                        editCategoryOther
                                            ? 'Other'
                                            : editForm.data.category
                                    }
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setEditCategoryOther(true);
                                            editForm.setData('category', '');
                                        } else {
                                            setEditCategoryOther(false);
                                            editForm.setData('category', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="edit-category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editCategoryOther && (
                                    <Input
                                        placeholder="Enter custom category"
                                        value={editForm.data.category}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'category',
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}
                                <InputError
                                    message={editForm.errors.category}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                                <InputError
                                    message={editForm.errors.description}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={editForm.data.active}
                                    onCheckedChange={(checked) =>
                                        editForm.setData('active', checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="edit-active"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Active
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditCategoryOther(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update Song
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Song</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{selectedSong?.name}</strong>? This action
                            will also delete all associated assets and cannot be
                            undone.
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
