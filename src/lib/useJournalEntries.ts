import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { useAuth } from './AuthContext'

type EntriesMap = Record<string, { date: string; content: string }>

export function useJournalEntries(year: number) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<EntriesMap>({})
  const [loading, setLoading] = useState(true)

  // Load entries for the year
  useEffect(() => {
    if (!user) {
      setEntries({})
      setLoading(false)
      return
    }

    const loadEntries = async () => {
      setLoading(true)
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      const { data, error } = await supabase
        .from('journal_entries')
        .select('date, content')
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) {
        console.error('Error loading entries:', error)
        setLoading(false)
        return
      }

      const entriesMap: EntriesMap = {}
      for (const entry of data || []) {
        entriesMap[entry.date] = { date: entry.date, content: entry.content }
      }
      setEntries(entriesMap)
      setLoading(false)
    }

    loadEntries()
  }, [user, year])

  // Update or create an entry
  const updateEntry = useCallback(async (date: string, content: string) => {
    if (!user) return

    // Optimistic update
    if (content.trim() === '') {
      setEntries(prev => {
        const next = { ...prev }
        delete next[date]
        return next
      })
    } else {
      setEntries(prev => ({
        ...prev,
        [date]: { date, content },
      }))
    }

    // Persist to Supabase
    if (content.trim() === '') {
      // Delete entry
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date)

      if (error) {
        console.error('Error deleting entry:', error)
      }
    } else {
      // Upsert entry
      const { error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          date,
          content,
        }, {
          onConflict: 'user_id,date',
        })

      if (error) {
        console.error('Error saving entry:', error)
      }
    }
  }, [user])

  return { entries, loading, updateEntry }
}
