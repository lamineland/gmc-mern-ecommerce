export default function Alert({ message, type = 'danger' }: { message: string; type?: string }) {
  if (!message) return null
  return <div className={`alert alert-${type}`} role="alert">{message}</div>
}
