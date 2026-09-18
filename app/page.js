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
    <div className="loginPage">
      <div className="loginGlow" aria-hidden="true" />

      <form onSubmit={handleLogin} className="loginCard">
        <div className="brand">
          <span className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandName">The Spot</div>
            <div className="brandSub">Leads Dashboard</div>
          </div>
        </div>

        <label className="field">
          <span className="fieldLabel">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="input"
          />
        </label>

        <label className="field">
          <span className="fieldLabel">Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="input"
          />
        </label>

        {error && <p className="errorText" role="alert">{error}</p>}

        <button type="submit" disabled={loading} className="submitBtn">
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <style jsx>{`
        .loginPage {
          position: relative;
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }
        .loginGlow {
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at 50% 0%, rgba(255, 107, 26, 0.07), transparent 60%);
          pointer-events: none;
        }
        .loginCard {
          position: relative;
          width: 100%;
          max-width: 360px;
          padding: 40px 36px;
          border-radius: 20px;
          background: linear-gradient(180deg, #0b0f1d 0%, #0a0e19 100%);
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow:
            0 30px 80px -30px rgba(0, 0, 0, 0.65),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          animation: rise 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .brandMark {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ff6b1a;
          box-shadow: 0 0 0 4px rgba(255, 107, 26, 0.14);
          flex-shrink: 0;
        }
        .brandName {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #f5f6f8;
          line-height: 1.2;
        }
        .brandSub {
          font-size: 12px;
          color: #8b93a7;
          margin-top: 1px;
        }
        .field {
          display: block;
          margin-bottom: 16px;
        }
        .fieldLabel {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #8b93a7;
          margin-bottom: 7px;
          letter-spacing: 0.01em;
        }
        .input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #05070d;
          color: #f5f6f8;
          font-size: 16px;
          font-family: inherit;
          transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .input::placeholder {
          color: #4b5265;
        }
        .input:focus {
          outline: none;
          border-color: rgba(255, 107, 26, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.12);
        }
        .errorText {
          font-size: 13px;
          color: #ff8a8a;
          background: rgba(255, 107, 107, 0.08);
          border: 1px solid rgba(255, 107, 107, 0.18);
          border-radius: 10px;
          padding: 9px 12px;
          margin: 4px 0 16px;
        }
        .submitBtn {
          width: 100%;
          padding: 13px;
          border-radius: 999px;
          border: none;
          background: #ff6b1a;
          color: #050810;
          font-weight: 700;
          font-size: 15px;
          font-family: inherit;
          cursor: pointer;
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), filter 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms;
        }
        .submitBtn:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }
        .submitBtn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .submitBtn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        @keyframes rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loginCard { animation: none; }
        }
      `}</style>
    </div>
  )
}
