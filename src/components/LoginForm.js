import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('form-page');
    return () => {
      document.body.classList.remove('form-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
  
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    
    setIsLoggingIn(false);
  
    // Check if formRef.current is not null before calling reset
    if (formRef.current) {
      formRef.current.reset();
    }
  };
  

  return (
    <div className="auth-container">
      <Link to="/" className="back-button">
        <i className="fa fa-arrow-left"></i>
      </Link>
      <div className="image-container">
        <img src={require('./images/logo.jpg')} alt="Login" />
      </div>
      <h2 className="title">Login</h2>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label>Email<span className="required-star">*</span></label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-form-group">
          <label>Password<span className="required-star">*</span></label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {!isLoggingIn ? (
          <button className="auth-btn" type="submit">
            Login
          </button>
        ) : (
          <div className="loading-text">Loading <i className="fas fa-spinner fa-spin"></i></div>
        )}
      </form>
      <p>
        Don't have an account?{' '}
        <Link className="link-form" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;