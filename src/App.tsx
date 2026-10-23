import { useEffect, useMemo, useState } from 'react'
import { STATUSES } from './statuses'
import { useTimestamps } from './useTimestamps'
import { LANGUAGES, useLanguage } from './i18n'
import { formatDate, formatTime } from './format'

const CLEAR_CONFIRM_MS = 4000

function App() {
  const { timestamps, record, clear } = useTimestamps()
  const { language, setLanguage, t } = useLanguage()
  const [confirmingClear, setConfirmingClear] = useState(false)

  useEffect(() => {
    if (!confirmingClear) return
    const timer = setTimeout(() => setConfirmingClear(false), CLEAR_CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [confirmingClear])

  const onClear = () => {
    if (confirmingClear) {
      clear()
      setConfirmingClear(false)
    } else {
      setConfirmingClear(true)
    }
  }

  // Every recorded timestamp in chronological order, for transfer to the report sheet.
  const log = useMemo(
    () =>
      STATUSES.flatMap((status) => (timestamps[status.id] ?? []).map((time) => ({ status, time }))).sort(
        (a, b) => a.time - b.time,
      ),
    [timestamps],
  )

  return (
    <main className="app">
      <header className="header">
        <div className="lang" role="group" aria-label={t.language}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`lang__option${lang === language ? ' lang__option--active' : ''}`}
              aria-pressed={lang === language}
              onClick={() => setLanguage(lang)}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <section className="buttons">
        {STATUSES.map(({ id, label }) => {
          const list = timestamps[id] ?? []
          const latest = list.at(-1)
          return (
            <button
              key={id}
              type="button"
              className={`status${latest !== undefined ? ' status--set' : ''}`}
              onClick={() => record(id)}
            >
              <span className="status__label">{label[language]}</span>
              {latest !== undefined ? (
                <>
                  <span className="status__time">{formatTime(latest)}</span>
                  <span className="status__date">{formatDate(latest)}</span>
                  {list.length > 1 && <span className="status__count">×{list.length}</span>}
                </>
              ) : (
                <span className="status__empty">—</span>
              )}
            </button>
          )
        })}
        <button
          type="button"
          className={`clear${confirmingClear ? ' clear--confirm' : ''}`}
          onClick={onClear}
        >
          {confirmingClear ? t.confirmClear : t.clear}
        </button>
      </section>

      <section className="log" aria-label={t.log}>
        <h2>{t.log}</h2>
        {log.length === 0 ? (
          <p className="log__empty">{t.logEmpty}</p>
        ) : (
          <table>
            <tbody>
              {log.map(({ status, time }, i) => (
                <tr key={`${status.id}-${time}-${i}`}>
                  <td>{status.label[language]}</td>
                  <td>{formatDate(time)}</td>
                  <td className="log__time">{formatTime(time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

export default App
