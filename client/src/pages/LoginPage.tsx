import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err)); setBusy(false)
    }
  }

  return (
    <div className="row justify-content-center"><div className="col-md-5 col-lg-4">
      <h3 className="mb-3">Login</h3>
      <Alert message={error} />
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Email</label>
          <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Password</label>
          <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
      </form>
      <div className="mt-3 small d-flex justify-content-between">
        <Link to="/forgot-password">Forgot password?</Link>
        <span>New here? <Link to="/register">Create account</Link></span>
      </div>
    </div></div>
  )
}
