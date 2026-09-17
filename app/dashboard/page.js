'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState([])
  const [filter, setFilter] = useState('all')
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

  const filtered = filter === 'all' ? leads : leads.filter(l => l.business_type === filter)
  const types = [...new Set(leads.map(l => l.business_type))]

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize: 22 }}>Leads ({filtered.length})</h1>
        <button onClick={handleLogout} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', cursor:'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 8, background:'#131a2b', color:'#fff', border:'1px solid rgba(255,255,255,0.15)' }}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
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
              <th style={{ padding: 10 }}>Message</th>
              <th style={{ padding: 10 }}>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: 10 }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: 10 }}>{l.name}</td>
                <td style={{ padding: 10 }}>{l.phone}</td>
                <td style={{ padding: 10 }}>{l.business_name}</td>
                <td style={{ padding: 10 }}>{l.business_type}</td>
                <td style={{ padding: 10 }}>{l.monthly_budget}</td>
                <td style={{ padding: 10 }}>{l.message || '-'}</td>
                <td style={{ padding: 10 }}>
                  <a href={`https://wa.me/${l.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color:'#FF6B1A' }}>Chat</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}