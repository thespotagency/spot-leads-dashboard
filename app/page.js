'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Login failed. Check email/password.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center' }}>
      <form onSubmit={handleLogin} style={{ width: 320, padding: 32, background:'#131a2b', borderRadius: 12, border:'1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ fontSize: 20, marginBottom: 24 }}>The Spot — Leads</h1>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required
          style={{ width:'100%', padding:10, marginBottom:12, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'#0a0e17', color:'#fff' }} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required
          style={{ width:'100%', padding:10, marginBottom:16, borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', background:'#0a0e17', color:'#fff' }} />
        {error && <p style={{ color:'#ff6b6b', fontSize:13, marginBottom:12 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:10, borderRadius:8, border:'none', background:'#FF6B1A', color:'#fff', fontWeight:600, cursor:'pointer' }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}