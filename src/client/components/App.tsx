import React, { useState, useEffect } from 'react';
import Game from './Game';
import LoadingScreen from './LoadingScreen';
import MainMenu from './MainMenu';

/**
 * Main App component that manages the game state and screens
 */
const App: React.FC = () => {
  // Game state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');

  // Simulate loading assets
  useEffect(() => {
    const loadAssets = async () => {
      // In a real implementation, we would load assets here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
    };

    loadAssets();
  }, []);

  const handleStartGame = (name: string) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  // Render appropriate screen based on game state
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!gameStarted) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  return <Game playerName={playerName} />;
};

export default App; 