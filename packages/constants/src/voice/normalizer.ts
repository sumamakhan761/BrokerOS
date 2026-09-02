// ============================================================================
// BrokerOS — Voice Dynamic Variables Normalizer & Template Pre-Interpolation
// ============================================================================

export interface VoiceLeadNormalizerSource {
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  budget?: number | string | null;
  temperature?: string | null;
  mergeData?: Record<string, any> | any;
  customFields?: Record<string, any> | any;
  [key: string]: any;
}

export interface VoiceProjectNormalizerSource {
  name?: string | null;
  city?: string | null;
  address?: string | null;
  location?: string | null;
  startingPrice?: string | null;
  brochureUrl?: string | null;
  [key: string]: any;
}

/**
 * Normalizes any lead record (from CRM Lead, CSV upload, or test payload)
 * into a standard, clean dictionary of voice template variables with no unparsed tags.
 */
export function normalizeVoiceLeadVariables(
  lead?: VoiceLeadNormalizerSource | null,
  project?: VoiceProjectNormalizerSource | null,
  agentName: string = 'Senior Property Advisor',
): Record<string, any> {
  const mergeData = (lead?.mergeData || lead?.customFields || {}) as Record<string, any>;

  // 1. Resolve Full Name
  const rawFullName = (
    lead?.name ||
    lead?.fullName ||
    mergeData.fullName ||
    mergeData['Full Name'] ||
    mergeData['name'] ||
    mergeData['Name'] ||
    mergeData.customerName ||
    ''
  ).trim();

  // 2. Resolve First Name
  let firstName = (
    lead?.firstName ||
    mergeData.firstName ||
    mergeData['First Name'] ||
    mergeData['first_name'] ||
    ''
  ).trim();

  if (!firstName && rawFullName) {
    firstName = rawFullName.split(/\s+/)[0] || '';
  }
  if (!firstName) {
    firstName = 'Valued Client';
  }

  const fullName = rawFullName || firstName;

  // 3. Resolve City
  const city = (
    lead?.city ||
    mergeData.city ||
    mergeData['City'] ||
    project?.city ||
    'your city'
  ).trim();

  // 4. Resolve Budget
  const rawBudget = lead?.budget ?? mergeData.budget ?? mergeData['Budget'] ?? mergeData['Budget (INR)'];
  let budgetStr = 'the requested budget';
  if (rawBudget !== undefined && rawBudget !== null && String(rawBudget).trim() !== '') {
    const num = Number(rawBudget);
    if (!isNaN(num) && num > 0) {
      if (num >= 10000000) {
        budgetStr = `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      } else if (num >= 100000) {
        budgetStr = `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
      } else {
        budgetStr = `₹${num.toLocaleString('en-IN')}`;
      }
    } else {
      budgetStr = String(rawBudget);
    }
  }

  // 5. Resolve Project Variables
  const projectName = project?.name || mergeData.projectName || mergeData['Interested Project'] || 'our premier luxury development';
  const projectLocation = project?.location || project?.address || project?.city || city;
  const projectStartingPrice = project?.startingPrice || 'exclusive pre-launch pricing';

  return {
    firstName,
    fullName,
    city,
    budget: budgetStr,
    phone: lead?.phone || mergeData.phone || mergeData['Phone Number'] || '',
    projectName,
    projectLocation,
    projectStartingPrice,
    agentName,
    ...mergeData,
  };
}

/**
 * Pre-interpolates `{{lead.firstName}}`, `{{lead.fullName}}`, `{{project.name}}`, etc.
 * in text/systemPrompt strings so that all voice agents receive fully rendered prompts.
 */
export function interpolateVoiceTemplate(
  template?: string | null,
  variables: Record<string, any> = {},
): string {
  if (!template) return '';

  return template
    .replace(/\{\{\s*(?:lead\.)?firstName\s*\}\}/gi, variables.firstName || 'Valued Client')
    .replace(/\{\{\s*(?:lead\.)?fullName\s*\}\}/gi, variables.fullName || variables.firstName || 'Valued Client')
    .replace(/\{\{\s*(?:lead\.)?name\s*\}\}/gi, variables.fullName || variables.firstName || 'Valued Client')
    .replace(/\{\{\s*(?:lead\.)?city\s*\}\}/gi, variables.city || 'your city')
    .replace(/\{\{\s*(?:lead\.)?budget\s*\}\}/gi, variables.budget || 'the requested budget')
    .replace(/\{\{\s*(?:project\.)?name\s*\}\}/gi, variables.projectName || 'our luxury development')
    .replace(/\{\{\s*(?:project\.)?location\s*\}\}/gi, variables.projectLocation || variables.city || 'prime location')
    .replace(/\{\{\s*(?:project\.)?startingPrice\s*\}\}/gi, variables.projectStartingPrice || 'exclusive pricing')
    .replace(/\{\{\s*(?:agent\.)?name\s*\}\}/gi, variables.agentName || 'Senior Property Advisor')
    .replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
      if (variables[key] !== undefined && variables[key] !== null) {
        return String(variables[key]);
      }
      return match;
    });
}
