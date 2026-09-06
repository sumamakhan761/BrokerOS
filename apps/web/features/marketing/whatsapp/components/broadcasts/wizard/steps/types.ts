import type { WhatsAppTemplate, WhatsAppContact } from '../../../../types';

export interface TagItem {
  id: string;
  name: string;
  color?: string;
}

export interface CustomFieldItem {
  id: string;
  fieldName: string;
  fieldType: string;
}

export interface CsvRecipient {
  phone: string;
  name?: string;
  params?: string[];
}

export type VariableMapping = Record<
  string,
  { type: 'field' | 'static' | 'custom'; value: string }
>;
