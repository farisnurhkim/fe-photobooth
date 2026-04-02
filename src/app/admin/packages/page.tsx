'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getAdminPackages, 
  createAdminPackage, 
  updateAdminPackage, 
  deleteAdminPackage,
  getDashboardAnalytics,
  deleteMedia
} from '@/lib/adminApi';
import { Package, CreatePackageDTO, UpdatePackageDTO } from '@/types/package';
import { AnalyticsData } from '@/lib/adminApi';

import PackageTable from '@/components/admin/PackageTable';
import PackageModal from '@/components/admin/PackageModal';
import StatsCard from '@/components/admin/StatsCard';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Box, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Loader2,
  Check
} from 'lucide-react';


import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import {
  AlertDialog,

  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,

  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


export default function PackagesPage() {
  const { data: session } = useSession();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [activeTab, setActiveTab] = useState('all');
  const [totalData, setTotalData] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [packageGrowth, setPackageGrowth] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);


  const accessToken = (session?.user as any)?.accessToken;

  const fetchPackagesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAdminPackages(currentPage, limit, activeTab, debouncedSearch, sortBy, sortOrder);
      if (response.success) {
        setPackages(response.data);
        setTotalData(response.totalData);
        setTotalActive(response.totalActive);
        setPackageGrowth(response.packageGrowth);
      }
    } catch (error) {
      console.error('Fetch packages error:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearch, currentPage, limit, sortBy, sortOrder]);


  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    try {
      const analyticsRes = await getDashboardAnalytics(accessToken);
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPackagesData();
  }, [fetchPackagesData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);






  // Reset to page 1 on search or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  const handleCreateOrUpdate = async (data: CreatePackageDTO | UpdatePackageDTO, id?: string) => {
    try {
      if (id) {
        await updateAdminPackage(id, data as UpdatePackageDTO);
        toast.success('Package updated successfully');
      } else {
        await createAdminPackage(data as CreatePackageDTO);
        toast.success('Package created successfully');
      }
      fetchPackagesData();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;
    setIsLoadingDelete(true);
    try {
      // Find package to get its picture URL
      const pkg = packages.find(p => p._id === packageToDelete);
      
      // 1. Delete from Cloudinary if it has a picture
      if (pkg?.picture) {
        await deleteMedia(pkg.picture);
      }

      // 2. Delete from database
      if (packageToDelete) {
        await deleteAdminPackage(packageToDelete!);
      }


      
      toast.success('Package deleted successfully');
      fetchPackagesData();
      fetchStats();

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete package');
    } finally {
      setIsDeleteDialogOpen(false);
      setPackageToDelete(null);
      setIsLoadingDelete(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPackageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const openModal = (pkg: Package | null = null) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" size={18} />
            <Input 
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-white border-0 shadow-sm rounded-2xl text-[0.9rem] font-medium focus-visible:ring-neutral-200"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="pt-4"
          >
            <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">Manage Packages</h1>
            <p className="text-neutral-500 font-medium pt-1">Configure photography sessions and digital delivery formats.</p>
          </motion.div>
        </div>

        <Button 
          onClick={() => openModal()}
          className="h-14 px-8 bg-neutral-800 hover:bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[0.75rem] shadow-xl shadow-neutral-200 transition-all active:scale-95 flex items-center gap-2 border-0"
        >
          <Plus size={18} />
          Add New Package
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="TOTAL PACKAGES"
          value={totalData.toString()}
          growth={packageGrowth}
          icon={Box}
        />
        <StatsCard 
          title="ACTIVE NOW"
          value={totalActive.toString()}
          growth={totalData > 0 ? Number(((totalActive / totalData) * 100).toFixed(1)) : 0}
          icon={CheckCircle}
        />
        <StatsCard 
          title="BOOKING COUNT"
          value={analytics?.bookingCount.toString() || '0'}
          growth={analytics?.bookingGrowth || 0}
          icon={Clock}
        />
        <StatsCard 
          title="REVENUE FOCUS"
          value={analytics?.bookingMix?.[0]?.paket || 'None'}
          growth={analytics?.bookingMix?.[0]?.percentage || 0}
          icon={TrendingUp}
          dark
        />
      </div>


      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-white p-1.5 h-12 rounded-2xl shadow-sm border border-neutral-100 flex gap-1">
            <TabsTrigger value="all" className="rounded-xl px-6 font-bold text-[0.7rem] uppercase tracking-wider data-[state=active]:bg-neutral-50 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none border-0">All Packages</TabsTrigger>
            <TabsTrigger value="solo" className="rounded-xl px-6 font-bold text-[0.7rem] uppercase tracking-wider data-[state=active]:bg-neutral-50 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none border-0">Solo</TabsTrigger>
            <TabsTrigger value="group" className="rounded-xl px-6 font-bold text-[0.7rem] uppercase tracking-wider data-[state=active]:bg-neutral-50 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none border-0">Group</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-bold text-neutral-400 uppercase tracking-wider">Show:</span>
            <Select value={limit.toString()} onValueChange={(val) => {
                if (val) {
                    setLimit(parseInt(val));
                    setCurrentPage(1);
                }
            }}>
                <SelectTrigger className="h-10 w-20 bg-white border-neutral-100 rounded-xl font-bold text-[0.75rem]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-xl bg-white text-foreground">
                    <SelectItem value="5" className="rounded-lg font-bold">5</SelectItem>
                    <SelectItem value="10" className="rounded-lg font-bold">10</SelectItem>
                    <SelectItem value="20" className="rounded-lg font-bold">20</SelectItem>
                    <SelectItem value="50" className="rounded-lg font-bold">50</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-neutral-100 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="h-10 w-10 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer">
                    <ArrowUpDown size={18} />
                </div>
            </DropdownMenuTrigger>



            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl p-2 bg-white text-foreground">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-widest px-3 py-2">Sort Packages By</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-50 mx-2" />
                    <div className="py-1">
                        {[
                            { label: 'Name: A-Z', value: 'nama_paket-asc' },
                            { label: 'Name: Z-A', value: 'nama_paket-desc' },
                            { label: 'Price: Lowest first', value: 'harga-asc' },
                            { label: 'Price: Highest first', value: 'harga-desc' },
                            { label: 'Duration: Shortest', value: 'durasi_menit-asc' },
                            { label: 'Duration: Longest', value: 'durasi_menit-desc' },
                            { label: 'Newest Created', value: 'createdAt-desc' }
                        ].map((item) => (
                            <DropdownMenuItem 
                                key={item.value}
                                onClick={() => {
                                    const [field, order] = item.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order as 'asc' | 'desc');
                                    setCurrentPage(1);
                                }}
                                className={`rounded-xl font-bold text-[0.7rem] uppercase tracking-wider py-3 focus:bg-neutral-50 mb-1 px-3 flex items-center justify-between cursor-pointer ${
                                    `${sortBy}-${sortOrder}` === item.value ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-500'
                                }`}
                            >
                                {item.label}
                                {`${sortBy}-${sortOrder}` === item.value && <Check size={14} className="text-neutral-900" />}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuGroup>
            </DropdownMenuContent>


          </DropdownMenu>
        </div>

      </div>

      {/* Table Section */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-2xl z-10">
            <div className="flex flex-col items-center gap-3">
               <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
               <p className="text-[0.7rem] font-bold text-neutral-400 uppercase tracking-widest">Architecting View...</p>
            </div>
          </div>
        ) : null}
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <PackageTable 
            packages={packages}
            onEdit={openModal}
            onDelete={handleDeleteClick}
          />
          
          <div className="pt-6 flex justify-between items-center px-2">
             <p className="text-[0.75rem] font-medium text-neutral-400">
               Showing <span className="font-bold text-neutral-900">{packages.length}</span> of <span className="font-bold text-neutral-900">{totalData}</span> packages
             </p>
             <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentPage <= 1 || isLoading} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-10 w-10 rounded-xl p-0 border border-neutral-100 bg-white"
                >
                  <span className={currentPage <= 1 ? "text-neutral-200" : "text-neutral-900"}>❮</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={currentPage * limit >= totalData || isLoading}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-10 w-10 rounded-xl p-0 border border-neutral-100 bg-white shadow-sm font-bold text-neutral-900"
                >
                  <span className={currentPage * limit >= totalData ? "text-neutral-200" : "text-neutral-900"}>❯</span>
                </Button>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <PackageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedPackage}
        onSubmit={handleCreateOrUpdate}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 bg-white">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-2xl font-bold text-neutral-900 italic underline decoration-red-600/20 underline-offset-8">DELETE PACKAGE?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 font-medium">
              This action cannot be undone. This will permanently delete the photography package and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3 sm:justify-start">
            <AlertDialogCancel className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[0.7rem] border-neutral-200 text-neutral-500 hover:bg-neutral-50 border-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isLoadingDelete}
              className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-widest text-[0.7rem] shadow-xl shadow-red-100 border-0"
            >
              {isLoadingDelete ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
