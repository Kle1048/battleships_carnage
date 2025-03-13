import Ship from '../entities/Ship';
import Renderer from '../rendering/Renderer';
import InputHandler from './InputHandler';
import PhysicsEngine from '../physics/PhysicsEngine';
import { Vector2 } from '@shared/types/Vector';
import networkManager from '../../network/NetworkManager';

/**
 * Main game engine class that manages the game loop and entities
 */
class GameEngine {
  // Canvas and rendering
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  
  // Game state
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  public playerShip: Ship;
  private entities: Map<string, Ship> = new Map();
  
  // Systems
  private inputHandler: InputHandler;
  private physicsEngine: PhysicsEngine;
  
  // Network update throttling
  private lastNetworkUpdate: number = 0;
  private networkUpdateInterval: number = 100; // ms
  
  /**
   * Creates a new game engine instance
   * @param canvas The canvas element to render to
   * @param playerName The name of the player
   */
  constructor(canvas: HTMLCanvasElement, playerName: string) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.inputHandler = new InputHandler(canvas);
    this.physicsEngine = new PhysicsEngine();
    
    // Set up canvas size
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    
    // Create player ship with a visible position
    this.playerShip = new Ship({
      position: { x: 0, y: 0 }, // Center of the screen
      rotation: 0,
      scale: { x: 1, y: 1 },
      maxSpeed: 5,
      rotationSpeed: 0.05,
      acceleration: 0.1,
      health: 100,
      name: playerName
    });
    
    console.log('Player ship initialized:', this.playerShip);
    
    // Set up network event handlers
    this.setupNetworkHandlers();
    
    // Join the game
    networkManager.joinGame(playerName);
    
    // Add debug logging
    console.log('GameEngine initialized with canvas dimensions:', canvas.width, 'x', canvas.height);
  }
  
  /**
   * Sets up network event handlers
   */
  private setupNetworkHandlers(): void {
    // When the local player joins
    networkManager.onPlayerJoined((player) => {
      // Update player ship position
      if (networkManager.getLocalPlayer()?.id === player.id) {
        this.playerShip.position = player.position;
        this.playerShip.rotation = player.rotation;
      } else {
        // Create a ship for the other player
        const otherShip = new Ship({
          position: player.position,
          rotation: player.rotation,
          scale: { x: 1, y: 1 },
          maxSpeed: 5,
          rotationSpeed: 0.05,
          acceleration: 0.1,
          health: player.health,
          name: player.name
        });
        
        this.entities.set(player.id, otherShip);
      }
    });
    
    // When a player leaves
    networkManager.onPlayerLeft((playerId) => {
      this.entities.delete(playerId);
    });
    
    // When a player moves
    networkManager.onPlayerMoved((playerId, position) => {
      const ship = this.entities.get(playerId);
      if (ship) {
        ship.position = position;
      }
    });
    
    // When a player rotates
    networkManager.onPlayerRotated((playerId, rotation) => {
      const ship = this.entities.get(playerId);
      if (ship) {
        ship.rotation = rotation;
      }
    });
    
    // When receiving the players list
    networkManager.onPlayersList((players) => {
      players.forEach(player => {
        if (networkManager.getLocalPlayer()?.id !== player.id) {
          // Create a ship for each player
          const otherShip = new Ship({
            position: player.position,
            rotation: player.rotation,
            scale: { x: 1, y: 1 },
            maxSpeed: 5,
            rotationSpeed: 0.05,
            acceleration: 0.1,
            health: player.health,
            name: player.name
          });
          
          this.entities.set(player.id, otherShip);
        }
      });
    });
  }
  
  /**
   * Starts the game loop
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Stops the game loop
   */
  public stop(): void {
    this.isRunning = false;
  }
  
  /**
   * Main game loop
   * @param timestamp Current timestamp from requestAnimationFrame
   */
  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;
    
    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // Process input
    this.handleInput(deltaTime);
    
    // Update physics
    this.updatePhysics(deltaTime);
    
    // Send network updates
    this.sendNetworkUpdates(timestamp);
    
    // Render frame
    this.render();
    
    // Schedule next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  /**
   * Processes player input
   * @param deltaTime Time since last frame in seconds
   */
  private handleInput(deltaTime: number): void {
    const input = this.inputHandler.getInput();
    
    // Apply throttle control (W/S keys)
    if (input.throttleUp) {
      this.playerShip.increaseSpeed(deltaTime);
    } else if (input.throttleDown) {
      this.playerShip.decreaseSpeed(deltaTime);
    }
    
    // Apply steering (A/D keys)
    if (input.turnLeft) {
      this.playerShip.rotate(-this.playerShip.rotationSpeed * deltaTime);
    } else if (input.turnRight) {
      this.playerShip.rotate(this.playerShip.rotationSpeed * deltaTime);
    }
  }
  
  /**
   * Updates physics for all entities
   * @param deltaTime Time since last frame in seconds
   */
  private updatePhysics(deltaTime: number): void {
    // Update player ship
    this.playerShip.update(deltaTime);
    
    // Update other entities
    for (const entity of this.entities.values()) {
      entity.update(deltaTime);
    }
    
    // Run physics simulation
    this.physicsEngine.update([this.playerShip, ...this.entities.values()], deltaTime);
  }
  
  /**
   * Sends network updates if needed
   * @param timestamp Current timestamp
   */
  private sendNetworkUpdates(timestamp: number): void {
    // Throttle network updates
    if (timestamp - this.lastNetworkUpdate > this.networkUpdateInterval) {
      this.lastNetworkUpdate = timestamp;
      
      // Send position update
      networkManager.updatePosition(this.playerShip.position);
      
      // Send rotation update
      networkManager.updateRotation(this.playerShip.rotation);
    }
  }
  
  /**
   * Renders the current frame
   */
  private render(): void {
    // Clear canvas
    this.renderer.clear();
    
    // Render water background
    this.renderer.renderWater(this.playerShip.position);
    
    // Debug logging for player ship position
    console.log('Rendering player ship at position:', this.playerShip.position);
    
    // Render player ship
    this.renderer.renderEntity(this.playerShip, this.playerShip.position);
    
    // Render other entities
    for (const entity of this.entities.values()) {
      this.renderer.renderEntity(entity, this.playerShip.position);
    }
  }
  
  /**
   * Resizes the canvas to match the window size
   */
  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.renderer.updateViewport();
  }
}

export default GameEngine; 