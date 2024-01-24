import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles/ContactUs.css';

const ContactUs = ({ airtableCredentials }) => {
  const { apiKey, baseId } = airtableCredentials;
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [messageError, setMessageError] = useState(null);

  useEffect(() => {
    document.body.classList.add('contact-us-page');
    return () => {
      document.body.classList.remove('contact-us-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let name = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const mobileNumber = e.target.elements[2].value;
    const subject = e.target.elements[3].value;
    const message = e.target.elements[4].value;

    if (message.length < 150) {
      setMessageError('Your message must be at least 150 characters.');
      setLoading(false);
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    name = name.toUpperCase();

    const requestData = {
      fields: {
        name,
        email,
        mobileNumber,
        subject,
        message,
      },
    };

    try {
      await axios.post(
        `https://api.airtable.com/v0/${baseId}/tbluMJyau4NIcYxzq`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess(true);
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-us-container">
      <Link to="/" className="back-button"><i className="fas fa-arrow-left"></i></Link>
      <div className="image-container-contact">
        <img src={require('../components/images/logo.jpg')} alt="Login" />
      </div>
      <h1 className='contact-form-h1'>Contact Us</h1>
      <p className='contact-form-p'>Rest assured, your concerns are important to us. Please provide a detailed description of your issue, and our dedicated team will reach out to you promptly.</p>
      {isSuccess ? (
        <p className="success-text">Your message has been sent successfully!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="contact-form-group">
            <label>What do we call you?<span className="required-star">*</span></label>
            <input type="text" placeholder="eg, John Doe" required />
          </div>
          <div className="contact-form-group">
            <label>Email<span className="required-star">*</span></label>
            <input type="email" placeholder="bwubXXXX@brainwareuniversity.ac.in" required />
          </div>
          <div className="contact-form-group">
            <label>Mobile Number (Maximum 10 Digits)<span className="required-star">*</span></label>
            <input type="text" placeholder="eg, 5633683389" required />
          </div>
          <div className="contact-form-group">
            <label>Subject line<span className="required-star">*</span></label>
            <input type="text" placeholder="eg, I forgot my password, What is this Platform about?" required />
          </div>
          <div className="contact-form-group">
            <label>Message<span className="required-star">*</span></label>
            <textarea placeholder="Write a detailed explanation of the problem you are facing (min 150 characters)." minLength="150" required></textarea>
            {messageError && <div className="error-text">{messageError}</div>}
          </div>
          {!isLoading ? (
            <button type="submit" className="contact-btn">Send</button>
          ) : (
            <div className="loading-text">Sending <i className="fas fa-spinner fa-spin"></i></div>
          )}
        </form>
      )}
    </div>
  );
};

export default ContactUs;