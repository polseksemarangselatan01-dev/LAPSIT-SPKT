import { ReportData } from '../types/report';

const INDONESIAN_DAYS = [
  'MINGGU',
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
];

export function getIndonesianDayName(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '-';
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) return '-';
  return INDONESIAN_DAYS[date.getDay()] || '-';
}

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export function isValidWhatsAppPhone(raw: string): boolean {
  const normalized = normalizePhoneNumber(raw);
  return normalized.length >= 10 && normalized.length <= 15;
}

export function formatPhoneReadable(raw: string): string {
  const normalized = normalizePhoneNumber(raw);
  if (!normalized) return '';
  if (normalized.startsWith('62') && normalized.length >= 10) {
    const rest = normalized.slice(2);
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 7);
    const p3 = rest.slice(7);
    return `+62 ${p1}${p2 ? `-${p2}` : ''}${p3 ? `-${p3}` : ''}`;
  }
  return `+${normalized}`;
}

function wrapBold(text: string, bold: boolean): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  return bold ? `*${trimmed}*` : trimmed;
}

export function generateReportText(data: ReportData): string {
  const lines: string[] = [];

  if (data.unitName.trim()) {
    lines.push(data.unitName.trim());
    lines.push('');
  }

  if (data.kepadaTarget.trim()) {
    if (data.kepadaLabel.trim()) {
      lines.push(data.kepadaLabel.trim());
    }
    lines.push(wrapBold(data.kepadaTarget, data.boldKepada));
    lines.push('');
  }

  const activeTembusan = data.tembusanList.map((t) => t.trim()).filter(Boolean);
  if (activeTembusan.length > 0) {
    if (data.tembusanLabel.trim()) {
      lines.push(wrapBold(data.tembusanLabel, data.boldTembusan));
    }
    activeTembusan.forEach((item) => {
      lines.push(wrapBold(item, data.boldTembusan));
    });
    lines.push('');
  }

  const narrativeParts = [data.greetingText.trim(), data.introNarrative.trim()]
    .filter(Boolean)
    .join(', ');
  if (narrativeParts) {
    lines.push(narrativeParts);
  }

  if (data.includePeriodBlock) {
    const startDay = getIndonesianDayName(data.startDate);
    const startFormatted = formatIndonesianDate(data.startDate);
    const endDay = getIndonesianDayName(data.endDate);
    const endFormatted = formatIndonesianDate(data.endDate);

    lines.push(`Hari      : ${startDay}`);
    lines.push(`Tanggal : ${startFormatted}`);
    lines.push(`Pukul    : ${data.startTime.trim()}`);
    if (data.periodConnector.trim()) {
      lines.push(data.periodConnector.trim());
    }
    lines.push(`Hari      : ${endDay}`);
    lines.push(`Tanggal : ${endFormatted}`);
    lines.push(`Pukul    : ${data.endTime.trim()}`);
  }

  if (data.conditionSummary.trim()) {
    lines.push(data.conditionSummary.trim());
  }

  if (data.sections.length > 0) {
    lines.push('');
  }

  data.sections.forEach((section, sIdx) => {
    if (section.title.trim()) {
      lines.push(wrapBold(section.title, section.boldTitle));
    }
    section.items.forEach((item) => {
      const prefixPart = item.prefix.trim()
        ? `${wrapBold(item.prefix, item.boldPrefix)} `
        : '';
      const spacer = item.spacer || '';
      const val = item.value.trim() || '-';
      lines.push(`${prefixPart}${item.label}${spacer}: ${val}`);
    });
    if (sIdx < data.sections.length - 1) {
      lines.push('');
    }
  });

  if (data.closingTag.trim()) {
    lines.push('');
    lines.push(data.closingTag.trim());
  }

  if (
    data.signOffGreeting.trim() ||
    data.signOffRole.trim() ||
    data.signOffName.trim()
  ) {
    lines.push('');
    if (data.signOffGreeting.trim()) {
      lines.push(data.signOffGreeting.trim());
    }
    if (data.signOffRole.trim()) {
      lines.push(wrapBold(data.signOffRole, data.boldSignOffRole));
    }
    if (data.signOffName.trim()) {
      lines.push(data.signOffName.trim());
    }
  }

  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  const normalized = normalizePhoneNumber(phone);
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function normalizeGroupInviteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(trimmed)) {
    return trimmed;
  }
  if (/^chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return '';
}

export function getGreetingByTime(hour: number): string {
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function getLocalIsoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface TextSegment {
  text: string;
  bold: boolean;
}

export function parseWhatsAppBoldLine(line: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /\*([^*\n]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: line.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex), bold: false });
  }

  if (segments.length === 0) {
    segments.push({ text: '', bold: false });
  }

  return segments;
}
