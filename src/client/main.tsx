import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css';

/**
 * Game component that initializes our vanilla JS game
 */
const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Game component mounted, initializing game directly...');
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);
    console.log('Game container created and added to body');
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'game-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameContainer.appendChild(canvas);
    console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
    
    // Show welcome screen
    showWelcomeScreen(gameContainer, canvas);
  }, []);

  return <div id="root" ref={containerRef}></div>;
};

/**
 * Shows the welcome screen with player name input
 * @param container Game container element
 * @param canvas Game canvas element
 */
function showWelcomeScreen(container: HTMLElement, canvas: HTMLCanvasElement): void {
  console.log('showWelcomeScreen called');
  
  // Create welcome screen
  const welcomeScreen = document.createElement('div');
  welcomeScreen.id = 'welcome-screen';
  welcomeScreen.innerHTML = `
    <div class="welcome-content">
      <h1>Battleship Carnage</h1>
      <p>Enter your captain name to join the battle!</p>
      <input type="text" id="player-name" placeholder="Captain Name" value="Captain${Math.floor(Math.random() * 1000)}">
      <button id="start-game">Set Sail!</button>
    </div>
  `;
  container.appendChild(welcomeScreen);
  console.log('Welcome screen created and added to container');
  
  // Focus the input field
  const nameInput = document.getElementById('player-name') as HTMLInputElement;
  if (nameInput) {
    nameInput.focus();
    console.log('Name input focused');
  } else {
    console.error('Could not find player-name input element');
  }
  
  // Add event listener to start button
  const startButton = document.getElementById('start-game');
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Start button clicked');
      startGame(container, canvas, nameInput?.value || '');
    });
    console.log('Start button event listener added');
  } else {
    console.error('Could not find start-game button element');
  }
  
  // Allow pressing Enter to start
  if (nameInput) {
    nameInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        console.log('Enter key pressed in name input');
        startGame(container, canvas, nameInput.value);
      }
    });
    console.log('Name input keypress event listener added');
  }
}

/**
 * Starts the game with the given player name
 * @param container Game container element
 * @param canvas Game canvas element
 * @param playerName Player name
 */
function startGame(container: HTMLElement, canvas: HTMLCanvasElement, playerName: string): void {
  console.log('startGame called with player name:', playerName);
  
  // Validate player name
  const name = playerName.trim() || `Captain${Math.floor(Math.random() * 1000)}`;
  console.log('Validated player name:', name);
  
  // Remove welcome screen
  const welcomeScreen = document.getElementById('welcome-screen');
  if (welcomeScreen) {
    container.removeChild(welcomeScreen);
    console.log('Welcome screen removed');
  } else {
    console.error('Could not find welcome-screen element to remove');
  }
  
  // Remove the DOM-based HUD since we're using canvas-based HUD
  // No need to create game-ui element anymore
  
  // Import the game engine dynamically
  import('./game/engine/GameEngine').then(({ default: GameEngine }) => {
    console.log('GameEngine module loaded');
    
    // Create and start game engine
    console.log('Creating game engine...');
    const gameEngine = new GameEngine(canvas, name);
    console.log('Starting game engine...');
    gameEngine.start();
    console.log('Game engine started');
    
    // No need for health update interval since we're using canvas HUD
  }).catch(error => {
    console.error('Error loading GameEngine:', error);
  });
}

console.log('Rendering Game component...');
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
); 