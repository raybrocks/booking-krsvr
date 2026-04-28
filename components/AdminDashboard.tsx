"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Calendar as CalendarIcon, Users, Clock, Mail, Phone, CheckCircle2, XCircle, Clock4, Settings, Gamepad2, ListOrdered, Receipt } from "lucide-react";
import { toast } from "sonner";
import SettingsManager from "./SettingsManager";
import ExperiencesManager from "./ExperiencesManager";
import TransactionsManager from "./TransactionsManager";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "experiences" | "transactions" | "settings">("bookings");

  // Sorting and Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: newStatus });
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedBookings = React.useMemo(() => {
    let result = [...bookings];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter(booking => booking.date === dateFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(booking => 
        booking.firstName?.toLowerCase().includes(lowerQuery) ||
        booking.lastName?.toLowerCase().includes(lowerQuery) ||
        booking.email?.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle specific sorting cases
      if (sortConfig.key === 'customer') {
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortConfig.key === 'dateTime') {
        aValue = new Date(`${a.date}T${a.time}`).getTime();
        bValue = new Date(`${b.date}T${b.time}`).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [bookings, sortConfig, statusFilter, dateFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9C39FF]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage your VR Arena bookings, experiences, and settings.</p>
        </div>
        
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 w-fit shrink-0 overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <ListOrdered className="w-4 h-4" /> Bookings
          </button>
          <button 
            onClick={() => setActiveTab("experiences")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'experiences' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Gamepad2 className="w-4 h-4" /> Experiences
          </button>
          <button 
            onClick={() => setActiveTab("transactions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Receipt className="w-4 h-4" /> Receipts
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9C39FF] appearance-none min-w-[120px]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {(searchQuery || dateFilter || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDateFilter("");
                    setStatusFilter("all");
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('customer')}>
                      Customer {sortConfig.key === 'customer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('dateTime')}>
                      Date & Time {sortConfig.key === 'dateTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('experienceId')}>
                      Experience {sortConfig.key === 'experienceId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('totalPrice')}>
                      Payment {sortConfig.key === 'totalPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-zinc-200 transition-colors" onClick={() => handleSort('status')}>
                      Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredAndSortedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No bookings found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{booking.firstName} {booking.lastName}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {booking.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {booking.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <CalendarIcon className="w-4 h-4 text-zinc-500" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-zinc-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {booking.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300">{booking.experienceId}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                          <Users className="w-3 h-3" /> {booking.players} Players
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300">{booking.totalPrice} NOK</div>
                        <div className="text-xs text-zinc-500 mt-1 capitalize">
                          {booking.paymentType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border focus:outline-none appearance-none cursor-pointer ${
                              booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            <option value="pending" className="bg-zinc-900 text-amber-400">Pending</option>
                            <option value="confirmed" className="bg-zinc-900 text-emerald-400">Confirmed</option>
                            <option value="cancelled" className="bg-zinc-900 text-red-400">Cancelled</option>
                          </select>
                          
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                // TODO: Add email alert integration here later
                                updateBookingStatus(booking.id, 'cancelled');
                              }}
                              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1.5 rounded-lg transition-colors"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeTab === "experiences" && <ExperiencesManager />}
      {activeTab === "transactions" && <TransactionsManager />}
      {activeTab === "settings" && <SettingsManager />}
    </div>
  );
}
