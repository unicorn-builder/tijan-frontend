import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import NewProject from './pages/NewProject'
import Results from './pages/Results'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/projects/:id/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}
