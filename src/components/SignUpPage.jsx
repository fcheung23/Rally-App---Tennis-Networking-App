import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './SignUpPage.css';

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  // Navigate to search page if already logged in
  useEffect(() => {
    if (user) {
      navigate('/search');
    }
  }, [user, navigate]);

  // Handles account creation with firebase
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !skillLevel) {
      setError('All fields are required.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        skillLevel: skillLevel,
        firstName: firstName
      });
      navigate('/search');
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div className="sign-up-page">
      <img className="sign-up-logo" src="\img\rally_up_logo.png" alt="Logo" />
      <form className="sign-up-form" onSubmit={handleSignUp}>
        <h1>Welcome!</h1>

        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select className='skill-picker'
          value={skillLevel}
          onChange={(e) => setSkillLevel(e.target.value)}
          required
        >
          <option value="">Skill Level &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
            &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;▾</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button type="submit">Sign Up</button>
        <p className="alternate-link">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </form>
    </div>
  );
};

export default SignUpPage;
