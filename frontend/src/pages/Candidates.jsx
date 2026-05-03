import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCandidates, applyToJob, processJob } from '../services/api'

export default function Candidates() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [pipelineResult, setPipelineResult] = useState(null)

  const fetchCandidates = () => {
    getCandidates(jobId)
      .then(res => setCandidates(res.data.candidates))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCandidates() }, [jobId])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    let successCount = 0
    for (const file of files) {
      const formData = new FormData()
      formData.append('resume', file)
      try {
        await applyToJob(jobId, formData)
        successCount++
      } catch (err) {
        console.error(`Failed to upload ${file.name}`)
      }
    }
    alert(`✅ ${successCount}/${files.length} resumes uploaded successfully!`)
    fetchCandidates()
    setUploading(false)
  }

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const res = await processJob(jobId)
      setPipelineResult(res.data)
      fetchCandidates()
    } catch (err) {
      alert('Failed to run pipeline')
    } finally {
      setProcessing(false)
    }
  }

  const getScoreBadge = (score) => {
    if (score >= 75) return { bg: '#D4AF37', color: '#fff' }
    if (score >= 40) return { bg: '#FFFDF0', color: '#B8942A', border: '1px solid #EDD96A' }
    return { bg: '#F8F8F6', color: '#9A9A8E', border: '1px solid #EBEBEB' }
  }

  const getStatusStyle = (status) => {
    const map = {
      shortlisted: { bg: '#FFFDF0', color: '#B8942A', border: '1px solid #EDD96A' },
      rejected: { bg: '#FDF2F2', color: '#C0392B', border: '1px solid #F5C6C6' },
      review: { bg: '#F8F8F6', color: '#9A9A8E', border: '1px solid #EBEBEB' },
      pending: { bg: '#F8F8F6', color: '#9A9A8E', border: '1px solid #EBEBEB' },
    }
    return map[status] || map.pending
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1A1A18', marginBottom: '4px' }}>Candidates</div>
          <div style={{ fontSize: '12px', color: '#9A9A8E', fontFamily: 'monospace' }}>Job ID: {jobId}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <label style={{
            background: uploading ? '#E8D5A0' : '#D4AF37',
            color: '#fff', borderRadius: '8px', padding: '10px 18px',
            cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500'
          }}>
            {uploading ? '⏳ Uploading...' : '📄 Upload Resume'}
            <input type="file" accept=".pdf,.txt,.docx" multiple onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <button
            onClick={handleProcess}
            disabled={processing || candidates.length === 0}
            style={{
              background: processing ? '#F8F8F6' : '#1A1A18',
              color: processing ? '#9A9A8E' : '#fff',
              border: 'none', borderRadius: '8px',
              padding: '10px 18px', cursor: processing ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500'
            }}
          >
            {processing ? '⏳ Screening Candidates...' : '✦ Start AI Screening'}
          </button>
        </div>
      </div>

      {pipelineResult && (
        <div style={{ background: '#FFFDF0', border: '1px solid #EDD96A', borderRadius: '12px', padding: '20px 24px', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: '#B8942A', marginBottom: '12px' }}>✦ Screening Complete</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
            {[
              { label: 'Shortlisted', value: pipelineResult.shortlisted },
              { label: 'Rejected', value: pipelineResult.rejected },
              { label: 'Needs Review', value: pipelineResult.needs_review },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #F5ECC4', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '500', color: '#1A1A18' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#D4AF37', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #F5ECC4', paddingTop: '12px' }}>
            {pipelineResult.actions_log?.map((action, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#3A3A35', padding: '3px 0' }}>{action}</div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#D4AF37' }}>Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18', marginBottom: '6px' }}>No candidates yet</div>
          <div style={{ fontSize: '13px', color: '#9A9A8E' }}>Upload some PDF resumes to get started</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #F5ECC4', background: '#FFFDF0', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Candidate</span>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Score</span>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</span>
          </div>
          {candidates.map((c, i) => {
            const scoreBadge = getScoreBadge(c.match_score)
            const statusStyle = getStatusStyle(c.status)
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/candidates/${c.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', alignItems: 'center',
                  padding: '16px 24px', borderBottom: i < candidates.length - 1 ? '1px solid #F9F5E4' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFFDF0'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A18', marginBottom: '3px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#9A9A8E' }}>{c.email}</div>
                </div>
                <div style={{
                  background: scoreBadge.bg, color: scoreBadge.color, border: scoreBadge.border || 'none',
                  borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '500', minWidth: '52px', textAlign: 'center'
                }}>
                  {c.match_score}%
                </div>
                <div style={{
                  background: statusStyle.bg, color: statusStyle.color, border: statusStyle.border,
                  borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize', minWidth: '80px', textAlign: 'center'
                }}>
                  {c.status}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
