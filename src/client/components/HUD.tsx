import React, { useState, useEffect } from 'react';
import GameEngine from '../game/engine/GameEngine';

interface HUDProps {
  playerName: string;
  gameEngine: GameEngine | null;
}

/**
 * Heads-up display component that shows game information
 */
const HUD: React.FC<HUDProps> = ({ playerName, gameEngine }) => {
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);

  // Update HUD data from game engine
  useEffect(() => {
    if (!gameEngine) return;

    const updateInterval = setInterval(() => {
      if (gameEngine.playerShip) {
        setSpeed(Math.round(gameEngine.playerShip.speed * 10) / 10);
        setHeading(Math.round(gameEngine.playerShip.rotation * (180 / Math.PI)));
        setHealth(gameEngine.playerShip.health);
      }
    }, 100);

    return () => {
      clearInterval(updateInterval);
    };
  }, [gameEngine]);

  return (
    <div className="hud">
      <div className="hud-element hud-player-info">
        <h3>{playerName}</h3>
        <div className="health-bar">
          <div 
            className="health-bar-fill" 
            style={{ width: `${health}%`, backgroundColor: getHealthColor(health) }}
          ></div>
        </div>
      </div>
      <div className="hud-element hud-ship-info">
        <p>Speed: {speed} knots</p>
        <p>Heading: {heading}°</p>
      </div>
    </div>
  );
};

// Helper function to get health bar color based on health percentage
const getHealthColor = (health: number): string => {
  if (health > 70) return 'var(--success-color)';
  if (health > 30) return 'orange';
  return 'var(--danger-color)';
};

export default HUD; 