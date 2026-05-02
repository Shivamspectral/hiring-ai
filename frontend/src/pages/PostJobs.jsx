import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../services/api'

export default function PostJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!title || !description) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      const res = await createJob({ title, description })
      navigate(`/jobs/${res.data.job_id}/candidates`)
    } catch (err) {
      setError('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1A1A18', marginBottom: '4px' }}>Post a New Job</div>
      <div style={{ fontSize: '14px', color: '#9A9A8E', marginBottom: '2rem' }}>Let AI find the best candidates for your role</div>

      <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', padding: '32px' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '8px' }}>Job Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Python Backend Developer"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #EDD96A',
              fontSize: '14px',
              color: '#1A1A18',
              background: '#FFFDF0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '8px' }}>Job Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the role, required skills, experience level, responsibilities..."
            rows={8}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #EDD96A',
              fontSize: '14px',
              color: '#1A1A18',
              background: '#FFFDF0',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.6',
            }}
          />
        </div>

        {error && (
          <div style={{ color: '#c0392b', fontSize: '13px', marginBottom: '1rem', padding: '10px 14px', background: '#fdf2f2', borderRadius: '8px', border: '1px solid #f5c6c6' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              background: loading ? '#E8D5A0' : '#D4AF37',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '13px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Creating Job...' : '✦ Create Job'}
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#fff',
              color: '#9A9A8E',
              border: '1px solid #EBEBEB',
              borderRadius: '8px',
              padding: '13px 20px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', background: '#FFFDF0', border: '1px solid #F5ECC4', borderRadius: '10px', padding: '16px 20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '0.07em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: '8px' }}>Tips for better results</div>
        {['Include specific required skills (e.g. Python, FastAPI, PostgreSQL)', 'Mention years of experience required', 'List key responsibilities clearly', 'Add any preferred skills or nice-to-haves'].map((tip, i) => (
          <div key={i} style={{ fontSize: '13px', color: '#3A3A35', padding: '4px 0', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#D4AF37' }}>✦</span> {tip}
          </div>
        ))}
      </div>
    </div>
  )
}
