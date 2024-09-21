import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Navigate to search page if already logged in
  useEffect(() => {
    if (user) {
      navigate('/search'); 
    }
  }, [user, navigate]); 
  
  // Handles login authentication with firebase
  const handleLogin = async (e) => { 
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/search'); 
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div className="login-page">
      <img className="login-logo" src="\img\rally_up_logo.png" alt="Logo" />
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Welcome Back!</h1>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        <p className="alternate-link">
          Don't have an account yet? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
