export interface NegotiationNote {
  id: string;
  content: string;
  noteType: string;
  statusAtTimeOfNote: string;
  createdAt: string;
  user?: { username: string; displayUsername?: string };
}

export interface NegotiationFormData {
  title: string;
  askingPrice: string;
  offeredPrice: string;
  objections: string;
  strategy: string;
  nextStep: string;
}

export function parseNegotiationContent(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    return { raw: content };
  }
}
