'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileTreeNode } from '@/types/csv';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    FolderIcon,
    FileIcon,
    ChevronRight,
    ChevronDown,
    Plus,
    Upload,
    Trash2,
    Edit2,
    MoreVertical,
    FolderPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface FileTreeProps {
    onSelectCSV: (path: string) => void;
    selectedPath?: string;
}

export function FileTree({ onSelectCSV, selectedPath }: FileTreeProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [tree, setTree] = useState<FileTreeNode[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [dialog, setDialog] = useState<{
        type: 'rename' | 'newFolder' | 'upload' | 'delete',
        node?: FileTreeNode,
        value?: string
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTree = async () => {
        const res = await fetch('/api/files');
        const data = await res.json();
        if (data.tree) setTree(data.tree);
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const toggleExpand = (path: string) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleAction = async () => {
        if (!dialog) return;

        try {
            if (dialog.type === 'rename' && dialog.node && dialog.value) {
                const oldPath = dialog.node.path;
                const dir = oldPath.split('/').slice(0, -1).join('/');
                const newPath = dir ? `${dir}/${dialog.value}` : dialog.value;

                const res = await fetch('/api/csv', {
                    method: 'PATCH',
                    body: JSON.stringify({ oldPath, newPath }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!res.ok) throw new Error('Rename failed');
                toast.success('Renamed successfully');
            }
            else if (dialog.type === 'newFolder' && dialog.value) {
                const parentPath = dialog.node?.path || '';
                const newPath = parentPath ? `${parentPath}/${dialog.value}` : dialog.value;

                const res = await fetch('/api/folder', {
                    method: 'POST',
                    body: JSON.stringify({ path: newPath }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!res.ok) throw new Error('Folder creation failed');
                toast.success('Folder created');
            }
            else if (dialog.type === 'delete' && dialog.node) {
                const res = await fetch(`/api/csv?path=${dialog.node.path}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Delete failed');
                toast.success('Deleted successfully');

                // If the deleted node was selected, clear the path param
                if (selectedPath === dialog.node.path) {
                    router.push(pathname);
                }
            }

            await fetchTree();
            setDialog(null);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !dialog) return;

        const formData = new FormData();
        formData.append('file', file);
        const parentPath = dialog.node?.path || '';
        const filePath = parentPath ? `${parentPath}/${file.name}` : file.name;
        formData.append('path', filePath);

        try {
            const res = await fetch('/api/csv/upload', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            toast.success('File uploaded');
            await fetchTree();
            setDialog(null);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const renderNode = (node: FileTreeNode, depth: number = 0) => {
        const isExpanded = expanded[node.path];
        const isSelected = selectedPath === node.path;

        return (
            <div key={node.path} className="select-none">
                <div
                    className={cn(
                        "flex items-center py-1 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer rounded-md transition-colors group",
                        isSelected && "bg-zinc-100 dark:bg-zinc-800 border-l-2 border-blue-500"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => {
                        if (node.type === 'folder') {
                            toggleExpand(node.path);
                        } else {
                            onSelectCSV(node.path);
                        }
                    }}
                >
                    {node.type === 'folder' ? (
                        <>
                            {isExpanded ? <ChevronDown className="w-4 h-4 mr-1 text-zinc-500" /> : <ChevronRight className="w-4 h-4 mr-1 text-zinc-500" />}
                            <FolderIcon className="w-4 h-4 mr-2 text-amber-500 fill-amber-500/20" />
                        </>
                    ) : (
                        <>
                            <div className="w-5" />
                            <FileIcon className="w-4 h-4 mr-2 text-blue-500 fill-blue-500/20" />
                        </>
                    )}
                    <span className="text-sm font-medium truncate flex-1">{node.name}</span>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {node.type === 'folder' && (
                                    <>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDialog({ type: 'newFolder', node, value: '' }); }}>
                                            <FolderPlus className="w-4 h-4 mr-2" /> New Folder
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDialog({ type: 'upload', node }); }}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload CSV
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDialog({ type: 'rename', node, value: node.name }); }}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDialog({ type: 'delete', node }); }}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {node.type === 'folder' && isExpanded && node.children && (
                    <div>
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-1 p-2">
            <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Files</h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="New Folder" onClick={() => setDialog({ type: 'newFolder', value: '' })}>
                        <Plus className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Upload" onClick={() => setDialog({ type: 'upload' })}>
                        <Upload className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {tree.length === 0 && (
                <div className="text-center py-4 text-xs text-zinc-400">
                    No files yet
                </div>
            )}

            {tree.map(node => renderNode(node))}

            {/* Dialogs */}
            <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialog?.type === 'rename' && 'Rename'}
                            {dialog?.type === 'newFolder' && 'New Folder'}
                            {dialog?.type === 'upload' && 'Upload CSV'}
                            {dialog?.type === 'delete' && 'Delete'}
                        </DialogTitle>
                    </DialogHeader>

                    {dialog?.type === 'delete' ? (
                        <p className="text-sm text-zinc-500">
                            Are you sure you want to delete <span className="font-bold">{dialog.node?.name}</span>? This action cannot be undone.
                        </p>
                    ) : dialog?.type === 'upload' ? (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-zinc-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                                <p className="text-sm text-zinc-600">Click to select a CSV file</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{dialog?.type === 'rename' ? 'New Name' : 'Folder Name'}</Label>
                                <Input
                                    value={dialog?.value || ''}
                                    onChange={(e) => setDialog(prev => prev ? { ...prev, value: e.target.value } : null)}
                                    placeholder="Enter name..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
                        {dialog?.type !== 'upload' && (
                            <Button
                                variant={dialog?.type === 'delete' ? 'destructive' : 'default'}
                                onClick={handleAction}
                            >
                                {dialog?.type === 'delete' ? 'Delete' : 'Confirm'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
