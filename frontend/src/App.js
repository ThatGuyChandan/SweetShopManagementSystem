import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import SweetList from './SweetList';
import AdminSweets from './AdminSweets'; // Import AdminSweets
import './App.css';
import './Modal.css';

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
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [isRegister, setIsRegister] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([]);
    const url = `${process.env.REACT_APP_API_URL}/api/auth/${isRegister ? 'register' : 'login'}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role: isRegister ? role : undefined }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!isRegister) {
          login(data.token);
          navigate('/');
        } else {
          setMessageType('success');
          setMessages(['Registration successful! Please log in.']);
          setIsRegister(false);
        }
      } else {
        setMessageType('error');
        if (data.errors) {
          setMessages(data.errors.map(err => err.msg));
        } else {
          setMessages([data.msg || 'An error occurred']);
        }
      }
    } catch (error) {
      setMessageType('error');
      setMessages(['Network error']);
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
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              )}
            </span>
          </div>
        </div>
        {isRegister && (
          <div className="role-selection">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      {messages.length > 0 && (
        <div className={`message ${messageType}`}>
          <ul>
            {messages.map((msg, index) => <li key={index}>{msg}</li>)}
          </ul>
        </div>
      )}
      <p className="auth-toggle-link" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </p>
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
      <Link to="/" className="navbar-brand">Sweet Shop</Link>
      <div className="navbar-links">
        {user && user.role === 'admin' && <Link to="/admin/sweets">Manage Sweets</Link>}
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/login">Register</Link>
          </>
        ) : (
          <>
            <span className="navbar-welcome">Welcome, {user.username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
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
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SweetList />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
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