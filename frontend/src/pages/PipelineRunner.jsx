import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { processJob, analyzeBias } from '../services/api'

export default function PipelineRunner() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [biasResult, setBiasResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [biasLoading, setBiasLoading] = useState(false)

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await processJob(jobId)
      setResult(res.data)
    } catch (err) {
      alert('Failed to run pipeline')
    } finally {
      setLoading(false)
    }
  }

  const handleBias = async () => {
    setBiasLoading(true)
    try {
      const res = await analyzeBias(jobId)
      setBiasResult(res.data)
    } catch (err) {
      alert('Failed to analyze bias')
    } finally {
      setBiasLoading(false)
    }
  }

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#9A9A8E', fontSize: '13px', cursor: 'pointer', marginBottom: '1.5rem' }}>
        ← Back
      </button>

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1A1A18', marginBottom: '4px' }}>Pipeline Runner</div>
      <div style={{ fontSize: '12px', color: '#9A9A8E', fontFamily: 'monospace', marginBottom: '2rem' }}>Job ID: {jobId}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '2rem' }}>
        <button onClick={handleRun} disabled={loading} style={{
          background: loading ? '#E8D5A0' : '#D4AF37', color: '#fff', border: 'none',
          borderRadius: '10px', padding: '18px', fontSize: '14px', fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>✦</div>
          <div>{loading ? 'Running Pipeline...' : 'Run AI Pipeline'}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Shortlist, reject & email candidates</div>
        </button>

        <button onClick={handleBias} disabled={biasLoading} style={{
          background: biasLoading ? '#F8F8F6' : '#1A1A18', color: biasLoading ? '#9A9A8E' : '#fff',
          border: 'none', borderRadius: '10px', padding: '18px', fontSize: '14px', fontWeight: '500',
          cursor: biasLoading ? 'not-allowed' : 'pointer', textAlign: 'left'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚖</div>
          <div>{biasLoading ? 'Analyzing...' : 'Analyze JD Bias'}</div>
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Detect exclusionary language</div>
        </button>
      </div>

      {result && (
        <div style={{ background: '#FFFDF0', border: '1px solid #EDD96A', borderRadius: '14px', padding: '24px', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#B8942A', marginBottom: '16px' }}>✦ Pipeline Complete</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Total', value: result.total_candidates },
              { label: 'Shortlisted', value: result.shortlisted },
              { label: 'Rejected', value: result.rejected },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #F5ECC4', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#1A1A18' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#D4AF37', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #F5ECC4', paddingTop: '14px' }}>
            {result.actions_log?.map((a, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#3A3A35', padding: '3px 0' }}>{a}</div>
            ))}
          </div>
        </div>
      )}

      {biasResult && (
        <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: '600', color: '#1A1A18', marginBottom: '16px' }}>Bias Analysis</div>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              background: biasResult.bias_level === 'LOW' ? '#FFFDF0' : biasResult.bias_level === 'MEDIUM' ? '#FFF8E6' : '#FDF2F2',
              border: `1px solid ${biasResult.bias_level === 'LOW' ? '#EDD96A' : biasResult.bias_level === 'MEDIUM' ? '#F5D58A' : '#F5C6C6'}`,
              borderRadius: '10px', padding: '16px 20px', flex: 1, textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#9A9A8E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Bias Level</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: '#1A1A18' }}>{biasResult.bias_level}</div>
              <div style={{ fontSize: '12px', color: '#9A9A8E', marginTop: '4px' }}>Score: {biasResult.bias_score}/100</div>
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#3A3A35', lineHeight: '1.6', marginBottom: '16px', padding: '14px', background: '#FFFDF0', borderRadius: '8px', border: '1px solid #F5ECC4' }}>
            {biasResult.summary}
          </div>

          {biasResult.suggestions?.slice(0, 3).map((s, i) => (
            <div key={i} style={{ border: '1px solid #F5ECC4', borderRadius: '10px', padding: '14px 18px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', color: '#C0392B', marginBottom: '6px' }}>✗ {s.original}</div>
              <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '6px' }}>✓ {s.replacement}</div>
              <div style={{ fontSize: '11px', color: '#9A9A8E' }}>{s.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
