import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import ScanCVPage from './pages/ScanCVPage'
import SelfAssessmentPage from './pages/SelfAssessmentPage'
import ManualSkillCheckPage from './pages/ManualSkillCheckPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan-cv" element={<ScanCVPage />} />
          <Route path="/self-assessment" element={<SelfAssessmentPage />} />
          <Route path="/manual-input" element={<ManualSkillCheckPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
