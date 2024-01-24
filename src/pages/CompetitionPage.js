import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from '../components/images/logo.jpg';
import './styles/CompetitionPage.css';
import CarouselImage1 from '../components/images/carousel/1.png';
import CarouselImage2 from '../components/images/carousel/2.png';
import CarouselImage3 from '../components/images/carousel/3.png';


function CompetitionPage({ airtableCredentials }) {

  const studentCodeRegex = /^BWU\/\w{3}\/\w{2}\/\w{3}$/;
  const validCouponCodes = ["WELCOME25", "CODE2", "CODE3"]; // Valid coupon codes

  // Function to transform student code to email ID
  const transformCodeToEmail = (code) => {
    const parts = code.split('/').slice(1); // Remove the "BWU/" part and split the rest
    return `bwu${parts.join('')}@brainwareuniversity.ac.in`.toLowerCase();
  };

  const [formData, setFormData] = useState({
    name: '',
    studentCode: '',
    groupMembers: '',
    couponCode: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    let modifiedValue = value;
    if (name === "name" || name === "groupMembers" || name === "couponCode" || name === "studentCode") {
      // Capitalize these fields as the user types
      modifiedValue = value.toUpperCase();
    } else if (name === "studentCode") {
      // Capitalize only certain parts of the student code
      const parts = value.split('/');
      if (parts.length > 1) {
        modifiedValue = `BWU/${parts[1].toUpperCase()}/${parts.length > 2 ? parts[2].toUpperCase() : ''}/${parts.length > 3 ? parts[3].toUpperCase() : ''}`;
      }
    }
  
    setFormData(prevState => ({ ...prevState, [name]: modifiedValue }));
  };

    const carouselImages = [CarouselImage1, CarouselImage2, CarouselImage3];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(intervalId);
    }, []);

    // Function to show the next image
    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    };

    // Function to show the previous image
    const prevImage = () => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
      );
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate student code
    if (!studentCodeRegex.test(formData.studentCode)) {
      alert("Invalid student code. Please enter a code in the format BWU/XXX/XX/XXX.");
      return;
    }
      // Validate coupon code
    if (!validCouponCodes.includes(formData.couponCode)) {
      alert("Invalid coupon code. Please enter a valid code.");
      return;
    }

    const email = transformCodeToEmail(formData.studentCode);

    setIsLoading(true);
  
    const modifiedFormData = {
      ...formData,
      name: formData.name.toUpperCase(),
      email, // Add email to the form data
    };
  
    const requestData = {
      fields: {
        name: modifiedFormData.name,
        studentCode: modifiedFormData.studentCode,
        groupMembers: modifiedFormData.groupMembers,
        couponCode: modifiedFormData.couponCode,
        email: modifiedFormData.email
      },
    };
  
    try {
      await axios.post(
        `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblprWiEIXnDYR96X`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${airtableCredentials.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setShowSuccessMessage(true);
      setFormData({ name: '', studentCode: '', groupMembers: '', couponCode: '' });
      setTimeout(() => setShowSuccessMessage(false), 10000); // Hide success message after 10 seconds
    } catch (error) {
      console.error("An error occurred while submitting the form:", error);
    }
    setIsLoading(false);
  };
  

  return (
    <div className="registration-container">
      <Link to="/" className="go-back-btn">
        <i className="fa-solid fa-arrow-left"></i> Go Back
      </Link>
      <div className="image-container">
        <img src={Logo} alt="Login" />
      </div>
      <h1><i className="fa-brands fa-codepen"></i> CodeCamp.</h1>
      <h2>UNLEASH YOUR POTENTIAL AND WIN PRIZES</h2>

      <div className="carousel-container">
        <button className='carousel-button' onClick={prevImage}>
          <i className="fa fa-arrow-left"></i>
        </button>
        <img src={carouselImages[currentImageIndex]} alt="Carousel" />
        <button className='carousel-button' onClick={nextImage}>
          <i className="fa fa-arrow-right"></i>
        </button>
      </div>

      <form className="registration-form" onSubmit={handleSubmit}>
        <h3><i className="fa-solid fa-user-plus"></i> Do Register!</h3>
        <div className="input-group">
          <i className="fa-solid fa-user input-icon"></i>
          <input type="text" name="name" placeholder="Name" onChange={handleChange} value={formData.name} required />
        </div>
        <div className="input-group">
          <i className="fa-solid fa-barcode input-icon"></i>
          <input type="text" name="studentCode" placeholder="Student Code (BWU/XXX/XX/XXX)" onChange={handleChange} value={formData.studentCode} required />
        </div>
        <div className="input-group">
          <i className="fa-solid fa-users input-icon"></i>
          <input type="text" name="groupMembers" placeholder="Group Members (Enter student code(s) separated by commas)" onChange={handleChange} value={formData.groupMembers} required />
        </div>
        <div className="input-group">
          <i className="fa-solid fa-ticket input-icon"></i>
          <input type="text" name="couponCode" placeholder="Coupon Code" onChange={handleChange} value={formData.couponCode} required />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>} Apply
        </button>
        {showSuccessMessage && <p className="success-message">Form submitted successfully!</p>}
        <p>Details will be mailed to the registered students</p>
      </form>
    </div>
  );
}

export default CompetitionPage;