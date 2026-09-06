'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  TagItem,
  TemplateItem,
  CustomFieldItem,
  PipelineItem,
  StageItem,
  MemberItem,
  AutomationResources,
} from './types';

export const ResourcesContext = createContext<AutomationResources>({
  tags: [],
  templates: [],
  customFields: [],
  pipelines: [],
  stages: [],
  members: [],
});

export function useResources() {
  return useContext(ResourcesContext);
}

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tagRes, tmplRes, cfRes, pipeRes, memRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/tags`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/templates`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/custom-fields`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/pipelines`).catch(() => null),
          fetch(`${baseUrl}/api/leads/assignees`).catch(() => null),
        ]);

        if (cancelled) return;

        if (tagRes?.ok) {
          const t = await tagRes.json();
          setTags(Array.isArray(t) ? t : t?.tags || []);
        }
        if (tmplRes?.ok) {
          const m = await tmplRes.json();
          setTemplates(Array.isArray(m) ? m : m?.templates || m?.items || []);
        }
        if (cfRes?.ok) {
          const cf = await cfRes.json();
          setCustomFields(Array.isArray(cf) ? cf : cf?.fields || []);
        }
        if (pipeRes?.ok) {
          const p = await pipeRes.json();
          const plist = Array.isArray(p) ? p : p?.pipelines || [];
          setPipelines(plist);
          const stList = plist.flatMap((pl: any) =>
            (pl.stages || []).map((s: any) => ({ ...s, pipelineId: pl.id })),
          );
          setStages(stList);
        }
        if (memRes?.ok) {
          const mem = await memRes.json();
          setMembers(Array.isArray(mem) ? mem : mem?.users || mem?.data || []);
        }
      } catch (err) {
        // graceful degrade
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  return (
    <ResourcesContext.Provider
      value={{ tags, templates, customFields, pipelines, stages, members }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}
