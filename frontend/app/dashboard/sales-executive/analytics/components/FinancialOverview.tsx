import React from 'react';
import { motion } from 'framer-motion';

export function FinancialOverview({ financialData }: { financialData: any }) {
  if (!financialData) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Revenue (Sold)</p>
        <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
          {formatter.format(financialData.totalRevenue)}
        </h3>
        <p className="text-xs font-medium text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded mt-3">
          Locked-in Revenue
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Realized Commission</p>
        <h3 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
          {formatter.format(financialData.realizedCommission)}
        </h3>
        <p className="text-xs font-medium text-indigo-700 bg-indigo-50 inline-block px-2 py-1 rounded mt-3">
          Earned from Sold Deals
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Projected Commission</p>
        <h3 className="text-3xl font-extrabold text-amber-500 tracking-tight">
          {formatter.format(financialData.projectedCommission)}
        </h3>
        <p className="text-xs font-medium text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded mt-3">
          Pending from Reservations
        </p>
      </motion.div>
    </div>
  );
}
