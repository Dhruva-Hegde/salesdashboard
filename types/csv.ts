export type ColumnType = 'string' | 'number' | 'date';

export interface ColumnSchema {
  name: string;
  type: ColumnType;
}

export interface CSVData {
  columns: ColumnSchema[];
  rows: Record<string, any>[];
  fileName: string;
  path: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
}
