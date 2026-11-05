import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import type { Order } from '../types'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Order[]>('/orders/mine').then((r) => setOrders(r.data)).catch((e) => setError(errorMessage(e)))
  }, [])

  if (error) return <Alert message={error} />
  if (!orders) return <div className="text-center py-5">Loading…</div>
  if (orders.length === 0) return <div className="text-center py-5"><h4>No orders yet</h4><Link to="/" className="btn btn-primary mt-2">Start shopping</Link></div>

  return (
    <>
      <h3 className="mb-3">My Orders</h3>
      <div className="table-responsive">
        <table className="table table-hover bg-white align-middle">
          <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th /></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="font-monospace small">{o._id.slice(-8)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>${o.totalPrice.toFixed(2)}</td>
                <td>{o.isPaid ? '✅' : '—'}</td>
                <td><span className="badge text-bg-secondary text-capitalize">{o.status}</span></td>
                <td><Link to={`/orders/${o._id}`}>Details</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
