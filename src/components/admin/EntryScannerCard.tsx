import Link from 'next/link';
import { ScanQrCode, ArrowRight } from 'lucide-react';

export default function EntryScannerCard() {
  return (
    <div className="bg-linear-to-br from-[#2d3250] to-[#1e2035] rounded-2xl p-5 text-white flex flex-col justify-between shadow-sm min-h-[170px]">
      <div>
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-3">
          <ScanQrCode size={22} className="text-white" />
        </div>
        <h3 className="text-[1.05rem] font-bold text-white m-0 mb-1">Entry Scanner</h3>
        <p className="text-[0.77rem] text-white/60 m-0 leading-relaxed">
          Fast-track check-ins for upcoming studio sessions.
        </p>
      </div>

      <Link
        href="/admin/scanner"
        className="flex items-center gap-2 text-[0.82rem] font-semibold text-white no-underline border-t border-white/15 pt-3 mt-4 hover:opacity-80 transition-opacity duration-150"
      >
        Launch Interface
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
