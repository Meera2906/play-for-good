import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Charities from './pages/Charities';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import Scores from './pages/dashboard/Scores';
import Charity from './pages/dashboard/Charity';
import Draws from './pages/dashboard/Draws';
import Winnings from './pages/dashboard/Winnings';
import Subscription from './pages/dashboard/Subscription';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/Users';
import AdminCharities from './pages/admin/Charities';
import AdminDraws from './pages/admin/Draws';
import AdminWinners from './pages/admin/Winners';
import AdminAnalytics from './pages/admin/Analytics';
import Leaderboard from './pages/Leaderboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary gap-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Synchronizing Identity...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="scores" element={<Scores />} />
            <Route path="charity" element={<Charity />} />
            <Route path="draws" element={<Draws />} />
            <Route path="winnings" element={<Winnings />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="draws" element={<AdminDraws />} />
            <Route path="winners" element={<AdminWinners />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Routes>
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
