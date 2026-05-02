import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const navStyle = {
    background: '#fff',
    borderBottom: '1px solid #EDD96A',
    padding: '0 2.5rem',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    background: 'linear-gradient(135deg, #D4AF37, #F5E27A)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  }

  const logoTextStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '17px',
    fontWeight: '600',
    color: '#1A1A18',
    letterSpacing: '-0.01em',
  }

  const linkStyle = (path) => ({
    fontSize: '13px',
    fontWeight: '400',
    color: location.pathname === path ? '#D4AF37' : '#9A9A8E',
    padding: '6px 14px',
    borderRadius: '6px',
    background: location.pathname === path ? '#FFFDF0' : 'transparent',
    border: location.pathname === path ? '1px solid #EDD96A' : '1px solid transparent',
    transition: 'all 0.15s ease',
  })

  const postJobStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#fff',
    padding: '7px 18px',
    borderRadius: '7px',
    background: '#D4AF37',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>
        <div style={logoIconStyle}>✦</div>
        <span style={logoTextStyle}>AI Hiring Pipeline</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link to="/" style={linkStyle('/')}>Dashboard</Link>
        <Link to="/post-job">
          <button style={postJobStyle}>+ Post Job</button>
        </Link>
      </div>
    </nav>
  )
}
