import React, { useState, useEffect } from 'react';
import BookRecommendationSystem from './BRSystem';
import AuthSystem from './AuthSystem';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return user ? (
    <>
      <BookRecommendationSystem user={user} onLogout={handleLogout} />
    </>
  ) : (
    <AuthSystem onAuthenticated={setUser} />
  );
};

export default App;