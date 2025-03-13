import React, { useEffect, useRef } from 'react';
import GameEngine from '../game/engine/GameEngine';
import HUD from './HUD';

interface GameProps {
  playerName: string;
}

/**
 * Game component that initializes the game engine and renders the game canvas
 */
const Game: React.FC<GameProps> = ({ playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Initialize game engine on component mount
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create game engine instance
    const gameEngine = new GameEngine(canvasRef.current, playerName);
    gameEngineRef.current = gameEngine;

    // Start game loop
    gameEngine.start();

    // Clean up on unmount
    return () => {
      gameEngine.stop();
    };
  }, [playerName]);

  return (
    <div className="game-container">
      <canvas ref={canvasRef} />
      <HUD playerName={playerName} gameEngine={gameEngineRef.current} />
    </div>
  );
};

export default Game; 