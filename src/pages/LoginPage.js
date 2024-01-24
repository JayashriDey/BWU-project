import React from 'react';
import LoginForm from '../components/LoginForm';

function LoginPage({ onLogin }) {
  return (
    <div className='landing'>
      <LoginForm onLogin={onLogin} />
    </div>
  );
}

export default LoginPage;