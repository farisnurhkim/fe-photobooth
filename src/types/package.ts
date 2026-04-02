export interface Package {
  _id: string;
  nama_paket: string;
  type: 'solo' | 'group';
  deskripsi: string[];
  maks_orang: number;
  slug: string;
  harga: number;
  rasio_cetak: string;
  durasi_menit: number;
  picture: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDTO {
  nama_paket: string;
  type: 'solo' | 'group';
  deskripsi: string[];
  maks_orang: number;
  harga: number;
  rasio_cetak: string;
  durasi_menit: number;
  picture: string;
  is_active?: boolean;
}

export interface UpdatePackageDTO extends Partial<CreatePackageDTO> {}

export interface PackagesResponse {
  success: boolean;
  data: Package[];
  currentPage: number;
  totalPages: number;
  totalData: number;
  totalActive: number;
  totalInactive: number;
  packageGrowth: number;
}

