import type { ContentStatus } from '../types'

const STATUS_CONFIG: Record<ContentStatus, { label: string; className: string }> = {
  live: {
    label: '公開中',
    className: 'bg-cl-primary-light text-cl-primary border-cl-primary-border',
  },
  dev: {
    label: '開発中',
    className: 'bg-amber-50 text-amber-700 border-amber-300',
  },
  planned: {
    label: '準備中',
    className: 'bg-gray-100 text-gray-500 border-gray-300',
  },
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-block px-3 py-0.5 text-xs font-bold rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
