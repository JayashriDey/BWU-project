import React, { useEffect, useState } from 'react';
import EditProfileForm from '../components/EditProfileForm';
import axios from 'axios';
import './styles/Dashboard.css';

const Dashboard = ({ onLogout, userData, recordId, airtableCredentials }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [localUserData, setLocalUserData] = useState(userData);

  useEffect(() => {
    document.body.classList.add('dashboard');
    return () => {
      document.body.classList.remove('dashboard');
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const url = `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblF5La1RkLC3gXsi/${recordId}`;
      const config = {
        headers: {
          Authorization: `Bearer ${airtableCredentials.apiKey}`,
        },
      };
      const response = await axios.get(url, config);
      return response.data.fields;
    } catch (error) {
      console.error("There was an error fetching the user data:", error);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleClose = () => {
    setShowEditProfile(false);
  };

  const handleSave = async (updatedData) => {
    try {
      const url = `https://api.airtable.com/v0/${airtableCredentials.baseId}/tblF5La1RkLC3gXsi/${recordId}`;
      const config = {
        headers: {
          Authorization: `Bearer ${airtableCredentials.apiKey}`,
        },
      };
      const data = {
        fields: updatedData,
      };
      await axios.patch(url, data, config);
      const latestUserData = await fetchUserData();
      setLocalUserData(latestUserData); // Update localUserData
      localStorage.setItem('userData', JSON.stringify(latestUserData));
  
      setShowEditProfile(false);
    } catch (error) {
      console.error("There was an error updating the record:", error);
    }
  };  

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Dashboard</h1>

      <div className="profile-overview-container">
        {/* User Profile */}
        <div className="user-profile section">
          <h2 className="section-heading">User Profile</h2>
          <p className="user-name">Name: {localUserData.name}</p>
          <p className="user-email">Email: {localUserData.email}</p>
          <p className="user-phone">Phone Number: {localUserData.phoneNumber}</p>
          <p className="user-phone">Section: {localUserData.section}</p>
          <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
        </div>

        {/* Project Overview */}
        <div className="project-overview section">
          <h2 className="section-heading">Project Overview</h2>
          <p className="project-title">Current Project: {localUserData.projectTitle}</p>
          <p className="project-status">Project Status: {/* Add project status here */}</p>
          <p className="mentor-name">Mentor Assigned: {/* Add mentor name here */}</p>
          <button className="new-project-btn">Create New Project</button>
        </div>

      {/* Mentor Section */}
        <div className="mentor-section section">
          <h2 className="section-heading">Mentor Section</h2>
          <p className="current-mentor">Current Mentor: {/* Add current mentor here */}</p>
          <p className="mentorship-status">Mentorship Status: {/* Add mentorship status here */}</p>
          <p className="mentorship-status">Phone Number:  {/* Add mentorship status here */}</p>
          <button className="request-mentorship-btn">Request Mentorship</button>
        </div>
      </div>

      <div className="profile-overview-container">
        {/* Learning Resources */}
        <div className="learning-resources section">
          <h2 className="section-heading">Learning Resources</h2>
          <ul className="resource-list">
            <li><a href="#" className="resource-item">Resource 1</a></li>
            <li><a href="#" className="resource-item">Resource 2</a></li>
            {/* Add more resources here */}
          </ul>
        </div>

        {/* Notifications */}
        <div className="notifications section">
          <h2 className="section-heading">Notifications</h2>
          <p className="notification-text">You have no new notifications.</p>
        </div>
      </div>

      <button className="logout-btn" onClick={onLogout}>Logout</button>
      
      {showEditProfile && (
        <div className="overlay">
          <EditProfileForm
            onClose={handleClose}
            onSave={handleSave}
            userData={localUserData}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;