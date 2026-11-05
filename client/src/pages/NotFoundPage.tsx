import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <div className="text-center py-5"><h2>404</h2><p>Page not found.</p><Link to="/" className="btn btn-primary">Home</Link></div>
}
