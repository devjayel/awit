import { Head, router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
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

type Choir = {
    id: number;
    name: string;
    email: string;
    level: string;
    role: string;
    voice_designation: string | null;
    code: string;
    created_at: string;
    updated_at: string;
};

type Props = {
    choirs: PaginatedData<Choir>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Choirs',
        href: '/choirs',
    },
];

const LEVEL_OPTIONS = [
    'Locale Choir',
    'KKTK Locale Choir',
    'City Choir',
    'Division Choir',
    'Region Choir',
    'National Choir',
    'MMC',
    'Other',
];

const ROLE_OPTIONS = [
    'Member',
    'Coordinator/President',
    'Secretary',
    'Treasurer',
    'Auditor',
    'Other',
];

const VOICE_OPTIONS = [
    'Soprano 1',
    'Soprano 2',
    'Alto 1',
    'Alto 2',
    'Tenor 1',
    'Tenor 2',
    'Bass 1',
    'Bass 2',
];

export default function ChoirsIndex({ choirs }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedChoir, setSelectedChoir] = useState<Choir | null>(null);

    // Track "Other" selections for create form
    const [createLevelOther, setCreateLevelOther] = useState(false);
    const [createRoleOther, setCreateRoleOther] = useState(false);

    // Track "Other" selections for edit form
    const [editLevelOther, setEditLevelOther] = useState(false);
    const [editRoleOther, setEditRoleOther] = useState(false);

    const createForm = useForm({
        name: '',
        email: '',
        level: '',
        role: '',
        voice_designation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        level: '',
        role: '',
        voice_designation: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/choirs', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
                setCreateLevelOther(false);
                setCreateRoleOther(false);
            },
        });
    };

    const handleEdit = (choir: Choir) => {
        setSelectedChoir(choir);
        
        // Check if values are not in predefined options (meaning they're custom/other)
        const isLevelOther = Boolean(choir.level && !LEVEL_OPTIONS.slice(0, -1).includes(choir.level));
        const isRoleOther = Boolean(choir.role && !ROLE_OPTIONS.slice(0, -1).includes(choir.role));
        
        setEditLevelOther(isLevelOther);
        setEditRoleOther(isRoleOther);
        
        editForm.setData({
            name: choir.name,
            email: choir.email,
            level: isLevelOther ? choir.level : (choir.level || ''),
            role: isRoleOther ? choir.role : (choir.role || ''),
            voice_designation: choir.voice_designation || '',
        });
        
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChoir) return;

        editForm.put(`/choirs/${selectedChoir.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedChoir(null);
                setEditLevelOther(false);
                setEditRoleOther(false);
            },
        });
    };

    const handleDelete = (choir: Choir) => {
        setSelectedChoir(choir);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedChoir) return;

        router.delete(`/choirs/${selectedChoir.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedChoir(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Choir Members" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-amber-950">
                            Choir Members
                        </h1>
                        <p className="text-sm text-gray-700">
                            Manage the choir that can access the music sheets and other resources.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Voice</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {choirs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center text-muted-foreground"
                                    >
                                        No choir members found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                choirs.data.map((choir: Choir) => (
                                    <TableRow key={choir.id}>
                                        <TableCell className="font-medium">
                                            {choir.name}
                                        </TableCell>
                                        <TableCell>{choir.email}</TableCell>
                                        <TableCell>{choir.level}</TableCell>
                                        <TableCell>{choir.role}</TableCell>
                                        <TableCell>
                                            {choir.voice_designation || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <code className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">
                                                {choir.code}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(choir)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(choir)
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
                {choirs.links && choirs.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2">
                        {choirs.links.map((link: PaginationLink, index: number) => (
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
                        <DialogTitle>Add Choir Member</DialogTitle>
                        <DialogDescription>
                            Add a new member to your choir.
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
                                <Label htmlFor="create-email">Email</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={createForm.errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-level">Level</Label>
                                <Select
                                    value={createLevelOther ? 'Other' : createForm.data.level}
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setCreateLevelOther(true);
                                            createForm.setData('level', '');
                                        } else {
                                            setCreateLevelOther(false);
                                            createForm.setData('level', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="create-level">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEVEL_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createLevelOther && (
                                    <Input
                                        placeholder="Enter custom level"
                                        value={createForm.data.level}
                                        onChange={(e) =>
                                            createForm.setData('level', e.target.value)
                                        }
                                        required
                                    />
                                )}
                                <InputError message={createForm.errors.level} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-role">Role</Label>
                                <Select
                                    value={createRoleOther ? 'Other' : createForm.data.role}
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setCreateRoleOther(true);
                                            createForm.setData('role', '');
                                        } else {
                                            setCreateRoleOther(false);
                                            createForm.setData('role', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="create-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createRoleOther && (
                                    <Input
                                        placeholder="Enter custom role"
                                        value={createForm.data.role}
                                        onChange={(e) =>
                                            createForm.setData('role', e.target.value)
                                        }
                                        required
                                    />
                                )}
                                <InputError message={createForm.errors.role} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-voice">
                                    Voice Designation (Optional)
                                </Label>
                                <Select
                                    value={createForm.data.voice_designation}
                                    onValueChange={(value) =>
                                        createForm.setData('voice_designation', value)
                                    }
                                >
                                    <SelectTrigger id="create-voice">
                                        <SelectValue placeholder="Select voice designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VOICE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={
                                        createForm.errors.voice_designation
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setCreateLevelOther(false);
                                    setCreateRoleOther(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                            >
                                Add Member
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Choir Member</DialogTitle>
                        <DialogDescription>
                            Update the member's information.
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
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={editForm.errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-level">Level</Label>
                                <Select
                                    value={editLevelOther ? 'Other' : editForm.data.level}
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setEditLevelOther(true);
                                            editForm.setData('level', '');
                                        } else {
                                            setEditLevelOther(false);
                                            editForm.setData('level', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="edit-level">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEVEL_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editLevelOther && (
                                    <Input
                                        placeholder="Enter custom level"
                                        value={editForm.data.level}
                                        onChange={(e) =>
                                            editForm.setData('level', e.target.value)
                                        }
                                        required
                                    />
                                )}
                                <InputError message={editForm.errors.level} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                    value={editRoleOther ? 'Other' : editForm.data.role}
                                    onValueChange={(value) => {
                                        if (value === 'Other') {
                                            setEditRoleOther(true);
                                            editForm.setData('role', '');
                                        } else {
                                            setEditRoleOther(false);
                                            editForm.setData('role', value);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editRoleOther && (
                                    <Input
                                        placeholder="Enter custom role"
                                        value={editForm.data.role}
                                        onChange={(e) =>
                                            editForm.setData('role', e.target.value)
                                        }
                                        required
                                    />
                                )}
                                <InputError message={editForm.errors.role} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-voice">
                                    Voice Designation (Optional)
                                </Label>
                                <Select
                                    value={editForm.data.voice_designation}
                                    onValueChange={(value) =>
                                        editForm.setData('voice_designation', value)
                                    }
                                >
                                    <SelectTrigger id="edit-voice">
                                        <SelectValue placeholder="Select voice designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VOICE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={editForm.errors.voice_designation}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditLevelOther(false);
                                    setEditRoleOther(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Update Member
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Choir Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{selectedChoir?.name}</strong>? This action
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
