import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import './App.css'
import { useAuth } from './lib/AuthContext'
import { useJournalEntries } from './lib/useJournalEntries'
import { Auth } from './components/Auth'

// Types
interface JournalEntry {
  date: string
  content: string
}

interface DayData {
  date: Date
  dateString: string
  day: number
  month: number
  isToday: boolean
  isFuture: boolean
  isEmpty: boolean
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  text: string
}

// Utility functions
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

const formatPanelDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  })
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

// Generate year data organized by months (12 months × up to 31 days)
const generateYearData = (year: number): DayData[][] => {
  const today = new Date()
  const months: DayData[][] = []

  for (let month = 0; month < 12; month++) {
    const daysInMonth = getDaysInMonth(year, month)
    const monthData: DayData[] = []

    // Add actual days
    for (let day = 1; day <= 31; day++) {
      if (day <= daysInMonth) {
        const date = new Date(year, month, day)
        const dateString = formatDateKey(date)

        monthData.push({
          date,
          dateString,
          day,
          month,
          isToday: isSameDay(date, today),
          isFuture: date > today,
          isEmpty: false,
        })
      } else {
        // Empty placeholder for days that don't exist in this month
        monthData.push({
          date: new Date(0),
          dateString: '',
          day,
          month,
          isToday: false,
          isFuture: false,
          isEmpty: true,
        })
      }
    }

    months.push(monthData)
  }

  return months
}

// Calculate current streak
const calculateStreak = (entries: Record<string, JournalEntry>): number => {
  const today = new Date()
  let streak = 0
  const currentDate = new Date(today)

  while (true) {
    const dateKey = formatDateKey(currentDate)
    if (entries[dateKey]) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NUMBERS = Array.from({ length: 31 }, (_, i) => i + 1)

function App() {
  const { user, loading: authLoading, signOut } = useAuth()
  const currentYear = new Date().getFullYear()
  const { entries, updateEntry } = useJournalEntries(currentYear)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Generate year data by months
  const months = useMemo(() => generateYearData(currentYear), [currentYear])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    const startOfYear = new Date(currentYear, 0, 1)
    const daysPassed = Math.ceil((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const entriesCount = Object.keys(entries).length
    const streak = calculateStreak(entries)

    return {
      daysPassed: Math.min(daysPassed, 365),
      entriesCount,
      streak,
    }
  }, [entries, currentYear])

  // Handle day click
  const handleDayClick = useCallback((dateString: string, isFuture: boolean, isEmpty: boolean) => {
    if (isFuture || isEmpty || !dateString) return
    setSelectedDate(dateString)
    setPanelOpen(true)
  }, [])

  // Handle panel close
  const handleClosePanel = useCallback(() => {
    setPanelOpen(false)
    setTimeout(() => setSelectedDate(null), 400)
  }, [])

  // Handle entry change with debounce
  const handleEntryChange = useCallback((content: string) => {
    if (!selectedDate) return
    updateEntry(selectedDate, content)
  }, [selectedDate, updateEntry])

  // Handle tooltip
  const handleMouseEnter = useCallback((e: React.MouseEvent, day: DayData) => {
    if (day.isEmpty) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text: formatDisplayDate(day.date),
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  // Focus textarea when panel opens
  useEffect(() => {
    if (panelOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400)
    }
  }, [panelOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelOpen) {
        handleClosePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [panelOpen, handleClosePanel])

  // Show loading state
  if (authLoading) {
    return (
      <div className="app app--loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Show auth if not logged in
  if (!user) {
    return <Auth />
  }

  // Get selected date info
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null
  const selectedEntry = selectedDate ? entries[selectedDate] : null

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="header__title">Journali</h1>
        <div className="header__right">
          <span className="header__year">{currentYear}</span>
          <button className="header__signout" onClick={signOut} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Year Grid Container */}
        <div className="year-grid-container">
          {/* Day Numbers Header (Desktop: top, Mobile: left side) */}
          <div className="day-numbers">
            <div className="day-numbers__spacer" />
            {DAY_NUMBERS.map(day => (
              <span key={day} className="day-number">
                {day}
              </span>
            ))}
          </div>

          {/* Month Rows */}
          <div className="months-grid">
            {months.map((monthData, monthIndex) => (
              <div key={monthIndex} className="month-row">
                <span className="month-label">{MONTH_NAMES[monthIndex]}</span>
                <div className="days-row">
                  {monthData.map((day, dayIndex) => {
                    const hasEntry = day.dateString && entries[day.dateString]
                    const isSelected = day.dateString === selectedDate

                    return (
                      <div
                        key={dayIndex}
                        className={`day-cell ${day.isEmpty ? 'day-cell--empty' : ''} ${hasEntry ? 'day-cell--has-entry' : ''} ${day.isToday ? 'day-cell--today' : ''} ${day.isFuture ? 'day-cell--future' : ''} ${isSelected ? 'day-cell--selected' : ''}`}
                        onClick={() => handleDayClick(day.dateString, day.isFuture, day.isEmpty)}
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bar - Stats & Legend */}
        <div className="footer-bar">
          <div className="stat">
            <span className="stat__value">{stats.entriesCount}</span>
            <span className="stat__label">entries</span>
          </div>
          <div className="stat">
            <span className="stat__value">{stats.streak}</span>
            <span className="stat__label">streak</span>
          </div>
          <div className="stat">
            <span className="stat__value">{stats.daysPassed}</span>
            <span className="stat__label">days</span>
          </div>

          <div className="legend">
            <div className="legend-item">
              <span className="legend-item__color legend-item__color--empty" />
              <span>Empty</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__color legend-item__color--filled" />
              <span>Entry</span>
            </div>
            <div className="legend-item">
              <span className="legend-item__color legend-item__color--today" />
              <span>Today</span>
            </div>
          </div>
        </div>
      </main>

      {/* Tooltip */}
      <div
        className={`tooltip ${tooltip.visible ? 'tooltip--visible' : ''}`}
        style={{
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        {tooltip.text}
      </div>

      {/* Panel Overlay */}
      <div
        className={`panel-overlay ${panelOpen ? 'panel-overlay--visible' : ''}`}
        onClick={handleClosePanel}
      />

      {/* Entry Panel */}
      <aside className={`entry-panel ${panelOpen ? 'entry-panel--open' : ''}`}>
        {selectedDateObj && (
          <>
            <header className="panel-header">
              <div className="panel-date">
                <span className="panel-date__day">{formatPanelDate(selectedDateObj)}</span>
                <span className="panel-date__full">{formatDisplayDate(selectedDateObj)}</span>
              </div>
              <button className="panel-close" onClick={handleClosePanel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="panel-content">
              <textarea
                ref={textareaRef}
                className="entry-textarea"
                placeholder="What happened today?"
                value={selectedEntry?.content || ''}
                onChange={(e) => handleEntryChange(e.target.value)}
              />
            </div>

            <footer className="panel-footer">
              <div className={`entry-status ${!selectedEntry?.content ? 'entry-status--empty' : ''}`}>
                <span className="entry-status__dot" />
                <span>{selectedEntry?.content ? 'Saved' : 'No entry yet'}</span>
              </div>
              <span className="character-count">
                {selectedEntry?.content?.length || 0} chars
              </span>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default App
