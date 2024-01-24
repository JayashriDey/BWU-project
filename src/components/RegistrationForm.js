import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RegistrationForm({ onRegister, airtableCredentials }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referrer, setReferrer] = useState('');
  const [section, setSection] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const location = useLocation();
  const prefilledData = location.state?.prefilledData;

  useEffect(() => {
    if (prefilledData) {
      setName(prefilledData.name);
      setProjectTitle(prefilledData.projectTitle);
      const email = convertStudentCodeToEmail(prefilledData.studentCode);
      setEmail(email);
    }
  }, [prefilledData]);
  

  useEffect(() => {
    document.body.classList.add('form-page');
    return () => {
      document.body.classList.remove('form-page');
    };
  }, []);

  const convertStudentCodeToEmail = (studentCode) => {
    if (!studentCode) return '';
    const parts = studentCode.split('/').slice(1);
    
    return `bwu${parts.join('')}@brainwareuniversity.ac.in`.toLowerCase();
  };
  

  async function checkIfUserExists(email) {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblF5La1RkLC3gXsi?filterByFormula={email}='${encodeURIComponent(email)}'`,
        {
          headers: {
            Authorization: `Bearer ${airtableCredentials.apiKey}`,
          },
        }
      );
      return response.data.records.length !== 0;
    } catch (error) {
      console.error('Error checking user:', error);
      console.error('Error details:', error.response ? error.response.data : 'No additional error details');  // Log the error details
      return false;
    }
  }  

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@brainwareuniversity\.ac\.in$/;
    return emailPattern.test(email);
  };  

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      alert('You must agree to the terms and conditions.');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address. Only emails ending with @brainwareuniversity.ac.in are allowed.');
      setLoading(false);
      return;
    }

    const phoneNumberPattern = /^[0-9]*$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      alert('Please enter a valid phone number.');
      setLoading(false);
      return;
    }

    const isEmailRegistered = await checkIfUserExists(email);

    if (isEmailRegistered) {
      setEmailExists(true);
      setLoading(false);
      return;
    }

    try {
      await onRegister(name, email, password, referrer, section, projectTitle, termsAccepted, country, phoneNumber);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-auth-container">
      <Link to="/" className="back-button">
        <i className="fa fa-arrow-left"></i>
      </Link>
      <div className="image-container">
        <img src={require('./images/logo.jpg')} alt="Register" />
      </div>
      <h2 className="title">Register</h2>
      {registrationSuccess ? (
        <p className="success-text">Registration successful, you can now log in. Check your mailbox for confirmation!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>What do we call you?<span className="required-star">*</span></label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label>University Email<span className="required-star">*</span></label>
            <input
              type="email"
              placeholder="yourname@brainwareuniversity.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="auth-error-message">{emailError}</p>}
            {emailExists && <p className="auth-error-message">Email is already registered.</p>}
          </div>
          <div className="auth-form-group">
            <label>Choose a Password<span className="required-star">*</span></label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Confirm your Password<span className="required-star">*</span></label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Project Title<span className="required-star">*</span></label>
            <input
              type="text"
              name="projectTitle"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
          <label>Section<span className="required-star">*</span></label>
            <input
              type="text"
              placeholder="BCSE-2020(A), etc."
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>
          <div className="auth-form-group">
          <label>Phone Number (Max 10 Digits)<span className="required-star">*</span></label>
          <input
            type="tel"
            pattern="[0-9]*"
            placeholder="eg, XXXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div className="auth-form-group">
          <label>Where do you live right now?<span className="required-star">*</span></label>
          <input
            type="text"
            placeholder="Kolkata, India."
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div className="form-group terms-container">
          <input
            type="checkbox"
            onChange={() => setTermsAccepted(!termsAccepted)}
            required
          />
          <label className='form-terms'>
            By clicking on Register, you agree to our{" "}
            <a
              className='form-terms-link'
              href="/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              terms and conditions
            </a>
            .
          </label><span className="required-star">*</span>
        </div>
        {!isLoading ? (
          <button className="auth-btn" type="submit">
            Register
          </button>
        ) : (
          <div className="loading-text">Registering you <i className="fas fa-spinner fa-spin"></i></div>
        )}
        </form>
      )}
      <p>
        Already have an account?{' '}
        <Link className="link-form" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegistrationForm;