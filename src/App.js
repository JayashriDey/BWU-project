import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ContactUs from './pages/ContactUs';
import CompetitionPage from './pages/CompetitionPage';
import './styles.css';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showInvalidCredentials, setShowInvalidCredentials] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;

  const airtableCredentials = {
    apiKey: AIRTABLE_API_KEY,
    baseId: AIRTABLE_BASE_ID,
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedRecordId = localStorage.getItem('recordId');

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
      setLoggedIn(true);
    }

    if (storedRecordId) {
      setRecordId(storedRecordId);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tblF5La1RkLC3gXsi`,
        {
          params: {
            filterByFormula: `{email} = "${email}"`,
            maxRecords: 1,
          },
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          },
        }
      );
  
      const user = response.data.records[0];
      if (user) {
        setRecordId(user.id);
        localStorage.setItem('recordId', user.id);
  
        const isPasswordMatch = await bcrypt.compare(password, user.fields.password);
        if (isPasswordMatch) {
          setLoggedIn(true);
          setUserData(user.fields);
          localStorage.setItem('userData', JSON.stringify(user.fields));
  
          setTimeout(() => {
            localStorage.removeItem('userData');
            setLoggedIn(false);
            setUserData(null);
          }, 14400000);  // 4 hours
  
          setShowInvalidCredentials(false);
        } else {
          setShowInvalidCredentials(true);
        }
      } else {
        setShowInvalidCredentials(true);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };  
  
  const handleRegister = async (name, email, password, referrer, section, projectTitle, termsAccepted, country, phoneNumber) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const requestData = {
      fields: {
        name,
        email,
        password: hashedPassword,
        referrer,
        phoneNumber,
        country,
        section,
        projectTitle,
        termsAccepted,
      },
    };
  
    try {
      await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tblF5La1RkLC3gXsi`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
    }
  };  

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('recordId');
    
    setLoggedIn(false);
    setUserData(null);
    setRecordId(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage airtableCredentials={airtableCredentials} />} />
        <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={loggedIn ? <Navigate to="/dashboard" /> : <RegistrationPage onRegister={handleRegister} airtableCredentials={airtableCredentials} />} />
        <Route path="/dashboard" element={loggedIn ? <Dashboard userData={userData} recordId={recordId} airtableCredentials={airtableCredentials} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/contact-us" element={<ContactUs airtableCredentials={airtableCredentials} />} />
        <Route path="/competition" element={<CompetitionPage airtableCredentials={airtableCredentials} />} />
      </Routes>
      {showInvalidCredentials && <p className="auth-error-message">Invalid Credentials. Please try again.</p>}
    </Router>
  );
};

export default App;