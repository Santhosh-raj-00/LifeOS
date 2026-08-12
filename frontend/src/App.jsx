import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { REGISTER_SW } from './utils/notificationService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules';
import TaskMonitor from './pages/TaskMonitor';
import CalendarView from './pages/CalendarView';
import JournalEditor from './pages/JournalEditor';
import HabitHub from './pages/HabitHub';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pb-16">
        {children}
      </main>
    </div>
  );
};

function App() {
  useEffect(() => {
    REGISTER_SW();
  }, []);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedules" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Schedules />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TaskMonitor />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CalendarView />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/journal" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <JournalEditor />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/habits" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HabitHub />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Stats />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
