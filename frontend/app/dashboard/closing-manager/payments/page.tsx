'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function PaymentsPage() {
  const { data: session } = authClient.useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/proxy/api/payments/closing-manager?managerId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [session]);

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === 'PAID') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Paid</span>;
    if (new Date(dueDate) < new Date()) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">Overdue</span>;
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overdue = payments.filter(p => new Date(p.dueDate) < new Date() && p.status === 'PENDING');
  const upcoming = payments.filter(p => new Date(p.dueDate) >= new Date() && p.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Collection</h1>
          <p className="text-gray-500 mt-1">Track and collect upcoming or overdue installments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mr-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overdue Payments</p>
            <p className="text-3xl font-bold text-gray-900">{overdue.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
            <Calendar className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Upcoming Payments</p>
            <p className="text-3xl font-bold text-gray-900">{upcoming.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Action Required</h3>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">All Caught Up!</h3>
            <p className="text-gray-500 max-w-md">There are no pending or overdue payments that require your attention right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payments.map(payment => (
              <div key={payment.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900">{payment.milestoneName}</h4>
                      {getStatusBadge(payment.status, payment.dueDate)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Booking #{payment.booking?.bookingNumber} • Due {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">₹{payment.remainingAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">Remaining Amount</p>
                  </div>
                  
                  <Link 
                    href={`/dashboard/closing-manager/lead-management/${payment.booking?.customer?.leadId}`}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                    title="Go to Lead Profile"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
