import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
    <div className="text-center">
      <div className="spinner mx-auto mb-4" />
      <p style={{ color: '#64748b' }}>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
