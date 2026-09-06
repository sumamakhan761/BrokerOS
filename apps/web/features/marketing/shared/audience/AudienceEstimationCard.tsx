'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { AudienceEstimation } from '../../types';

interface AudienceEstimationCardProps {
  estimation: AudienceEstimation;
  isEstimating: boolean;
}

export const AudienceEstimationCard: React.FC<AudienceEstimationCardProps> = ({
  estimation,
  isEstimating,
}) => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[var(--brand-600)] flex items-center justify-center font-extrabold text-sm shadow-xs tabular-nums">
          {isEstimating ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            estimation.finalAudienceCount.toLocaleString()
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-extrabold text-[var(--text-primary)] tabular-nums">
              {estimation.finalAudienceCount.toLocaleString()} Deliverable Recipients
            </h5>
            <Badge
              variant={estimation.finalAudienceCount > 0 ? 'success' : 'default'}
              className="text-[10px]"
            >
              {estimation.finalAudienceCount > 0 ? 'Cleaned & Ready' : '0 Matching Leads'}
            </Badge>
          </div>
          <p className="text-[11px] font-medium text-[var(--text-tertiary)] mt-0.5">
            {estimation.duplicateCount > 0 && `${estimation.duplicateCount} duplicate contacts removed • `}
            {estimation.unsubscribedCount > 0 && `${estimation.unsubscribedCount} unsubscribed users excluded • `}
            Zero bounce risk
          </p>
        </div>
      </div>
    </div>
  );
};
