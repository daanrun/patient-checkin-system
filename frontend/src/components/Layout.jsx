import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="flex justify-between items-center">
            <div>
              <h1>Patient Check-in System</h1>
              <p>Complete your appointment check-in online</p>
            </div>
            <nav className="admin-nav">
              {isAdminPage ? (
                <Link 
                  to="/demographics" 
                  className="text-white hover:text-blue-200 underline"
                >
                  ← Back to Patient Check-in
                </Link>
              ) : (
                <Link 
                  to="/admin" 
                  className="text-white hover:text-blue-200 underline"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2025 Healthcare Facility. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Layout