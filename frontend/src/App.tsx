import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Register } from './pages/Register';
import { SubmitWaste } from './pages/SubmitWaste';
import { Incentives } from './pages/Incentives';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit" element={<SubmitWaste />} />
          <Route path="/incentives" element={<Incentives />} />
        </Routes>
      </main>
    </div>
  );
}
