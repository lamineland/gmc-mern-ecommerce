import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🛍️ MERN Shop</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink className="nav-link" to="/" end>Shop</NavLink></li>
            {user && <li className="nav-item"><NavLink className="nav-link" to="/orders">My Orders</NavLink></li>}
          </ul>
          <ul className="navbar-nav align-items-md-center gap-md-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/cart">
                🛒 Cart {count > 0 && <span className="badge bg-warning text-dark">{count}</span>}
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item"><span className="navbar-text">Hi, {user.name}</span></li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => { logout(); navigate('/') }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
                <li className="nav-item"><Link className="btn btn-warning btn-sm" to="/register">Sign up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
