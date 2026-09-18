'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost']

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setLeads(data || [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function updateStatus(id, status) {
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l))
    await supabase.from('leads').update({ status }).eq('id', id)
  }

  async function updateNotes(id, notes) {
    setLeads(leads.map(l => l.id === id ? { ...l, notes } : l))
    await supabase.from('leads').update({ notes }).eq('id', id)
  }

  const phoneCounts = leads.reduce((acc, l) => {
    const p = (l.phone || '').replace(/\D/g, '')
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})

  const q = search.trim().toLowerCase()
  const filtered = leads
    .filter(l => filter === 'all' || l.business_type === filter)
    .filter(l => !q || [l.name, l.phone, l.business_name].some(v => (v || '').toLowerCase().includes(q)))
  const types = [...new Set(leads.map(l => l.business_type))]

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const todayCount = leads.filter(l => new Date(l.created_at) >= todayStart).length
  const weekCount = leads.filter(l => new Date(l.created_at) >= weekAgo).length
  const wonCount = leads.filter(l => l.status === 'Won').length
  const conversionRate = leads.length ? ((wonCount / leads.length) * 100).toFixed(1) : '0.0'

  function exportCSV() {
    const headers = ['Date', 'Name', 'Phone', 'Business', 'Type', 'Budget', 'Status', 'Message', 'Notes']
    const rows = filtered.map(l => [
      new Date(l.created_at).toLocaleString(), l.name, l.phone, l.business_name,
      l.business_type, l.monthly_budget, l.status || 'New', l.message || '', l.notes || ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spot-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="loadingPage">
        <span className="spinner" aria-hidden="true" />
        <span>Loading leads…</span>
        <style jsx>{`
          .loadingPage {
            display: flex;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #8b93a7;
            font-size: 14px;
          }
          .spinner {
            width: 16px;
            height: 16px;
            border-radius: 999px;
            border: 2px solid rgba(255, 255, 255, 0.12);
            border-top-color: #ff6b1a;
            animation: spin 700ms linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="header">
          <div className="titleGroup">
            <h1 className="title">Leads</h1>
            <span className="countBadge">{filtered.length}</span>
          </div>
          <button onClick={handleLogout} className="ghostBtn">Logout</button>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <div className="statValue">{todayCount}</div>
            <div className="statLabel">Today</div>
          </div>
          <div className="statCard">
            <div className="statValue">{weekCount}</div>
            <div className="statLabel">This Week</div>
          </div>
          <div className="statCard">
            <div className="statValue">{conversionRate}%</div>
            <div className="statLabel">Conversion (Won)</div>
          </div>
        </div>

        <div className="toolbar">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Filter by business type"
            className="select"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            placeholder="Search name, phone, business..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search leads"
            className="searchInput"
          />
          <button onClick={exportCSV} className="exportBtn">Export CSV</button>
        </div>

        <div className="tableCard">
          <div className="tableScroll">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Name</th>
                  <th className="th">Phone</th>
                  <th className="th">Business</th>
                  <th className="th">Type</th>
                  <th className="th">Budget</th>
                  <th className="th">Status</th>
                  <th className="th">Message</th>
                  <th className="th">Notes</th>
                  <th className="th">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const isHot = l.monthly_budget === '1,00,000+'
                  const isDup = phoneCounts[(l.phone || '').replace(/\D/g, '')] > 1
                  const statusKey = (l.status || 'New').toLowerCase()
                  return (
                    <tr key={l.id} className="row" data-hot={isHot ? 'true' : undefined}>
                      <td className="td tdMuted">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="td">
                        <span className="nameCell">
                          {l.name}
                          {isHot && <span className="badge badgeHot" title="High budget lead">🔥</span>}
                          {isDup && <span className="badge badgeDup" title="Duplicate phone number">⚠ Duplicate</span>}
                        </span>
                      </td>
                      <td className="td">{l.phone}</td>
                      <td className="td">{l.business_name}</td>
                      <td className="td"><span className="typePill">{l.business_type}</span></td>
                      <td className="td tdStrong">{l.monthly_budget}</td>
                      <td className="td">
                        <select
                          value={l.status || 'New'}
                          onChange={e => updateStatus(l.id, e.target.value)}
                          className={`statusSelect status-${statusKey}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="td tdMuted tdWrap">{l.message || '-'}</td>
                      <td className="td">
                        <input
                          defaultValue={l.notes || ''}
                          placeholder="Add note..."
                          aria-label={`Notes for ${l.name}`}
                          onBlur={e => { if (e.target.value !== (l.notes || '')) updateNotes(l.id, e.target.value) }}
                          className="notesInput"
                        />
                      </td>
                      <td className="td">
                        <a
                          href={`https://wa.me/${l.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="chatLink"
                        >
                          Chat
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          padding: 32px 40px 48px;
          animation: fadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .shell {
          max-width: 1400px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .titleGroup {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .title {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f5f6f8;
          margin: 0;
        }
        .countBadge {
          font-size: 13px;
          font-weight: 600;
          color: #8b93a7;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          padding: 2px 10px;
        }
        .ghostBtn {
          padding: 9px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: #f5f6f8;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ghostBtn:hover {
          border-color: rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.04);
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }
        .statCard {
          padding: 20px 22px;
          border-radius: 20px;
          background: linear-gradient(180deg, #0b0f1d 0%, #0a0e19 100%);
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .statValue {
          font-size: 26px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.01em;
          color: #ff6b1a;
          line-height: 1.2;
        }
        .statLabel {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8b93a7;
          margin-top: 6px;
        }

        .toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .select, .searchInput {
          padding: 10px 14px;
          border-radius: 12px;
          background: #05070d;
          color: #f5f6f8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .searchInput {
          min-width: 240px;
          flex: 1 1 240px;
        }
        .searchInput::placeholder {
          color: #4b5265;
        }
        .select:focus, .searchInput:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.12);
        }
        .exportBtn {
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255, 107, 26, 0.4);
          background: transparent;
          color: #ff6b1a;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .exportBtn:hover {
          background: rgba(255, 107, 26, 0.08);
          border-color: rgba(255, 107, 26, 0.6);
        }

        .tableCard {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: #080b15;
          overflow: hidden;
        }
        .tableScroll {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .th {
          text-align: left;
          padding: 14px 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8b93a7;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          white-space: nowrap;
        }
        .row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 160ms ease-out;
        }
        .row:last-child {
          border-bottom: none;
        }
        .row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .row[data-hot='true'] {
          background: rgba(255, 107, 26, 0.05);
          box-shadow: inset 2px 0 0 rgba(255, 107, 26, 0.45);
        }
        .row[data-hot='true']:hover {
          background: rgba(255, 107, 26, 0.09);
        }
        .td {
          padding: 13px 16px;
          font-size: 14px;
          color: #f5f6f8;
          vertical-align: middle;
        }
        .tdMuted {
          color: #8b93a7;
          font-size: 13px;
        }
        .tdStrong {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
        .tdWrap {
          max-width: 240px;
          white-space: normal;
          line-height: 1.4;
        }
        .nameCell {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        .badge {
          font-size: 11px;
          font-weight: 600;
          border-radius: 999px;
          padding: 2px 8px;
          line-height: 1.6;
        }
        .badgeHot {
          padding: 0;
          background: none;
        }
        .badgeDup {
          color: #ff8a8a;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.2);
        }
        .typePill {
          font-size: 12px;
          color: #8b93a7;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          padding: 3px 10px;
          white-space: nowrap;
        }
        .statusSelect {
          padding: 6px 10px;
          border-radius: 12px;
          background: #05070d;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        .statusSelect:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.12);
        }
        .status-new { color: #8b93a7; }
        .status-contacted { color: #7c90ff; }
        .status-qualified { color: #ffc048; }
        .status-won { color: #ff6b1a; }
        .status-lost { color: #ff8a8a; }
        .notesInput {
          padding: 6px 10px;
          border-radius: 12px;
          background: #05070d;
          color: #f5f6f8;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
          font-family: inherit;
          width: 160px;
          transition: border-color 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .notesInput::placeholder {
          color: #4b5265;
        }
        .notesInput:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.5);
        }
        .chatLink {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          color: #ff6b1a;
          background: rgba(255, 107, 26, 0.1);
          border: 1px solid rgba(255, 107, 26, 0.22);
          border-radius: 999px;
          padding: 5px 14px;
          text-decoration: none;
          transition: background 160ms ease-out, border-color 160ms ease-out;
        }
        .chatLink:hover {
          background: rgba(255, 107, 26, 0.18);
          border-color: rgba(255, 107, 26, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .page { animation: none; }
        }
        @media (max-width: 640px) {
          .page {
            padding: 20px 16px 32px;
          }
        }
      `}</style>
    </div>
  )
}
