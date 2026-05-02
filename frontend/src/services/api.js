import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000'
})

export const createJob = (data) => API.post('/jobs/create', data)
export const applyToJob = (jobId, formData) => API.post(`/jobs/${jobId}/apply`, formData)
export const processJob = (jobId) => API.post(`/jobs/${jobId}/process`)
export const getCandidates = (jobId) => API.get(`/jobs/${jobId}/candidates`)
export const getDashboardStats = () => API.get('/dashboard/stats')
export const analyzeBias = (jobId) => API.post(`/jobs/${jobId}/analyze-bias`)
export const getSkillGap = (candidateId) => API.get(`/candidates/${candidateId}/skill-gap`)