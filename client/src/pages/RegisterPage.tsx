import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err)); setBusy(false)
    }
  }

  return (
    <div className="row justify-content-center"><div className="col-md-5 col-lg-4">
      <h3 className="mb-3">Create account</h3>
      <Alert message={error} />
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Name</label>
          <input className="form-control" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Email</label>
          <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Password</label>
          <input type="password" className="form-control" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="form-text">At least 6 characters.</div></div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="mt-3 small">Already have an account? <Link to="/login">Login</Link></p>
    </div></div>
  )
}
