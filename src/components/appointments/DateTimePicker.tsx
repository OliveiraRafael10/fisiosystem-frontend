import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { localDate } from '../../lib/domain'

interface DateTimePickerProps {
  onChange: (value: string) => void
  value: string
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

export function DateTimePicker({ onChange, value }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateValue, timeValue = '08:00'] = value.split('T')
  const selectedDate = parseLocalDate(dateValue || localDate())
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const days = calendarDays(visibleMonth)
  const today = localDate()

  useEffect(() => {
    if (!isOpen) return

    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  function selectDate(date: Date) {
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    onChange(`${toDateKey(date)}T${timeValue}`)
  }

  function selectTime(time: string) {
    onChange(`${dateValue || localDate()}T${time}`)
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={`flex min-h-[66px] w-full items-center justify-between gap-4 rounded-[15px] border bg-white px-4 text-left transition ${
          isOpen
            ? 'border-brand-500 shadow-[0_0_0_4px_rgba(47,141,111,0.1)]'
            : 'border-[#cdded6] hover:border-brand-400 hover:bg-brand-50/40'
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-controls="appointment-date-time-picker"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        ref={triggerRef}
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#74867e]">Data selecionada</span>
          <strong className="mt-1 block truncate text-base font-bold text-[#284e41]">
            {compactDateLabel} às {timeValue}
          </strong>
        </span>
        <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-brand-100 text-brand-700">
          <CalendarDays size={21} />
        </span>
      </button>

      {isOpen && (
        <section
          className="absolute top-full left-0 z-40 mt-3 max-h-[min(720px,calc(100vh-120px))] w-full max-w-[920px] overflow-y-auto rounded-[22px] border border-[#c5d9cf] bg-[#f8fbf9] shadow-[0_28px_70px_rgba(20,61,47,0.22)] max-[760px]:relative max-[760px]:top-auto max-[760px]:left-auto"
          id="appointment-date-time-picker"
          role="dialog"
          aria-label="Selecionar data e horário da consulta"
        >
          <header className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brand-800 to-brand-600 px-5 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white/12 text-brand-100 ring-1 ring-white/20">
                <CalendarDays size={22} />
              </span>
              <div className="min-w-0">
                <span className="block text-[13px] font-semibold tracking-[0.08em] text-brand-100 uppercase">
                  Data selecionada
                </span>
                <strong className="mt-0.5 block truncate text-base font-bold">
                  {selectedDateLabel}
                </strong>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[14px] bg-white/12 px-4 py-2.5 ring-1 ring-white/20">
              <Clock3 size={19} />
              <span className="text-[13px] font-semibold text-brand-100">Horário</span>
              <strong className="font-display text-xl">{timeValue}</strong>
            </div>
          </header>

          <div className="grid gap-0 min-[1050px]:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <div className="border-b border-[#dce8e2] p-5 min-[1050px]:border-r min-[1050px]:border-b-0">
              <div className="mb-5 flex items-center justify-between gap-3">
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
                      className={`relative grid min-h-11 place-items-center rounded-xl text-sm font-bold transition focus-visible:z-10 ${
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

            <div className="p-5">
              <div className="mb-4">
                <span className="block text-[13px] font-semibold tracking-[0.08em] text-[#6d8178] uppercase">
                  Escolha o horário
                </span>
                <strong className="font-display mt-1 block text-xl text-[#234c3f]">
                  Horários da clínica
                </strong>
              </div>
              <div className="grid max-h-[330px] grid-cols-2 gap-2 overflow-y-auto pr-1 min-[520px]:grid-cols-3 min-[880px]:grid-cols-2">
                {timeSlots.map((time) => {
                  const isSelected = time === timeValue

                  return (
                    <button
                      type="button"
                      className={`min-h-11 rounded-xl border px-3 text-sm font-bold transition ${
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
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-[#d7e5de] bg-white px-5 py-4 max-[560px]:items-stretch max-[560px]:flex-col">
            <span className="text-sm font-semibold text-[#60776d]">
              {compactDateLabel} às {timeValue}
            </span>
            <button
              type="button"
              className="min-h-11 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(25,116,92,0.18)] transition hover:bg-brand-800"
              onClick={() => {
                setIsOpen(false)
                triggerRef.current?.focus()
              }}
            >
              Aplicar data e horário
            </button>
          </footer>
        </section>
      )}
      <input type="hidden" name="dataHora" value={value} />
    </div>
  )
}
