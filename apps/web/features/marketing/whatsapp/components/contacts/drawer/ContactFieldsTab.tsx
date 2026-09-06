'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ContactFieldsTabProps {
  customFields: any[];
  customValues: Record<string, string>;
  setCustomValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savingFields: boolean;
  handleSaveFields: () => Promise<void>;
}

export const ContactFieldsTab: React.FC<ContactFieldsTabProps> = ({
  customFields,
  customValues,
  setCustomValues,
  savingFields,
  handleSaveFields,
}) => {
  return (
    <div className="space-y-4">
      {customFields.length === 0 ? (
        <p className="text-center py-8 text-xs text-text-tertiary italic">
          No custom fields configured. Add custom fields in Settings.
        </p>
      ) : (
        <div className="space-y-3">
          {customFields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                {field.name}
              </label>
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={customValues[field.id] || ''}
                onChange={(e) =>
                  setCustomValues({
                    ...customValues,
                    [field.id]: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>
          ))}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveFields}
              disabled={savingFields}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              {savingFields ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Custom Values</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
