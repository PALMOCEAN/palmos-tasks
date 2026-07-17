import { PRIO_META, type Priority } from '@/lib/drift/types'

const STYLES: Record<Priority, string> = {
  must: 'bg-must/15 text-must',
  should: 'bg-should/15 text-should',
  could: 'bg-could/15 text-could',
  wont: 'bg-wont/15 text-wont',
}

export function PriorityBadge({
  priority,
  className = '',
}: {
  priority: Priority
  className?: string
}) {
  return (
    <span
      className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[priority]} ${className}`}
    >
      {PRIO_META[priority].label}
    </span>
  )
}
