import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './i18n.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NewProject from './pages/NewProject'
import Results from './pages/Results'
import ReviewSuccess from './pages/ReviewSuccess'
import Pricing from './pages/Pricing'
import PaymentSuccess from './pages/PaymentSuccess'
import Impact from './pages/Impact'
import Investors from './pages/Investors'

const MobileStyles = () => (
  <style>{`
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      nav { padding: 0 12px !important; }
      nav button { padding: 4px 8px !important; font-size: 11px !important; }
      nav img { height: 20px !important; }
    }
  `}</style>
)

export default function App() {
  return (
    <LangProvider>
    <AuthProvider>
      <MobileStyles />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/landing" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/projects/:id/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/projects/:id/review/success" element={<ProtectedRoute><ReviewSuccess /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LangProvider>
  )
}
