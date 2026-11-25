export interface ReportItem {
  id: string;
  prefix: string;
  boldPrefix: boolean;
  label: string;
  spacer: string;
  value: string;
  quickValues?: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  boldTitle: boolean;
  items: ReportItem[];
}

export interface ReportData {
  senderAlias: string;
  unitName: string;
  kepadaLabel: string;
  kepadaTarget: string;
  boldKepada: boolean;
  tembusanLabel: string;
  tembusanList: string[];
  boldTembusan: boolean;
  greetingText: string;
  introNarrative: string;
  includePeriodBlock: boolean;
  startDate: string; // YYYY-MM-DD
  startTime: string;
  periodConnector: string;
  endDate: string; // YYYY-MM-DD
  endTime: string;
  conditionSummary: string;
  sections: ReportSection[];
  closingTag: string;
  signOffGreeting: string;
  signOffRole: string;
  boldSignOffRole: boolean;
  signOffName: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isBuiltIn: boolean;
  updatedAt: string;
  data: ReportData;
}

export interface TargetContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  notes?: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  category: string;
  inviteUrl?: string;
  notes?: string;
}

export type SendMode = 'phone' | 'groups';

export interface SentHistoryEntry {
  id: string;
  createdAt: string;
  templateId: string;
  templateName: string;
  targetName: string;
  targetPhone: string;
  groupNames?: string[];
  formattedMessage: string;
  data: ReportData;
}

export type ActiveTab = 'form' | 'templates' | 'history';
