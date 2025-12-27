import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useContext } from 'react';
import { LoginForm } from './pages/Auth/LoginForm';
import { SignUpForm } from './pages/Auth/SignUpForm';
import { CreatePoll } from './pages/Dashboard/CreatePoll';
import { Home } from './pages/Dashboard/Home';
import { PollList } from './pages/Dashboard/MyPolls.jsx';
import { VotedPolls } from './pages/Dashboard/VotedPolls';
import { PollStats } from './pages/Dashboard/PollStats';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import ProfilePage from './pages/Dashboard/Profile.jsx';
import Profile from './pages/Dashboard/Profile.jsx';
import ViewPolls from './pages/Dashboard/ViewPolls.jsx';
import { Rooms } from './pages/Dashboard/Rooms.jsx';
import { RoomDetail } from './pages/Dashboard/RoomDetail.jsx';
import { RoomVoting } from './pages/Dashboard/RoomVoting.jsx';
import { RoomPollResults } from './pages/Dashboard/RoomPollResults.jsx';
import { JoinRoom } from './pages/Dashboard/JoinRoom.jsx';
import NotificationCenter from './components/NotificationCenter.jsx';

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour rediriger les utilisateurs authentifiés des pages publiques
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/Home" replace />;
  }

  return children;
};

// Composant principal avec les routes
const AppRoutes = () => {
  return (
    <>
      <NotificationCenter />
      <Routes>
      {/* Routes publiques - redirigent vers /Home si déjà connecté */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } 
      />
      <Route 
        path="/SignUpForm" 
        element={
          <PublicRoute>
            <SignUpForm />
          </PublicRoute>
        } 
      />

      {/* Routes protégées - nécessitent une authentification */}
      <Route 
        path="/Home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/CreatePoll" 
        element={
          <ProtectedRoute>
            <CreatePoll />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/MyPolls" 
        element={
          <ProtectedRoute>
            <PollList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/VotedPolls" 
        element={
          <ProtectedRoute>
            <VotedPolls />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/Profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/view-polls" 
        element={
        <ProtectedRoute>
        <ViewPolls />
        </ProtectedRoute>
      } />

      <Route 
        path="/rooms" 
        element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/rooms/:roomId" 
        element={
          <ProtectedRoute>
            <RoomDetail />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/rooms/:roomId/poll/:pollId" 
        element={
          <ProtectedRoute>
            <RoomVoting />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/rooms/:roomId/poll/:pollId/results" 
        element={
          <ProtectedRoute>
            <RoomPollResults />
          </ProtectedRoute>
        }
      />

      <Route 
        path="/poll-stats/:pollId" 
        element={
          <ProtectedRoute>
            <PollStats />
          </ProtectedRoute>
        }
      />

      {/* Route par défaut - redirige vers login ou Home selon l'authentification */}
      <Route path="/" element={<Root />} />
      
      {/* Route 404 - page non trouvée */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

// Composant Root pour la redirection initiale
const Root = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-yellow-500 text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/Home" replace /> : <Navigate to="/login" replace />;
};

// Page 404
const NotFound = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400 rounded-full opacity-25 blur-3xl"></div>
      
      <div className="relative z-10 text-center p-8">
        <h1 className="text-9xl font-bold text-yellow-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-yellow-100 mb-4">Page Not Found</h2>
        <p className="text-yellow-100/60 mb-8">The page you're looking for doesn't exist.</p>
        <a 
          href={user ? "/Home" : "/login"}
          className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-400 hover:via-yellow-500 hover:to-amber-500 text-black font-bold rounded-xl shadow-2xl shadow-yellow-600/40 transform hover:scale-105 transition-all duration-300"
        >
          {user ? "Go to Home" : "Go to Login"}
        </a>
      </div>
    </div>
  );
};

// Composant App principal
const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;