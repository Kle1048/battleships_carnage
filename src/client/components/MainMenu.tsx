import React, { useState } from 'react';

interface MainMenuProps {
  onStartGame: (playerName: string) => void;
}

/**
 * Main menu component with game start options
 */
const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter a name');
      return;
    }
    
    onStartGame(playerName);
  };

  return (
    <div className="menu">
      <h1 className="menu-title">Battleship Carnage</h1>
      <form onSubmit={handleSubmit}>
        <div className="menu-item">
          <label htmlFor="playerName">Enter your name:</label>
          <input
            type="text"
            id="playerName"
            className="input-field"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={15}
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="menu-item">
          <button type="submit" className="button">
            Start Game
          </button>
        </div>
      </form>
      <div className="menu-item">
        <h2>Controls:</h2>
        <ul>
          <li>W/S - Increase/decrease speed</li>
          <li>A/D - Steer left/right</li>
          <li>Mouse - Aim weapons</li>
          <li>Left Click - Fire cannons</li>
        </ul>
      </div>
    </div>
  );
};

export default MainMenu; 