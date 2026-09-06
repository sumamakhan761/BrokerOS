'use client';

import React from 'react';
import { Upload, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { TagItem } from './types';

interface Step2AudienceSelectProps {
  contactsCount: number;
  audienceType: 'all' | 'tags' | 'custom_field' | 'csv';
  setAudienceType: (t: 'all' | 'tags' | 'custom_field' | 'csv') => void;
  allTags: TagItem[];
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  csvFileName: string;
  handleCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalAudienceCount: number;
  onBack: () => void;
  onNext: () => void;
}

export const Step2AudienceSelect: React.FC<Step2AudienceSelectProps> = ({
  contactsCount,
  audienceType,
  setAudienceType,
  allTags,
  selectedTagIds,
  setSelectedTagIds,
  csvFileName,
  handleCsvUpload,
  totalAudienceCount,
  onBack,
  onNext,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Step 2 — Define Campaign Audience
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Select who receives this message. You can filter by CRM tags, custom fields, or upload a CSV file.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: 'all', title: 'All CRM Contacts', desc: `Broadcast to all ${contactsCount} synced leads` },
          { id: 'tags', title: 'Filter by Tags', desc: 'Target leads with specific tags (e.g. VIP, Luxury)' },
          { id: 'csv', title: 'Upload CSV List', desc: 'Direct paste or import phone number list' },
        ].map((opt) => (
          <div
            key={opt.id}
            onClick={() => setAudienceType(opt.id as any)}
            className={cn(
              'rounded-xl border p-4 cursor-pointer transition-all',
              audienceType === opt.id
                ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-500/30'
                : 'border-border-default bg-bg-surface hover:border-brand-500/40',
            )}
          >
            <h4 className="text-xs font-bold text-text-primary">{opt.title}</h4>
            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{opt.desc}</p>
          </div>
        ))}
      </div>

      {/* Tags Picker */}
      {audienceType === 'tags' && (
        <div className="rounded-xl border border-border-default bg-bg-subtle p-4 space-y-3">
          <label className="text-xs font-semibold text-text-primary block">
            Select target tags:
          </label>
          {allTags.length === 0 ? (
            <p className="text-xs text-text-muted italic">No tags created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tg) => {
                const active = selectedTagIds.includes(tg.id);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        active ? prev.filter((id) => id !== tg.id) : [...prev, tg.id],
                      )
                    }
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors',
                      active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-border-default bg-bg-surface text-text-secondary hover:border-brand-500/40',
                    )}
                  >
                    {tg.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CSV Uploader */}
      {audienceType === 'csv' && (
        <div className="rounded-xl border border-dashed border-border-default bg-bg-subtle/50 p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-text-muted mx-auto" />
          <div>
            <p className="text-xs font-semibold text-text-primary">
              {csvFileName ? `Loaded: ${csvFileName}` : 'Drop CSV here or click to browse'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              CSV format: <code className="font-mono text-brand-600">phone,name,param1,param2</code>
            </p>
          </div>
          <label className="inline-flex cursor-pointer rounded-lg bg-bg-surface border border-border-default px-4 py-2 text-xs font-semibold text-text-primary hover:bg-bg-subtle shadow-xs">
            <span>Choose File</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>
      )}

      {/* Audience Summary Box */}
      <div className="rounded-xl bg-bg-subtle p-4 flex items-center justify-between border border-border-default">
        <div>
          <span className="text-xs text-text-muted">Estimated Audience Reach:</span>
          <p className="text-lg font-bold text-text-primary">
            {totalAudienceCount.toLocaleString()} Recipients
          </p>
        </div>
        <Users className="h-8 w-8 text-brand-600 opacity-60" />
      </div>

      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={() => {
            if (totalAudienceCount === 0) {
              toast.error('Selected audience contains 0 recipients.');
              return;
            }
            onNext();
          }}
          disabled={totalAudienceCount === 0}
          className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
        >
          Continue to Personalize
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
