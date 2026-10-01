import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { dataLocal } from '../../lib/dominio'

interface SeletorDataHoraProps {
  align?: 'left' | 'right'
  label?: string
  mode?: 'date' | 'date-time'
  onChange: (value: string) => void
  overlay?: boolean
  value: string
  variant?: 'compact' | 'default'
}

interface PickerLayerProps {
  children: ReactNode
  onClose: () => void
  overlay: boolean
}

function PickerLayer({ children, onClose, overlay }: PickerLayerProps) {
  if (!overlay) return children

  return createPortal(
    <div
      className="fixed inset-0 z-[140] grid place-items-center overflow-hidden bg-[rgba(7,31,25,0.76)] p-4 backdrop-blur-[14px]"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      {children}
    </div>,
    document.body,
  )
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const timeSlots = Array.from({ length: 21 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return date
  })
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1)
}

export function SeletorDataHora({
  align = 'left',
  label = 'Data selecionada',
  mode = 'date-time',
  onChange,
  overlay = false,
  value,
  variant = 'default',
}: SeletorDataHoraProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateValue, timeValue = '08:00'] = value.split('T')
  const includesTime = mode === 'date-time'
  const selectedDate = parseLocalDate(dateValue || dataLocal())
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pickerId = useId()
  const days = calendarDays(visibleMonth)
  const today = dataLocal()

  useEffect(() => {
    if (!isOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target as Node
      if (!containerRef.current?.contains(target) && !pickerRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [isOpen])

  function selectDate(date: Date) {
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    onChange(includesTime ? `${toDateKey(date)}T${timeValue}` : toDateKey(date))
  }

  function selectTime(time: string) {
    onChange(`${dateValue || dataLocal()}T${time}`)
  }

  function changeMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function selectToday() {
    const date = parseLocalDate(today)
    selectDate(date)
  }

  const monthLabel = capitalize(
    visibleMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  )
  const selectedDateLabel = capitalize(
    selectedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }),
  )
  const compactDateLabel = selectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function closePicker() {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex w-full items-center justify-between gap-4 rounded-[15px] border bg-white px-4 text-left transition ${
          variant === 'compact' ? 'min-h-[58px]' : 'min-h-[66px]'
        } ${
          isOpen
            ? 'border-brand-500 shadow-[0_0_0_4px_rgba(47,141,111,0.1)]'
            : 'border-[#cdded6] hover:border-brand-400 hover:bg-brand-50/40'
        }`}
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#74867e]">{label}</span>
          <strong className="mt-1 block truncate text-base font-bold text-[#284e41]">
            {compactDateLabel}
            {includesTime && ` às ${timeValue}`}
          </strong>
        </span>
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-[13px] border-0 bg-brand-100 text-brand-700 transition hover:bg-brand-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          onClick={() => setIsOpen((current) => !current)}
          aria-controls={pickerId}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={
            includesTime ? 'Selecionar data e horário' : `Selecionar ${label.toLowerCase()}`
          }
          ref={triggerRef}
        >
          <CalendarDays size={21} />
        </button>
      </div>

      {isOpen && (
        <PickerLayer onClose={closePicker} overlay={overlay}>
          <section
            className={
              overlay
                ? 'relative z-[141] w-[min(920px,calc(100vw-32px))] overflow-hidden rounded-[22px] border border-white/70 bg-[#f8fbf9] shadow-[0_36px_100px_rgba(5,29,22,0.38)] max-[760px]:max-h-[calc(100vh-24px)] max-[760px]:overflow-y-auto'
                : `absolute top-full z-40 mt-3 max-h-[min(720px,calc(100vh-120px))] overflow-y-auto rounded-[22px] border border-[#c5d9cf] bg-[#f8fbf9] shadow-[0_28px_70px_rgba(20,61,47,0.22)] max-[760px]:relative max-[760px]:top-auto max-[760px]:right-auto max-[760px]:left-auto ${
                    includesTime
                      ? 'left-0 w-full max-w-[920px]'
                      : `${align === 'right' ? 'right-0' : 'left-0'} w-[min(430px,calc(100vw-32px))]`
                  }`
            }
            id={pickerId}
            role="dialog"
            aria-modal={overlay || undefined}
            aria-label={includesTime ? 'Selecionar data e horário' : 'Selecionar data'}
            ref={pickerRef}
          >
            <header
              className={`flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-800 to-brand-600 px-5 text-white ${
                overlay ? 'py-3' : 'py-4'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white/12 text-brand-100 ring-1 ring-white/20">
                  <CalendarDays size={22} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[13px] font-semibold tracking-[0.08em] text-brand-100 uppercase">
                    {label}
                  </span>
                  <strong className="mt-0.5 block truncate text-base font-bold">
                    {selectedDateLabel}
                  </strong>
                </div>
              </div>
              {includesTime && (
                <div className="flex items-center gap-2 rounded-[14px] bg-white/12 px-4 py-2.5 ring-1 ring-white/20">
                  <Clock3 size={19} />
                  <span className="text-[13px] font-semibold text-brand-100">Horário</span>
                  <strong className="font-display text-xl">{timeValue}</strong>
                </div>
              )}
            </header>

            <div
              className={`grid gap-0 ${
                includesTime
                  ? overlay
                    ? 'min-[760px]:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]'
                    : 'min-[1050px]:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]'
                  : 'grid-cols-1'
              }`}
            >
              <div
                className={`${overlay ? 'p-4' : 'p-5'} ${
                  includesTime
                    ? overlay
                      ? 'border-b border-[#dce8e2] min-[760px]:border-r min-[760px]:border-b-0'
                      : 'border-b border-[#dce8e2] min-[1050px]:border-r min-[1050px]:border-b-0'
                    : ''
                }`}
              >
                <div
                  className={`${overlay ? 'mb-3' : 'mb-5'} flex items-center justify-between gap-3`}
                >
                  <div>
                    <span className="block text-[13px] font-semibold tracking-[0.08em] text-[#6d8178] uppercase">
                      Escolha o dia
                    </span>
                    <strong className="font-display mt-1 block text-xl text-[#234c3f]">
                      {monthLabel}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="min-h-10 rounded-xl border border-[#cfe0d8] bg-white px-3 text-sm font-bold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
                      onClick={selectToday}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      className="grid size-10 place-items-center rounded-xl border border-[#cfe0d8] bg-white text-[#46695c] transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      onClick={() => changeMonth(-1)}
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      className="grid size-10 place-items-center rounded-xl border border-[#cfe0d8] bg-white text-[#46695c] transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      onClick={() => changeMonth(1)}
                      aria-label="Próximo mês"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={monthLabel}>
                  {weekDays.map((day) => (
                    <span
                      className="py-2 text-center text-[13px] font-bold text-[#74877f]"
                      key={day}
                      role="columnheader"
                    >
                      {day}
                    </span>
                  ))}
                  {days.map((day) => {
                    const dateKey = toDateKey(day)
                    const isSelected = dateKey === dateValue
                    const isToday = dateKey === today
                    const isCurrentMonth = day.getMonth() === visibleMonth.getMonth()

                    return (
                      <button
                        type="button"
                        className={`relative grid place-items-center rounded-xl text-sm font-bold transition focus-visible:z-10 ${
                          overlay ? 'min-h-9' : 'min-h-11'
                        } ${
                          isSelected
                            ? 'bg-brand-700 text-white shadow-[0_8px_18px_rgba(25,116,92,0.24)]'
                            : isCurrentMonth
                              ? 'text-[#35594c] hover:bg-brand-100 hover:text-brand-800'
                              : 'text-[#a6b2ad] hover:bg-white hover:text-[#6b7f77]'
                        }`}
                        onClick={() => selectDate(day)}
                        aria-label={day.toLocaleDateString('pt-BR', { dateStyle: 'full' })}
                        aria-selected={isSelected}
                        role="gridcell"
                        key={dateKey}
                      >
                        {day.getDate()}
                        {isToday && !isSelected && (
                          <span
                            className="absolute bottom-1.5 size-1 rounded-full bg-brand-500"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {includesTime && (
                <div className={overlay ? 'p-4' : 'p-5'}>
                  <div className="mb-4">
                    <span className="block text-[13px] font-semibold tracking-[0.08em] text-[#6d8178] uppercase">
                      Escolha o horário
                    </span>
                    <strong className="font-display mt-1 block text-xl text-[#234c3f]">
                      Horários da clínica
                    </strong>
                  </div>
                  <div
                    className={`grid gap-2 pr-1 ${
                      overlay
                        ? 'grid-cols-3 overflow-hidden'
                        : 'max-h-[330px] grid-cols-2 overflow-y-auto min-[520px]:grid-cols-3 min-[880px]:grid-cols-2'
                    }`}
                  >
                    {timeSlots.map((time) => {
                      const isSelected = time === timeValue

                      return (
                        <button
                          type="button"
                          className={`${overlay ? 'min-h-9' : 'min-h-11'} rounded-xl border px-3 text-sm font-bold transition ${
                            isSelected
                              ? 'border-brand-700 bg-brand-700 text-white shadow-[0_7px_16px_rgba(25,116,92,0.2)]'
                              : 'border-[#d5e3dc] bg-white text-[#46675b] hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800'
                          }`}
                          onClick={() => selectTime(time)}
                          aria-pressed={isSelected}
                          key={time}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <footer
              className={`flex items-center justify-between gap-4 border-t border-[#d7e5de] bg-white px-5 max-[560px]:items-stretch max-[560px]:flex-col ${
                overlay ? 'py-3' : 'py-4'
              }`}
            >
              <span className="text-sm font-semibold text-[#60776d]">
                {compactDateLabel}
                {includesTime && ` às ${timeValue}`}
              </span>
              <button
                type="button"
                className="min-h-11 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(25,116,92,0.18)] transition hover:bg-brand-800"
                onClick={closePicker}
              >
                {includesTime ? 'Aplicar data e horário' : 'Aplicar data'}
              </button>
            </footer>
          </section>
        </PickerLayer>
      )}
      {includesTime && <input type="hidden" name="dataHora" value={value} />}
    </div>
  )
}

export function DatePicker(props: Omit<SeletorDataHoraProps, 'mode'>) {
  return <SeletorDataHora {...props} mode="date" />
}
