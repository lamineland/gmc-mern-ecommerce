import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'
import type { User } from '../types'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match')
    try {
      const { data } = await api.post<{ token: string; user: User }>(`/auth/reset-password/${token}`, { password })
      setSession(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="row justify-content-center"><div className="col-md-5 col-lg-4">
      <h3 className="mb-3">Reset password</h3>
      <Alert message={error} />
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">New password</label>
          <input type="password" className="form-control" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div className="mb-3"><label className="form-label">Confirm password</label>
          <input type="password" className="form-control" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        <button className="btn btn-primary w-100">Update password</button>
      </form>
    </div></div>
  )
}
