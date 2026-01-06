import fs from 'fs';
import path from 'path';
import { FileTreeNode } from '@/types/csv';

const DATA_DIR = path.join(process.cwd(), 'data');

export function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export function getFileTree(dir: string = DATA_DIR): FileTreeNode[] {
    ensureDataDir();
    const items = fs.readdirSync(dir, { withFileTypes: true });

    return items.map(item => {
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(DATA_DIR, fullPath);

        if (item.isDirectory()) {
            return {
                name: item.name,
                path: relativePath,
                type: 'folder',
                children: getFileTree(fullPath)
            };
        } else {
            return {
                name: item.name,
                path: relativePath,
                type: 'file'
            };
        }
    });
}

export function readCSVFile(relativePath: string): string {
    const fullPath = path.join(DATA_DIR, relativePath);
    if (!fs.existsSync(fullPath) || !fullPath.startsWith(DATA_DIR)) {
        throw new Error('File not found or access denied');
    }
    return fs.readFileSync(fullPath, 'utf-8');
}

export function writeCSVFile(relativePath: string, content: string) {
    const fullPath = path.join(DATA_DIR, relativePath);
    if (!fullPath.startsWith(DATA_DIR)) {
        throw new Error('Access denied');
    }
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
}

export function deletePath(relativePath: string) {
    const fullPath = path.join(DATA_DIR, relativePath);
    if (!fullPath.startsWith(DATA_DIR)) {
        throw new Error('Access denied');
    }
    if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
}

export function renamePath(oldRelativePath: string, newRelativePath: string) {
    const oldPath = path.join(DATA_DIR, oldRelativePath);
    const newPath = path.join(DATA_DIR, newRelativePath);
    if (!oldPath.startsWith(DATA_DIR) || !newPath.startsWith(DATA_DIR)) {
        throw new Error('Access denied');
    }
    fs.renameSync(oldPath, newPath);
}

export function createFolder(relativePath: string) {
    const fullPath = path.join(DATA_DIR, relativePath);
    if (!fullPath.startsWith(DATA_DIR)) {
        throw new Error('Access denied');
    }
    fs.mkdirSync(fullPath, { recursive: true });
}
