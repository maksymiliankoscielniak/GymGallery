import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'

interface StepperProps {
  value: number
  onChange: (delta: number) => void
  min?: number
  max?: number
  label: string
  unit?: string
  className?: string
  buttonClassName?: string
  valueClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Licznik −/+ z pełną obsługą klawiatury (strzałki góra/dół na wartości). */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 40,
  label,
  unit,
  className,
  buttonClassName,
  valueClassName,
  size = 'md',
}: StepperProps) {
  const btn = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const icon = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div
      className={cn('inline-flex items-center gap-1.5', className)}
      role="spinbutton"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault()
          if (value < max) onChange(1)
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault()
          if (value > min) onChange(-1)
        }
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${label}: odejmij`}
        disabled={value <= min}
        onClick={() => onChange(-1)}
        className={cn('flex items-center justify-center rounded-full border transition disabled:opacity-30', btn, buttonClassName)}
      >
        <Minus className={icon} aria-hidden />
      </button>
      <span className={cn('min-w-[2.2ch] text-center tabular', valueClassName)}>
        {value}
        {unit && <span className="ml-0.5 text-[0.6em] opacity-70">{unit}</span>}
      </span>
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${label}: dodaj`}
        disabled={value >= max}
        onClick={() => onChange(1)}
        className={cn('flex items-center justify-center rounded-full border transition disabled:opacity-30', btn, buttonClassName)}
      >
        <Plus className={icon} aria-hidden />
      </button>
    </div>
  )
}
