import type { ContentStatus } from '../types'

const STATUS_CONFIG: Record<ContentStatus, { label: string; dot: string; bg: string; text: string }> = {
  live: {
    label: '公開中',
    dot: '#1D9E75',
    bg: '#E1F5EE',
    text: '#085041',
  },
  dev: {
    label: '開発中',
    dot: '#BA7517',
    bg: '#FAEEDA',
    text: '#633806',
  },
  planned: {
    label: '近日公開',
    dot: '#aaa',
    bg: '#F1EFE8',
    text: '#5F5E5A',
  },
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border"
      style={{ background: c.bg, color: c.text, borderColor: c.dot + '55' }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot }}
      />
      {c.label}
    </span>
  )
}
