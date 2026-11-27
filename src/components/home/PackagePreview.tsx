"use client";

import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  User,
  Printer,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Package {
  _id: string;
  nama_paket: string;
  deskripsi: string[];
  maks_orang: number;
  slug: string;
  harga: number;
  rasio_cetak: string;
  durasi_menit: number;
  picture: string;
  is_active: boolean;
  type: "solo" | "group";
}

type FilterType = "solo" | "group";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (harga: number) => {
  if (harga >= 1_000_000) {
    return `${(harga / 1_000_000).toFixed(harga % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  return `${Math.round(harga / 1000)}k`;
};

// ── Package Card ──────────────────────────────────────────────────────────────
function PackageCard({
  pkg,
  index,
  isLogged,
}: {
  pkg: Package;
  index: number;
  isLogged: boolean;
}) {
  // Pick a visually varied accent per card based on index
  const accents = [
    { badge: "bg-neutral-800 text-white", button: "outline" as const },
    { badge: "bg-amber-500 text-white", button: "default" as const },
    { badge: "bg-neutral-800 text-white", button: "outline" as const },
  ];
  const accent = accents[index % accents.length];

  

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 28 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      className="group bg-white rounded-[36px] border border-neutral-100 shadow-[0_16px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_32px_64px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-56 bg-neutral-50 overflow-hidden">
        {/* Type badge */}
        <div
          className={cn(
            "absolute top-4 left-4 z-10 text-[9px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase",
            accent.badge
          )}
        >
          {pkg.type === "solo" ? "Solo" : "Group"}
        </div>

        {/* Max orang badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-neutral-600 text-[10px] font-semibold px-2.5 py-1.5 rounded-full shadow-sm border border-neutral-100">
          {pkg.type === "solo" ? (
            <User size={11} className="shrink-0" />
          ) : (
            <Users size={11} className="shrink-0" />
          )}
          {pkg.maks_orang} orang
        </div>

        <img
          src={pkg.picture || "/package_essential_icon.png"}
          alt={pkg.nama_paket}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/package_essential_icon.png";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-7 gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-neutral-800 leading-tight">
            {pkg.nama_paket}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-xl font-bold text-neutral-900">
              IDR {formatPrice(pkg.harga)}
            </span>
          </div>
        </div>

        {/* Key stats row */}
        <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-neutral-400 shrink-0" />
            {pkg.durasi_menit} menit
          </span>
          <span className="w-px h-3 bg-neutral-200" />
          <span className="flex items-center gap-1.5">
            <Printer size={13} className="text-neutral-400 shrink-0" />
            {pkg.rasio_cetak}
          </span>
        </div>

        {/* Deskripsi list */}
        {pkg.deskripsi && pkg.deskripsi.length > 0 && (
          <ul className="space-y-2">
            {pkg.deskripsi.slice(0, 4).map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-neutral-500"
              >
                <CheckCircle2
                  size={14}
                  className="text-neutral-400 shrink-0 mt-0.5"
                />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link href={`/packages?packageId=${pkg._id}&type=${pkg.type}`}>
            <Button
              variant={accent.button}
              className={cn(
                "w-full h-12 rounded-full text-sm font-bold transition-all",
                accent.button === "default"
                  ? "bg-neutral-900 hover:bg-neutral-700 text-white"
                  : "border-neutral-200 hover:bg-neutral-50 text-neutral-800"
              )}
            >
              Select Package
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const LIMIT = 6;

export default function PackagePreview() {
  const { status } = useSession();
  const isLogged = status === "authenticated";

  const [activeFilter, setActiveFilter] = useState<FilterType>("solo");
  const [packages, setPackages] = useState<Package[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchPackages = useCallback(async (type: FilterType, page: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await axiosInstance.get(
        `/packages?type=${type}&page=${page}&limit=${LIMIT}`
      );
      if (res.data.success) {
        setPackages(res.data.data);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
        setTotalData(res.data.totalData);
      }
    } catch {
      setError(true);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when filter or page changes
  useEffect(() => {
    fetchPackages(activeFilter, currentPage);
  }, [activeFilter, currentPage, fetchPackages]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (type: FilterType) => {
    if (type === activeFilter) return;
    setActiveFilter(type);
    setCurrentPage(1);
    setPackages([]);
  };

  return (
    <section id="packages" className="py-24 bg-neutral-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-lg">
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Our Packages
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
              Studio Packages
            </h2>
            <p className="text-neutral-500 leading-relaxed">
              Transparent pricing for premium results. Select the format that
              fits your vision.
            </p>
          </div>

          {/* ── Solo / Group Toggle ── */}
          <div className="flex bg-white p-1.5 rounded-full border border-neutral-200 shadow-sm">
            {(["solo", "group"] as FilterType[]).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  "relative px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-200 capitalize cursor-pointer",
                  activeFilter === f
                    ? "text-white"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {activeFilter === f && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-neutral-900 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid / States ── */}
        <div className="min-h-[420px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-neutral-400" size={30} />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-neutral-400 font-medium">
                Failed to load packages. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => fetchPackages(activeFilter, currentPage)}
                className="rounded-full px-6"
              >
                Retry
              </Button>
            </div>
          ) : packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <p className="text-neutral-400 font-medium">
                No {activeFilter} packages available yet.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                key={`${activeFilter}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
              >
                {packages.map((pkg, i) => (
                  <PackageCard
                    key={pkg._id}
                    pkg={pkg}
                    index={i}
                    isLogged={isLogged}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && !loading && !error && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-400">
              Showing{" "}
              <span className="font-semibold text-neutral-700">
                {(currentPage - 1) * LIMIT + 1}–
                {Math.min(currentPage * LIMIT, totalData)}
              </span>{" "}
              of <span className="font-semibold text-neutral-700">{totalData}</span> packages
            </p>

            <div className="flex items-center gap-2">
              <button
                id="pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  id={`pagination-page-${p}`}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer",
                    currentPage === p
                      ? "bg-neutral-900 text-white"
                      : "hover:bg-neutral-100 text-neutral-500"
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                id="pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
