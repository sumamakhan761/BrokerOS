// ============================================================================
// BrokerOS — WhatsApp Broadcast Campaign 4-Step Wizard
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Users,
  Send,
  AlertCircle,
  Sliders,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppTemplate, WhatsAppContact } from '../../../types';
import type { TagItem, CustomFieldItem, CsvRecipient, VariableMapping } from './steps/types';
import { Step1TemplateSelect } from './steps/Step1TemplateSelect';
import { Step2AudienceSelect, type WhatsAppCrmFilters } from './steps/Step2AudienceSelect';
import { Step3Personalize } from './steps/Step3Personalize';
import { Step4ReviewLaunch } from './steps/Step4ReviewLaunch';

interface WhatsAppBroadcastWizardProps {
  accountId?: string;
}

export const WhatsAppBroadcastWizard: React.FC<WhatsAppBroadcastWizardProps> = ({
  accountId,
}) => {
  const router = useRouter();

  // Wizard Step Tracker: 1, 2, 3, 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Audience State
  const [audienceType, setAudienceType] = useState<
    'all' | 'tags' | 'crm_leads' | 'csv' | 'custom_field'
  >('crm_leads');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [csvRecipients, setCsvRecipients] = useState<CsvRecipient[]>([]);
  const [csvFileName, setCsvFileName] = useState('');

  // CRM Segmentation State
  const [crmFilters, setCrmFilters] = useState<WhatsAppCrmFilters>({
    temperatures: ['HOT', 'WARM'],
    statuses: ['ALL'],
  });
  const [crmLeadCount, setCrmLeadCount] = useState<number>(0);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  // Personalize (Variables Mapping)
  const [variableMappings, setVariableMappings] = useState<VariableMapping>({});

  // Schedule State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // 1. Load approved templates, tags, custom fields, contacts, and projects
  useEffect(() => {
    async function loadResources() {
      try {
        setLoadingTemplates(true);
        const q = new URLSearchParams();
        if (accountId) q.set('accountId', accountId);
        q.set('limit', '100');

        const [tRes, tagRes, cfRes, cRes, pRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/templates?${q.toString()}`),
          fetch(`${baseUrl}/api/marketing/whatsapp/tags`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/custom-fields`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts?limit=1000`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts/projects`).catch(() =>
            fetch(`${baseUrl}/api/marketing/sms/projects`).catch(() => null)
          ),
        ]);

        if (tRes.ok) {
          const tData = await tRes.json();
          const items = Array.isArray(tData) ? tData : tData.items || [];
          setTemplates(
            items.filter(
              (t: any) => (t.status || '').toUpperCase() === 'APPROVED',
            ),
          );
        }

        if (tagRes?.ok) {
          const tagData = await tagRes.json();
          setAllTags(Array.isArray(tagData) ? tagData : tagData.tags || []);
        }

        if (cfRes?.ok) {
          const cfData = await cfRes.json();
          setCustomFields(Array.isArray(cfData) ? cfData : cfData.fields || []);
        }

        if (cRes?.ok) {
          const cData = await cRes.json();
          setContacts(Array.isArray(cData) ? cData : cData.items || []);
        }

        if (pRes?.ok) {
          const pData = await pRes.json();
          if (Array.isArray(pData)) setProjects(pData);
        }
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadResources();
  }, [accountId, baseUrl]);

  // 2. Fetch live CRM lead audience count preview
  useEffect(() => {
    let isMounted = true;
    setIsEstimating(true);

    fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts/audience-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audienceSource: 'CRM_DATABASE',
        audienceFilters: crmFilters,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (isMounted && d && typeof d.finalAudienceCount === 'number') {
          setCrmLeadCount(d.finalAudienceCount);
        }
      })
      .catch(() => {
        if (isMounted) setCrmLeadCount(0);
      })
      .finally(() => {
        if (isMounted) setIsEstimating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [crmFilters, baseUrl]);

  // Extract variables like {{1}}, {{2}} from template body
  const detectedVariables = useMemo<string[]>(() => {
    if (!selectedTemplate) return [];
    const text = selectedTemplate.bodyText || (selectedTemplate as any).body_text || '';
    const matches = text.match(/\{\{([0-9]+)\}\}/g) || [];
    const unique = Array.from(new Set<string>(matches.map((m: string) => m.replace(/[\{\}]/g, ''))));
    return unique.sort((a, b) => Number(a) - Number(b));
  }, [selectedTemplate]);

  // Handle CSV upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const rows: CsvRecipient[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols[0]) {
          rows.push({
            phone: cols[0],
            name: cols[1] || undefined,
            params: cols.slice(2),
          });
        }
      }
      setCsvRecipients(rows);
      toast.success(`Loaded ${rows.length} contacts from ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Calculate estimated audience
  const filteredContacts = useMemo(() => {
    if (audienceType === 'all') return contacts;
    if (audienceType === 'csv') return [];
    if (audienceType === 'crm_leads') return [];
    if (audienceType === 'tags') {
      if (selectedTagIds.length === 0) return contacts;
      return contacts.filter((c: any) =>
        c.tags?.some((t: any) => selectedTagIds.includes(t.id || t.name)),
      );
    }
    return contacts;
  }, [audienceType, contacts, selectedTagIds]);

  const totalAudienceCount =
    audienceType === 'csv'
      ? csvRecipients.length
      : audienceType === 'crm_leads'
      ? crmLeadCount
      : filteredContacts.length;

  // Substitute variables for preview
  const previewBodyText = useMemo(() => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.bodyText || (selectedTemplate as any).body_text || '';
    for (const v of detectedVariables) {
      const mapping = variableMappings[v];
      let val = `[${v}]`;
      if (mapping) {
        if (mapping.type === 'static') val = mapping.value || `[${v}]`;
        else if (mapping.type === 'field') val = `[Contact ${mapping.value}]`;
        else if (mapping.type === 'custom') val = `[Custom Field]`;
      }
      text = text.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), val);
    }
    return text;
  }, [selectedTemplate, detectedVariables, variableMappings]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!campaignName.trim()) {
      setError('Please provide a campaign name');
      return;
    }
    if (!selectedTemplate) {
      setError('Please select an approved template');
      return;
    }
    if (totalAudienceCount === 0) {
      setError('Selected audience has 0 recipients');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let payloadBody: any = {
        accountId,
        name: campaignName.trim(),
        templateName: selectedTemplate.name,
        templateLanguage: selectedTemplate.language || 'en_US',
        scheduledAt: isScheduled && scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
      };

      if (audienceType === 'crm_leads') {
        payloadBody = {
          ...payloadBody,
          audienceType: 'crm_filter',
          crmFilter: crmFilters,
        };
      } else if (audienceType === 'csv') {
        payloadBody = {
          ...payloadBody,
          audienceType: 'csv',
          csvRows: csvRecipients,
        };
      } else {
        const payloadRecipients = filteredContacts.map((c) => {
          const params: string[] = [];
          for (const v of detectedVariables) {
            const m = variableMappings[v];
            if (m?.type === 'field') {
              params.push((c as any)[m.value] || '');
            } else if (m?.type === 'static') {
              params.push(m.value || '');
            } else {
              params.push('');
            }
          }
          return {
            phone: c.phone,
            contactId: c.id,
            parameters: params,
          };
        });

        payloadBody = {
          ...payloadBody,
          audienceType: audienceType === 'tags' ? 'tag' : 'all',
          recipients: payloadRecipients,
          contactIds: filteredContacts.map((c) => c.id),
        };
      }

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to launch broadcast campaign');
      }

      const created = await res.json();
      toast.success(
        isScheduled ? 'Broadcast scheduled successfully' : 'Broadcast launched successfully',
      );
      router.push(`/dashboard/marketing/whatsapp/broadcasts/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Error submitting broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Progress Bar */}
      <div className="flex items-center justify-between p-4 bg-bg-surface border border-border-default rounded-2xl shadow-xs">
        {[
          { num: 1, label: 'Template', icon: FileText },
          { num: 2, label: 'Audience', icon: Users },
          { num: 3, label: 'Personalize', icon: Sliders },
          { num: 4, label: 'Schedule & Launch', icon: Send },
        ].map((item, idx) => {
          const isActive = step === item.num;
          const isDone = step > item.num;

          return (
            <React.Fragment key={item.num}>
              <div
                onClick={() => {
                  if (isDone) setStep(item.num as any);
                }}
                className={cn(
                  'flex items-center gap-2.5 cursor-pointer select-none',
                  !isDone && !isActive && 'cursor-not-allowed opacity-60',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDone
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                        : 'bg-bg-subtle text-text-muted border border-border-default',
                  )}
                >
                  {isDone ? <Check className="w-4 h-4" /> : item.num}
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold hidden sm:inline',
                    isActive ? 'text-text-primary' : isDone ? 'text-text-secondary' : 'text-text-muted',
                  )}
                >
                  {item.label}
                </span>
              </div>
              {idx < 3 && <div className="h-px w-8 sm:w-16 bg-border-default" />}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <Step1TemplateSelect
          templates={templates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          loadingTemplates={loadingTemplates}
          templateSearch={templateSearch}
          setTemplateSearch={setTemplateSearch}
          onNext={() => setStep(2)}
        />
      )}

      {/* Step 2: Select Audience */}
      {step === 2 && (
        <Step2AudienceSelect
          contactsCount={contacts.length}
          audienceType={audienceType}
          setAudienceType={setAudienceType}
          allTags={allTags}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
          crmFilters={crmFilters}
          setCrmFilters={setCrmFilters}
          projects={projects}
          csvFileName={csvFileName}
          handleCsvUpload={handleCsvUpload}
          totalAudienceCount={totalAudienceCount}
          isEstimating={isEstimating}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {/* Step 3: Personalize */}
      {step === 3 && (
        <Step3Personalize
          detectedVariables={detectedVariables}
          variableMappings={variableMappings}
          setVariableMappings={setVariableMappings}
          previewBodyText={previewBodyText}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {/* Step 4: Schedule & Launch */}
      {step === 4 && (
        <Step4ReviewLaunch
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          selectedTemplate={selectedTemplate}
          totalAudienceCount={totalAudienceCount}
          isScheduled={isScheduled}
          setIsScheduled={setIsScheduled}
          scheduleTime={scheduleTime}
          setScheduleTime={setScheduleTime}
          submitting={submitting}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
