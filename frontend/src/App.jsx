import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PostJob from './pages/PostJobs'
import Candidates from './pages/Candidates'
import CandidateDetail from './pages/CandidateDetail'
import PipelineRunner from './pages/PipelineRunner'
import Navbar from './components/Navbar'

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/jobs/:jobId/candidates" element={<Candidates />} />
        <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
        <Route path="/jobs/:jobId/pipeline" element={<PipelineRunner />} />
      </Routes>
    </div>
  )
}

export default App