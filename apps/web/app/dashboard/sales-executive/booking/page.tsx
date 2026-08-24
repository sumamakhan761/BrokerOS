"use client";

import { Calendar, Search, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      const res = await fetch(`${apiUrl}/api/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const lowerQ = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      const name =
        `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.toLowerCase();
      const bookingNo = (b.bookingNumber || "").toLowerCase();
      const unitNo = (b.unit?.unitNumber || "").toLowerCase();
      return (
        name.includes(lowerQ) ||
        bookingNo.includes(lowerQ) ||
        unitNo.includes(lowerQ)
      );
    });
  }, [bookings, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5 m-0">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <Calendar size={18} />
            </div>
            <span>Finalized Bookings</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 m-0">
            Confirmed unit sales, transaction vouchers, and payment records
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, booking #, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-base sm:text-xs font-semibold text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-600)] focus:ring-2 focus:ring-purple-500/15 shadow-2xs transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 flex-col gap-3">
          <Loader2 className="w-8 h-8 text-[var(--brand-600)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Loading confirmed bookings…
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)] mx-auto border border-purple-200 shadow-2xs">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] m-0">
              {searchQuery ? "No matching bookings found" : "No Bookings Recorded Yet"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm mx-auto m-0">
              {searchQuery
                ? "Try adjusting your search criteria."
                : "Bookings generated from accepted negotiations will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    Booking #
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-5 py-3 text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider text-right">
                    Agreed Sale Price
                  </th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking, index) => {
                  const phone =
                    booking.customer?.lead?.phone ||
                    booking.customer?.phone ||
                    "N/A";
                  return (
                    <tr
                      key={booking.id}
                      onClick={() =>
                        router.push(
                          `/dashboard/sales-executive/lead-management/${booking.customer?.lead?.id}`
                        )
                      }
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-slate-400 font-bold tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-semibold tabular-nums">
                        {phone}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-purple-50 text-[var(--brand-700)] border border-purple-200/60 px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase tabular-nums">
                          {booking.bookingNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--text-primary)]">
                        {booking.unit?.unitNumber || "N/A"}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-emerald-700 text-right tabular-nums">
                        ₹{Number(booking.agreedPrice).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="w-7 h-7 rounded-lg group-hover:bg-purple-50 flex items-center justify-center text-slate-400 group-hover:text-[var(--brand-700)] transition-colors inline-flex">
                          <ChevronRight size={15} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
