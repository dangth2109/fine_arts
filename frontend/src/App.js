import { Routes, Route } from 'react-router-dom';
import NavbarComponent from './components/Navbar';
import MainLayout from './components/MainLayout';
import ExhibitionsPage from './components/ExhibitionsPage';
import CompetitionsPage from './components/CompetitionsPage';
import ExhibitionDetail from './components/ExhibitionDetail';
import CompetitionDetail from './components/CompetitionDetail';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Manager from './pages/Manager';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <NavbarComponent />
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/exhibitions" element={<ExhibitionsPage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/exhibitions/:id" element={<ExhibitionDetail />} />
          <Route path="/competitions/:id" element={<CompetitionDetail />} />
          <Route path="/manager" element={<Manager />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
