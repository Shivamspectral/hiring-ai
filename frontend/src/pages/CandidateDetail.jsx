import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSkillGap } from '../services/api'

export default function CandidateDetail() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [skillGap, setSkillGap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSkillGap(candidateId)
      .then(res => setSkillGap(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [candidateId])

  const priorityStyle = (p) => ({
    HIGH: { bg: '#FDF2F2', color: '#C0392B', border: '1px solid #F5C6C6' },
    MEDIUM: { bg: '#FFFDF0', color: '#B8942A', border: '1px solid #EDD96A' },
    LOW: { bg: '#F8F8F6', color: '#9A9A8E', border: '1px solid #EBEBEB' },
  })[p] || {}

  if (loading) return <div style={{ padding: '2.5rem', textAlign: 'center', color: '#D4AF37' }}>Loading candidate details...</div>

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#9A9A8E', fontSize: '13px', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ← Back
      </button>

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: '#1A1A18', marginBottom: '4px' }}>Skill Gap Analysis</div>
      <div style={{ fontSize: '14px', color: '#9A9A8E', marginBottom: '2rem' }}>Personalized learning roadmap for this candidate</div>

      {skillGap && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #D4AF37, #F0D060)', borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Total Gaps</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: '600', color: '#fff' }}>{skillGap.gap_count}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '12px', padding: '20px 24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Est. Learning Time</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: '600', color: '#1A1A18' }}>{skillGap.estimated_total_weeks}<span style={{ fontSize: '16px', fontWeight: '400', color: '#9A9A8E' }}> wks</span></div>
            </div>
          </div>

          <div style={{ background: '#FFFDF0', border: '1px solid #EDD96A', borderRadius: '12px', padding: '18px 22px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Learning Path Summary</div>
            <div style={{ fontSize: '14px', color: '#3A3A35', lineHeight: '1.6' }}>{skillGap.learning_path_summary}</div>
          </div>

          {skillGap.gap_count === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '14px', padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A18' }}>Strong match — no significant skill gaps!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {skillGap.gaps?.map((gap, i) => {
                const ps = priorityStyle(gap.priority)
                return (
                  <div key={i} style={{ background: '#fff', border: '1px solid #EDD96A', borderRadius: '12px', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '500', color: '#1A1A18' }}>{gap.skill}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: '#FFFDF0', color: '#B8942A', border: '1px solid #EDD96A', borderRadius: '20px', padding: '3px 10px', fontSize: '11px' }}>{gap.gap_type}</span>
                        <span style={{ background: ps.bg, color: ps.color, border: ps.border, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '500' }}>{gap.priority}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#9A9A8E', marginBottom: '12px' }}>{gap.why_important}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F5ECC4', paddingTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#D4AF37', fontWeight: '500' }}>⏱ {gap.estimated_weeks} weeks to learn</div>
                      {gap.free_resources?.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#9A9A8E' }}>{gap.free_resources[0]}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
