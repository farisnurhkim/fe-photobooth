'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { Package } from '@/types/package';
import Image from 'next/image';

interface PackageTableProps {
  packages: Package[];
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
}

export default function PackageTable({ packages, onEdit, onDelete }: PackageTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[300px] text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Package Preview
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Type
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Print Ratio
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Duration
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Price
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider py-4">
              Status
            </TableHead>
            <TableHead className="text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider text-right py-4 pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No packages found.
              </TableCell>
            </TableRow>
          ) : (
            packages.map((pkg) => (
              <TableRow key={pkg._id} className="group hover:bg-gray-50/50 transition-colors border-b last:border-0">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {pkg.picture ? (
                        <Image
                          src={pkg.picture}
                          alt={pkg.nama_paket}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-200">
                          <Eye size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[0.95rem] text-foreground leading-tight">
                        {pkg.nama_paket}
                      </span>
                      <span className="text-[0.7rem] text-muted-foreground font-medium uppercase">
                        ID: {pkg._id.slice(-5).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 font-bold text-[0.65rem] rounded-md px-2 py-0.5 uppercase tracking-wide border-0"
                  >
                    {pkg.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[0.75rem] font-bold text-gray-700">{pkg.rasio_cetak.split(' ')[0]}</span>
                    </div>
                    <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wide">
                      {pkg.rasio_cetak.split(' ')[1] || 'STANDARD'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="text-[0.85rem] font-semibold text-gray-700">
                      {pkg.durasi_menit}
                    </span>
                    <span className="text-[0.7rem] font-medium text-muted-foreground">Minutes</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-[1rem] font-bold text-[#b8860b]">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.harga).replace('IDR', 'Rp')}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider border-0 ${
                      pkg.is_active
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {pkg.is_active ? '● Active' : '○ Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                      onClick={() => onEdit(pkg)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
                      onClick={() => onDelete(pkg._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
