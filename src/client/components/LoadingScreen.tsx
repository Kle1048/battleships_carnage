import React from 'react';

/**
 * Loading screen component displayed while assets are being loaded
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <h1>Battleship Carnage</h1>
      <p>Loading...</p>
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
    </div>
  );
};

export default LoadingScreen; 