import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api/client'
import Alert from '../components/Alert'
import type { Order } from '../types'

export default function OrderDetailPage() {
  const { id } = useParams()
  const placed = (useLocation().state as { placed?: boolean } | null)?.placed
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Order>(`/orders/${id}`).then((r) => setOrder(r.data)).catch((e) => setError(errorMessage(e)))
  }, [id])

  if (error) return <Alert message={error} />
  if (!order) return <div className="text-center py-5">Loading…</div>
  const a = order.shippingAddress

  return (
    <>
      {placed && <Alert type="success" message="🎉 Order confirmed! Thank you for your purchase." />}
      <h3>Order <span className="font-monospace">#{order._id.slice(-8)}</span></h3>
      <p className="text-muted">Placed {new Date(order.createdAt).toLocaleString()} · <span className="text-capitalize">{order.status}</span></p>
      <div className="row g-4">
        <div className="col-lg-8">
          <ul className="list-group mb-3">
            {order.items.map((i) => (
              <li key={i.product} className="list-group-item d-flex align-items-center gap-3">
                <img src={i.image} alt="" className="cart-thumb" />
                <Link to={`/products/${i.product}`} className="flex-grow-1 text-decoration-none">{i.name}</Link>
                <span>{i.quantity} × ${i.price.toFixed(2)}</span>
                <strong>${(i.quantity * i.price).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <div className="card"><div className="card-body">
            <h6>Shipping to</h6>
            <div>{a.fullName}<br />{a.address}<br />{a.city}, {a.postalCode}<br />{a.country}</div>
          </div></div>
        </div>
        <div className="col-lg-4">
          <div className="card"><div className="card-body">
            <div className="d-flex justify-content-between"><span>Items</span><span>${order.itemsPrice.toFixed(2)}</span></div>
            <div className="d-flex justify-content-between"><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
            <div className="d-flex justify-content-between"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
            <hr />
            <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
            <div className="mt-2 small text-muted">Payment: {order.paymentMethod.toUpperCase()} — {order.isPaid ? 'paid' : 'due on delivery'}</div>
          </div></div>
        </div>
      </div>
    </>
  )
}
