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
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  Calendar,
  AlertCircle,
  Clock,
  Search,
  Sparkles,
  Layers,
  Sliders,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppTemplate, WhatsAppContact } from '../../../types';

interface TagItem {
  id: string;
  name: string;
  color?: string;
}

interface CustomFieldItem {
  id: string;
  fieldName: string;
  fieldType: string;
}

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
  const [audienceType, setAudienceType] = useState<'all' | 'tags' | 'custom_field' | 'csv'>('all');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [csvRecipients, setCsvRecipients] = useState<Array<{ phone: string; name?: string; params?: string[] }>>([]);
  const [csvFileName, setCsvFileName] = useState('');

  // Personalize (Variables Mapping)
  const [variableMappings, setVariableMappings] = useState<Record<string, { type: 'field' | 'static' | 'custom'; value: string }>>({});

  // Schedule State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // 1. Load approved templates, tags, custom fields, and contacts
  useEffect(() => {
    async function loadResources() {
      try {
        setLoadingTemplates(true);
        const q = new URLSearchParams();
        if (accountId) q.set('accountId', accountId);
        q.set('limit', '100');

        const [tRes, tagRes, cfRes, cRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/templates?${q.toString()}`),
          fetch(`${baseUrl}/api/marketing/whatsapp/tags`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/custom-fields`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts?limit=1000`).catch(() => null),
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
      } catch (err) {
        console.error('Error loading resources:', err);
      } finally {
        setLoadingTemplates(false);
      }
    }

    loadResources();
  }, [accountId, baseUrl]);

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
      const rows: Array<{ phone: string; name?: string; params?: string[] }> = [];
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
    if (audienceType === 'tags') {
      if (selectedTagIds.length === 0) return contacts;
      return contacts.filter((c: any) =>
        c.tags?.some((t: any) => selectedTagIds.includes(t.id || t.name)),
      );
    }
    return contacts;
  }, [audienceType, contacts, selectedTagIds]);

  const totalAudienceCount =
    audienceType === 'csv' ? csvRecipients.length : filteredContacts.length;

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
      const payloadRecipients =
        audienceType === 'csv'
          ? csvRecipients.map((r) => ({
            phone: r.phone,
            parameters: r.params || [],
          }))
          : filteredContacts.map((c) => {
            // Interpolate variables per contact
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

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          name: campaignName.trim(),
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language || 'en_US',
          scheduledAt: isScheduled && scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
          recipients: payloadRecipients,
          contactIds: audienceType === 'csv' ? undefined : filteredContacts.map((c) => c.id),
          csvRows: audienceType === 'csv' ? csvRecipients : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to launch broadcast campaign');
      }

      const created = await res.json();
      toast.success(isScheduled ? 'Broadcast scheduled successfully' : 'Broadcast launched successfully');
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
          const Icon = item.icon;
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
                      ? 'bg-brand-600 text-white shadow-xs'
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
        <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Step 1 — Select Approved WhatsApp HSM Template
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Only templates pre-approved by Meta can be used for outbound broadcasts.
            </p>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 text-text-muted absolute left-3.5 top-3" />
            <Input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search approved templates by name..."
              className="pl-10 text-xs bg-bg-subtle"
            />
          </div>

          {loadingTemplates ? (
            <div className="text-center py-12 text-xs text-text-muted">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border-default text-xs text-text-muted">
              No approved templates found. Go to Templates to sync or create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto p-1">
              {templates
                .filter((t) => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                .map((t) => {
                  const isSelected = selectedTemplate?.id === t.id;
                  const bodyText = t.bodyText || (t as any).body_text || '';
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={cn(
                        'flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-500/30'
                          : 'border-border-default bg-bg-surface hover:border-brand-500/40 hover:bg-bg-subtle/50',
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-text-primary truncate">{t.name}</h4>
                          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 border border-purple-500/20">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted line-clamp-3 leading-relaxed">
                          {bodyText}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-muted">
                        <span>Language: {t.language || 'en_US'}</span>
                        {isSelected && (
                          <span className="text-brand-600 font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border-default">
            <Button
              onClick={() => {
                if (!selectedTemplate) {
                  toast.error('Please select a template');
                  return;
                }
                setStep(2);
              }}
              disabled={!selectedTemplate}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
            >
              Continue to Audience
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Audience */}
      {step === 2 && (
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
              { id: 'all', title: 'All CRM Contacts', desc: `Broadcast to all ${contacts.length} synced leads` },
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
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              onClick={() => {
                if (totalAudienceCount === 0) {
                  toast.error('Selected audience contains 0 recipients.');
                  return;
                }
                setStep(3);
              }}
              disabled={totalAudienceCount === 0}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
            >
              Continue to Personalize
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Personalize */}
      {step === 3 && (
        <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Step 3 — Map Template Variables
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Replace placeholders like <code className="text-brand-600 font-mono">{'{{1}}'}</code> with contact details or static values.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variable Mappings */}
            <div className="space-y-4">
              {detectedVariables.length === 0 ? (
                <div className="p-4 rounded-xl bg-bg-subtle text-xs text-text-muted italic">
                  This template does not require any dynamic variables. You can proceed directly!
                </div>
              ) : (
                detectedVariables.map((v) => {
                  const cur = variableMappings[v] || { type: 'field', value: 'name' };
                  return (
                    <div key={v} className="rounded-xl border border-border-default bg-bg-subtle/50 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-brand-600">
                          Variable {'{{' + v + '}}'}
                        </span>
                        <div className="flex gap-1 text-[11px]">
                          {(['field', 'static'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setVariableMappings((prev) => ({
                                  ...prev,
                                  [v]: { type: t, value: t === 'field' ? 'name' : '' },
                                }))
                              }
                              className={cn(
                                'rounded px-2 py-0.5 font-semibold capitalize',
                                cur.type === t
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-bg-surface text-text-muted border border-border-default',
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {cur.type === 'field' ? (
                        <select
                          value={cur.value}
                          onChange={(e) =>
                            setVariableMappings((prev) => ({
                              ...prev,
                              [v]: { ...cur, value: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-xs text-text-primary"
                        >
                          <option value="name">Contact Name</option>
                          <option value="phone">Phone Number</option>
                          <option value="email">Email Address</option>
                          <option value="company">Company</option>
                        </select>
                      ) : (
                        <Input
                          value={cur.value}
                          onChange={(e) =>
                            setVariableMappings((prev) => ({
                              ...prev,
                              [v]: { ...cur, value: e.target.value },
                            }))
                          }
                          placeholder="e.g. Prestige High Fields"
                          className="bg-bg-surface text-xs"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Live Chat Bubble Preview */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                Live Message Preview:
              </span>
              <div className="rounded-2xl border border-border-default bg-bg-subtle/70 p-4 min-h-48">
                <div className="max-w-[280px] rounded-2xl bg-bg-surface border border-border-default p-3 shadow-xs">
                  <p className="whitespace-pre-wrap text-xs text-text-primary leading-relaxed">
                    {previewBodyText}
                  </p>
                  <span className="mt-2 block text-right text-[10px] text-text-muted">
                    12:00 PM · WhatsApp HSM
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border-default">
            <Button variant="outline" size="sm" onClick={() => setStep(2)} className="text-xs">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
            >
              Continue to Schedule
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Schedule & Launch */}
      {step === 4 && (
        <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Step 4 — Review & Launch Broadcast
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Give your campaign a title and choose whether to send now or schedule for later.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Campaign Name *
              </label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Bangalore Tech Summit VIP Invite"
                className="bg-bg-subtle text-xs"
              />
            </div>

            {/* Campaign Summary Card */}
            <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border-default/50">
                <span className="text-text-muted">Template:</span>
                <span className="font-semibold text-text-primary">{selectedTemplate?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-default/50">
                <span className="text-text-muted">Audience:</span>
                <span className="font-semibold text-text-primary">{totalAudienceCount.toLocaleString()} recipients</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-default/50">
                <span className="text-text-muted">Language:</span>
                <span className="font-semibold text-text-primary">{selectedTemplate?.language || 'en_US'}</span>
              </div>
            </div>

            {/* Schedule Option */}
            <div className="rounded-xl border border-border-default bg-bg-surface p-4 space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-border-default text-brand-600 focus:ring-brand-500"
                />
                Schedule for future date and time
              </label>

              {isScheduled && (
                <div className="pt-2">
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-bg-subtle text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border-default">
            <Button variant="outline" size="sm" onClick={() => setStep(3)} className="text-xs">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs font-semibold px-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Launching...
                </>
              ) : isScheduled ? (
                <>
                  <Calendar className="mr-1.5 h-4 w-4" />
                  Schedule Broadcast
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Dispatch Campaign Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
