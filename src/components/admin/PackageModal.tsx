'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Package, CreatePackageDTO, UpdatePackageDTO } from '@/types/package';
import { uploadSingleMedia, deleteMedia } from '@/lib/adminApi';
import { toast } from 'sonner';
import Image from 'next/image';

const schema = yup.object({
  nama_paket: yup.string().required('Nama paket wajib diisi'),
  type: yup.string().oneOf(['solo', 'group']).required('Tipe paket wajib diisi'),
  maks_orang: yup.number().min(1, 'Minimal 1 orang').required('Maksimal orang wajib diisi'),
  harga: yup.number().min(0, 'Harga tidak boleh negatif').required('Harga wajib diisi'),
  rasio_cetak: yup.string().required('Rasio cetak wajib diisi'),
  durasi_menit: yup.number().min(1, 'Minimal 1 menit').required('Durasi wajib diisi'),
  is_active: yup.boolean(),
  deskripsi: yup.array().min(1, 'Minimal 1 poin deskripsi dibutuhkan').required(),
});


interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePackageDTO | UpdatePackageDTO, id?: string) => Promise<void>;
  initialData?: Package | null;
}

export default function PackageModal({ isOpen, onClose, onSubmit, initialData }: PackageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [descriptionPoints, setDescriptionPoints] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nama_paket: '',
      type: 'solo',
      maks_orang: 1,
      harga: 0,
      rasio_cetak: '4:5 Portrait',
      durasi_menit: 30,
      is_active: true,
      deskripsi: [],
    },

  });

  const typeValue = watch('type');
  const isActiveValue = watch('is_active');
  const rasioValue = watch('rasio_cetak');

  useEffect(() => {
    setValue('deskripsi', descriptionPoints, { shouldValidate: true });
  }, [descriptionPoints, setValue]);



  useEffect(() => {
    if (initialData) {
      reset({
        nama_paket: initialData.nama_paket,
        type: initialData.type,
        maks_orang: initialData.maks_orang,
        harga: initialData.harga,
        rasio_cetak: initialData.rasio_cetak,
        durasi_menit: initialData.durasi_menit,
        is_active: initialData.is_active,
      });
      setDescriptionPoints(initialData.deskripsi || []);
      setImagePreview(initialData.picture);
      setImageFile(null);
    } else {
      reset({
        nama_paket: '',
        type: 'solo',
        maks_orang: 1,
        harga: 0,
        rasio_cetak: '4:5 Portrait',
        durasi_menit: 30,
        is_active: true,
      });
      setDescriptionPoints([]);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, reset, isOpen]);

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      setDescriptionPoints([...descriptionPoints, newPoint.trim()]);
      setNewPoint('');
    }
  };

  const handleRemovePoint = (index: number) => {
    setDescriptionPoints(descriptionPoints.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      let pictureUrl = initialData?.picture || '';

      // 1. Sequential flow: Upload image first if changed
      if (imageFile) {
        const uploadResult = await uploadSingleMedia(imageFile);
        if (uploadResult.success) {
          // If we had an old picture, delete it from Cloudinary
          if (initialData?.picture) {
            try {
              await deleteMedia(initialData.picture);
            } catch (err) {
              console.error('Failed to delete old image:', err);
              // We don't throw here to ensure the update still proceeds
            }
          }
          pictureUrl = uploadResult.data.url;
        } else {
          throw new Error('Gagal mengupload gambar');
        }
      }

      if (!pictureUrl) {
        toast.error('Silakan pilih gambar package terlebih dahulu');
        setIsLoading(false);
        return;
      }

      // 2. Process create/update
      const packageData = {
        ...formData,
        deskripsi: descriptionPoints,
        picture: pictureUrl,
      };

      await onSubmit(packageData, initialData?._id);
      onClose();
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 flex flex-col max-h-[90vh] overflow-hidden bg-white rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 shrink-0">
          <DialogTitle className="text-2xl font-bold text-neutral-900">
            {initialData ? 'Update Package' : 'Create New Package'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-medium">
            Define a photography service for your studio.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-4">
            <div className="space-y-8 pb-8 text-foreground">
              {/* Image Upload Area */}
              <div className="space-y-3">
                <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                  Package Cover Image
                </Label>
                <div className="flex gap-4">
                  <div className="w-40 h-48 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-neutral-300">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-neutral-100 rounded-xl text-neutral-400 group-hover:scale-110 transition-transform">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-[0.65rem] font-bold text-neutral-400 uppercase tracking-tighter">No Image selected</span>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="flex-1 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center p-6 gap-3 cursor-pointer hover:bg-neutral-100/50 transition-all border-spacing-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm text-neutral-400 group-hover:scale-110 transition-transform ring-1 ring-neutral-200">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-[0.8rem] font-bold text-neutral-700">Drag and drop an image here</p>
                      <p className="text-[0.7rem] font-medium text-neutral-400">or click to browse from files</p>
                      <p className="text-[0.65rem] font-bold text-neutral-300 mt-2 tracking-wider uppercase">PNG, JPG UP TO 10MB</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Package Name */}
              <div className="space-y-2">
                <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                  Package Name
                </Label>
                <Input
                  {...register('nama_paket')}
                  placeholder="e.g. Minimalist Portrait"
                  className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus-visible:ring-neutral-200 text-foreground"
                />
                {errors.nama_paket && (
                  <p className="text-xs text-red-500 font-bold ml-1">{errors.nama_paket.message}</p>
                )}
              </div>

              {/* Description Points */}
              <div className="space-y-4">
                <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                  Description Points
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPoint();
                        }
                    }}
                    placeholder="Add a feature (e.g. 30 minute session)"
                    className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus-visible:ring-neutral-200 text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleAddPoint}
                    className="h-14 w-14 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl shadow-none border-0"
                  >
                    <Plus size={20} />
                  </Button>
                </div>

                
                {errors.deskripsi && (
                  <p className="text-xs text-red-500 font-bold ml-1">{errors.deskripsi.message}</p>
                )}
                
                <div className="space-y-2">

                  {descriptionPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl group border border-transparent hover:border-neutral-200 transition-all text-foreground"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                         <span className="text-sm font-semibold">{point}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(index)}
                        className="text-neutral-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                    Type
                  </Label>
                  <Select
                    value={typeValue}
                    onValueChange={(val) => setValue('type', val as 'solo' | 'group')}
                  >
                    <SelectTrigger className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus:ring-neutral-200 text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-xl p-2 bg-white text-foreground">
                      <SelectItem value="solo" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">Solo</SelectItem>
                      <SelectItem value="group" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                    Max People
                  </Label>
                  <Input
                    type="number"
                    {...register('maks_orang')}
                    className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus-visible:ring-neutral-200 text-foreground"
                  />
                  {errors.maks_orang && (
                    <p className="text-xs text-red-500 font-bold ml-1">{errors.maks_orang.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                    Price (IDR)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('harga')}
                    className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus-visible:ring-neutral-200 text-foreground"
                  />
                  {errors.harga && (
                    <p className="text-xs text-red-500 font-bold ml-1">{errors.harga.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                    Duration (Min)
                  </Label>
                  <Input
                    type="number"
                    {...register('durasi_menit')}
                    className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus-visible:ring-neutral-200 text-foreground"
                  />
                  {errors.durasi_menit && (
                    <p className="text-xs text-red-500 font-bold ml-1">{errors.durasi_menit.message}</p>
                  )}
                </div>
              </div>

              {/* Print Ratio & Status */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                    Print Ratio
                  </Label>
                  <Select
                    value={rasioValue as string}
                    onValueChange={(val) => setValue('rasio_cetak', val!)}
                  >
                    <SelectTrigger className="h-14 bg-neutral-50 border-0 rounded-2xl px-5 text-sm font-semibold focus:ring-neutral-200 text-foreground">
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-0 shadow-xl p-2 bg-white text-foreground">
                      <SelectItem value="4:5 Portrait" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">4:5 Portrait</SelectItem>
                      <SelectItem value="2:3 Portrait" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">2:3 Portrait</SelectItem>
                      <SelectItem value="1:1 Square" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">1:1 Square</SelectItem>
                      <SelectItem value="9:16 Story" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">9:16 Story</SelectItem>
                      <SelectItem value="4:6 Landscape" className="rounded-xl font-bold uppercase text-[0.7rem] tracking-wider py-3 px-4 focus:bg-neutral-100">4:6 Landscape</SelectItem>
                    </SelectContent>
                  </Select>


                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-transparent shadow-sm">
                  <div className="flex flex-col">
                    <Label className="text-[0.7rem] font-black text-neutral-400 tracking-widest uppercase">
                      Active Status
                    </Label>
                    <span className="text-[0.6rem] font-bold text-neutral-300 uppercase tracking-wider">Visible to Users</span>
                  </div>
                  <Switch
                    checked={isActiveValue}
                    onCheckedChange={(val) => setValue('is_active', val)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 bg-white border-t border-neutral-100 shrink-0 sm:justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-500 font-bold uppercase tracking-widest text-[0.7rem] hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-neutral-700 hover:bg-black text-white px-8 py-6 rounded-2xl font-bold uppercase tracking-widest text-[0.7rem] shadow-xl transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : initialData ? (
                'Update Package'
              ) : (
                'Create Package'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
