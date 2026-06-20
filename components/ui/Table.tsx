'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}
export function Table<T extends { id: string }>({ columns, data, onRowClick, loading, emptyMessage = 'لا توجد بيانات', className }: TableProps<T>) {
  if (loading) return <div className="flex items-center justify-center h-40 text-hs-muted">جاري التحميل...</div>;
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-hs-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hs-border bg-hs-bg3">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-right text-xs text-hs-muted uppercase tracking-wider font-medium first:rounded-tl-xl last:rounded-tr-xl">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-10 text-hs-muted">{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id} onClick={() => onRowClick?.(row)} className={cn('border-b border-hs-border/50 last:border-0 transition-colors', onRowClick && 'cursor-pointer hover:bg-hs-bg3', i % 2 === 0 ? 'bg-hs-bg' : 'bg-hs-bg2')}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-hs-text">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
