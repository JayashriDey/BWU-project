import React, { useState, useRef } from 'react';
import bcrypt from 'bcryptjs';

const EditProfileForm = ({ onClose, userData, onSave }) => {
  const [name, setName] = useState(userData.name || '');
  const [password, setPassword] = useState('');
  const [projectTitle, setProjectTitle] = useState(userData.projectTitle || '');
  const [section, setSection] = useState(userData.section || '');
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
  const [country, setCountry] = useState(userData.country || '');

  const formRef = useRef(null);

  const handleSave = async () => {
    if (formRef.current.checkValidity()) {
      const updatedData = {
        name,
        projectTitle,
        phoneNumber,
        country,
        section,
      };

      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updatedData.password = hashedPassword;
      }

      onSave(updatedData);
    } else {
      // Trigger form validation
      formRef.current.reportValidity();
    }
  };

  return (
    <div className="edit-profile-form">
      <div className="close-button" onClick={onClose}>
        <i className="fas fa-times"></i>
      </div>
      <h2>Edit Profile</h2>
      <form ref={formRef}>
        <label>
          Name: <span className="required-star">*</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Project Title: <span className="required-star">*</span>
          <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
        </label>
        <label>
          Section: <span className="required-star">*</span>
          <input type="text" value={section} onChange={(e) => setSection(e.target.value)} required />
        </label>
        <label>
          Phone Number: <span className="required-star">*</span>
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </label>
        <label>
          Change Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Leave blank for no change' />
        </label>
        <label>
          City: <span className="required-star">*</span>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder='Kolkata, India' required />
        </label>
        <button type="button" onClick={handleSave}>Save</button>
      </form>
    </div>
  );
};

export default EditProfileForm;