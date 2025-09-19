import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import SweetList from './SweetList';
import AdminSweets from './AdminSweets'; // Import AdminSweets
import './App.css';

// Auth Context
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // { id, role }

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Basic JWT decode
        setUser(decoded.user);
      } catch (e) {
        console.error("Failed to decode token", e);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Components
const Home = () => {
  const { user } = useContext(AuthContext);
  return (
    <div>
      <h1>Welcome to Sweet Shop!</h1>
      {user ? (
        <p>Hello, {user.id} ({user.role})</p>
      ) : (
        <p>Please log in or register.</p>
      )}
    </div>
  );
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const url = `/api/auth/${isRegister ? 'register' : 'login'}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role: isRegister ? 'customer' : undefined }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isRegister) {
          login(data.token);
          navigate('/');
        }
        else {
          setMessage('Registration successful! Please log in.');
          setIsRegister(false);
        }
      }
      else {
        setMessage(data.msg || 'An error occurred');
      }
    }
    catch (error) {
      setMessage('Network error');
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p>{message}</p>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {user && <Link to="/sweets">Sweets</Link>}
      {user && user.role === 'admin' && <Link to="/admin/sweets">Manage Sweets</Link>}
      {!user ? (
        <Link to="/login">Login/Register</Link>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/sweets"
              element={
                <PrivateRoute>
                  <SweetList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sweets"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminSweets />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;