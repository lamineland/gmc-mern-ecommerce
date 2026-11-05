import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [info, setInfo] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(''); setInfo(''); setResetUrl('')
    try {
      const { data } = await api.post<{ message: string; resetUrl?: string }>('/auth/forgot-password', { email })
      setInfo(data.message)
      if (data.resetUrl) setResetUrl(new URL(data.resetUrl).pathname)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="row justify-content-center"><div className="col-md-5 col-lg-4">
      <h3 className="mb-3">Forgot password</h3>
      <Alert message={error} />
      <Alert type="success" message={info} />
      {resetUrl && (
        <Alert type="info" message="Dev mode (no email service configured): use the link below.">
        </Alert>
      )}
      {resetUrl && <p><Link to={resetUrl}>Reset my password →</Link></p>}
      <form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Email</label>
          <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn btn-primary w-100">Send reset link</button>
      </form>
      <p className="mt-3 small"><Link to="/login">Back to login</Link></p>
    </div></div>
  )
}
