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

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize: 22 }}>Leads ({filtered.length})</h1>
        <button onClick={handleLogout} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ padding:'12px 18px', borderRadius:10, background:'#131a2b', border:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'#FF6B1A' }}>{todayCount}</div>
          <div style={{ fontSize:11, opacity:0.6 }}>Today</div>
        </div>
        <div style={{ padding:'12px 18px', borderRadius:10, background:'#131a2b', border:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'#FF6B1A' }}>{weekCount}</div>
          <div style={{ fontSize:11, opacity:0.6 }}>This Week</div>
        </div>
        <div style={{ padding:'12px 18px', borderRadius:10, background:'#131a2b', border:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize:20, fontWeight:700, color:'#FF6B1A' }}>{conversionRate}%</div>
          <div style={{ fontSize:11, opacity:0.6 }}>Conversion (Won)</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom: 16, flexWrap:'wrap' }}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 8, background:'#131a2b', color:'#fff', border:'1px solid rgba(255,255,255,0.15)' }}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Search name, phone, business..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 8, background:'#131a2b', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', minWidth:220 }} />
        <button onClick={exportCSV}
          style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(255,107,26,0.4)', background:'transparent', color:'#FF6B1A', cursor:'pointer' }}>
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.15)' }}>
              <th style={{ padding: 10 }}>Date</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Phone</th>
              <th style={{ padding: 10 }}>Business</th>
              <th style={{ padding: 10 }}>Type</th>
              <th style={{ padding: 10 }}>Budget</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Message</th>
              <th style={{ padding: 10 }}>Notes</th>
              <th style={{ padding: 10 }}>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const isHot = l.monthly_budget === '1,00,000+'
              const isDup = phoneCounts[(l.phone || '').replace(/\D/g, '')] > 1
              return (
              <tr key={l.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background: isHot ? 'rgba(255,107,26,0.06)' : 'transparent' }}>
                <td style={{ padding: 10 }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: 10 }}>
                  {l.name}
                  {isHot && <span title="High budget lead" style={{ marginLeft:6 }}>🔥</span>}
                  {isDup && <span title="Duplicate phone number" style={{ marginLeft:6, color:'#ff6b6b' }}>⚠</span>}
                </td>
                <td style={{ padding: 10 }}>{l.phone}</td>
                <td style={{ padding: 10 }}>{l.business_name}</td>
                <td style={{ padding: 10 }}>{l.business_type}</td>
                <td style={{ padding: 10 }}>{l.monthly_budget}</td>
                <td style={{ padding: 10 }}>
                  <select value={l.status || 'New'} onChange={e=>updateStatus(l.id, e.target.value)}
                    style={{ padding:6, borderRadius:6, background:'#0a0e17', color:'#fff', border:'1px solid rgba(255,255,255,0.15)' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: 10 }}>{l.message || '-'}</td>
                <td style={{ padding: 10 }}>
                  <input defaultValue={l.notes || ''} placeholder="Add note..."
                    onBlur={e => { if (e.target.value !== (l.notes || '')) updateNotes(l.id, e.target.value) }}
                    style={{ padding:6, borderRadius:6, background:'#0a0e17', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', width:140 }} />
                </td>
                <td style={{ padding: 10 }}>
                  <a href={`https://wa.me/${l.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color:'#FF6B1A' }}>Chat</a>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}