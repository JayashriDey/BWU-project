import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

function RegistrationPage({ onRegister, airtableCredentials }) {
  return (
    <div className='landing'>
      <RegistrationForm 
        onRegister={onRegister} 
        airtableCredentials={airtableCredentials}
      />
    </div>
  );
}

export default RegistrationPage;