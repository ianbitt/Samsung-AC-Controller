import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface DropdownProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className
}: DropdownProps<T>): React.JSX.Element {
  const current = options.find((o) => o.value === value)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-2 rounded-control bg-surface-raised px-3 py-2 text-left text-xs font-medium text-text transition-colors duration-150',
            'hover:bg-surface-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
        >
          {current?.icon}
          <span className="flex-1 truncate">{current?.label ?? 'Select…'}</span>
          <ChevronDown size={14} className="shrink-0 text-text-faint" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden rounded-control border border-border bg-surface p-1 shadow-xl"
        >
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onSelect={() => onChange(option.value)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-[calc(var(--radius-control)-4px)] px-2.5 py-1.5 text-xs font-medium text-text outline-none transition-colors',
                'data-[highlighted]:bg-surface-raised'
              )}
            >
              {option.icon}
              <span className="flex-1 truncate">{option.label}</span>
              {option.value === value && <Check size={14} className="text-accent" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
