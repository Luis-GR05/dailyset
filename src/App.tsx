import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './paginas/LandingPage';
import LoginPage from './paginas/Login';
import DashboardPage from './paginas/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;