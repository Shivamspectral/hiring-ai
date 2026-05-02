import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const pageStyle = {
    padding: '2.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  }

  const headingStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: '600',
    color: '#1A1A18',
    marginBottom: '4px',
  }

  const subStyle = {
    fontSize: '14px',
    color: '#9A9A8E',
    marginBottom: '2rem',
  }

  const statCard = (value, label, highlight = false) => ({
    background: highlight ? 'linear-gradient(135deg, #D4AF37, #F0D060)' : '#fff',
    border: highlight ? 'none' : '1px solid #EDD96A',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  })

  const statValue = (highlight) => ({
    fontSize: '32px',
    fontWeight: '500',
    fontFamily: "'Playfair Display', serif",
    color: highlight ? '#fff' : '#1A1A18',
  })

  const statLabel = (highlight) => ({
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.07em',
    color: highlight ? 'rgba(255,255,255,0.85)' : '#D4AF37',
    textTransform: 'uppercase',
  })

  const sectionCard = {
    background: '#fff',
    border: '1px solid #EDD96A',
    borderRadius: '14px',
    padding: '24px',
    marginTop: '1.5rem',
  }

  const jobRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid #F5ECC4',
    cursor: 'pointer',
  }

  const viewBtn = {
    background: '#D4AF37',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  }

  const pillStyle = {
    background: '#FFFDF0',
    color: '#B8942A',
    border: '1px solid #EDD96A',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '500',
  }

  if (loading) return (
    <div style={{ ...pageStyle, textAlign: 'center', paddingTop: '5rem' }}>
      <div style={{ color: '#D4AF37', fontSize: '14px' }}>Loading dashboard...</div>
    </div>
  )

  const cards = [
    { value: stats?.total_jobs || 0, label: 'Total Jobs', highlight: false },
    { value: stats?.total_candidates || 0, label: 'Candidates', highlight: false },
    { value: stats?.status_breakdown?.shortlisted || 0, label: 'Shortlisted', highlight: true },
    { value: `${stats?.average_match_score || 0}%`, label: 'Avg Match Score', highlight: false },
  ]

  return (
    <div style={pageStyle}>
      <div style={headingStyle}>Dashboard</div>
      <div style={subStyle}>Overview of your hiring pipeline</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {cards.map((c, i) => (
          <div key={i} style={statCard(c.value, c.label, c.highlight)}>
            <div style={statLabel(c.highlight)}>{c.label}</div>
            <div style={statValue(c.highlight)}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={sectionCard}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#1A1A18', marginBottom: '4px' }}>Recent Jobs</div>
        <div style={{ fontSize: '12px', color: '#9A9A8E', marginBottom: '16px' }}>Click a job to view its candidates</div>

        {(!stats?.recent_jobs || stats.recent_jobs.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#9A9A8E', fontSize: '14px' }}>
            No jobs yet.{' '}
            <span
              onClick={() => navigate('/post-job')}
              style={{ color: '#D4AF37', cursor: 'pointer', fontWeight: '500' }}
            >
              Post your first job →
            </span>
          </div>
        ) : (
          stats.recent_jobs.map((job, i) => (
            <div
              key={job.id}
              style={{ ...jobRow, borderBottom: i === stats.recent_jobs.length - 1 ? 'none' : '1px solid #F5ECC4' }}
              onClick={() => navigate(`/jobs/${job.id}/candidates`)}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18', marginBottom: '3px' }}>{job.title}</div>
                <div style={{ fontSize: '11px', color: '#9A9A8E' }}>{new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={pillStyle}>View candidates</span>
                <button style={viewBtn}>Open →</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', padding: '20px 24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '10px' }}>Candidate Status</div>
          {[
            { label: 'Shortlisted', value: stats?.status_breakdown?.shortlisted || 0, color: '#D4AF37' },
            { label: 'Needs Review', value: stats?.status_breakdown?.review || 0, color: '#9A9A8E' },
            { label: 'Rejected', value: stats?.status_breakdown?.rejected || 0, color: '#E8D5D5' },
            { label: 'Pending', value: stats?.status_breakdown?.pending || 0, color: '#F5ECC4' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid #F9F5E4' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: '13px', color: '#3A3A35' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', marginBottom: '10px' }}>Quick Actions</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#fff', lineHeight: 1.3 }}>Ready to find your next great hire?</div>
          </div>
          <button
            onClick={() => navigate('/post-job')}
            style={{ marginTop: '20px', background: '#fff', color: '#B8942A', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            + Post a New Job
          </button>
        </div>
      </div>
    </div>
  )
}
