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
  
  // Add a camera position property to the class
  private cameraPosition: Vector2 = { x: 0, y: 0 };
  private cameraLerpFactor: number = 0.02; // Reduced from 0.05 to make ship movement even more noticeable
  
  // Add properties to track previous input state
  private lastThrottleUp: boolean = false;
  private lastThrottleDown: boolean = false;
  private lastTurnLeft: boolean = false;
  private lastTurnRight: boolean = false;
  private lastCenterRudder: boolean = false;
  
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
      maxSpeed: 60, // Increased from 40 to 60 for even faster movement
      rotationSpeed: 0.15, // Increased for better responsiveness
      acceleration: 2.0, // Increased for faster acceleration
      health: 100,
      name: playerName
    });
    
    // Initialize camera position to match player ship
    this.cameraPosition = { ...this.playerShip.position };
    
    console.log('Player ship initialized:', this.playerShip);
    console.log('Camera position initialized:', this.cameraPosition);
    
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
          acceleration: 0.3,
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
            acceleration: 0.3,
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
    
    // Update camera position
    this.updateCamera(deltaTime);
    
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
    
    // Debug log all input states periodically
    if (this.lastTimestamp % 60 === 0) {
      console.log('Current input state:', JSON.stringify(input));
    }
    
    // Track if input has changed to avoid continuous changes
    let inputChanged = false;
    
    // Apply throttle control (W/S keys) using naval speed settings
    if (input.throttleUp && !this.lastThrottleUp) {
      // Increase speed setting (W key) - only on key press, not continuous
      this.playerShip.increaseSpeedSetting();
      inputChanged = true;
      
      // Debug log for throttle up
      console.log(`Increasing speed: ${this.playerShip.getSpeedSettingName()}`);
    } 
    else if (input.throttleDown && !this.lastThrottleDown) {
      // Decrease speed setting (S key) - only on key press, not continuous
      this.playerShip.decreaseSpeedSetting();
      inputChanged = true;
      
      // Debug log for throttle down
      console.log(`Decreasing speed: ${this.playerShip.getSpeedSettingName()}`);
    }
    
    // Apply steering (A/D keys) using naval rudder settings
    if (input.turnLeft && !this.lastTurnLeft) {
      // Turn rudder to port (A key) - only on key press, not continuous
      this.playerShip.turnRudderPort();
      inputChanged = true;
      
      console.log(`Turning port: ${this.playerShip.getRudderSettingName()}`);
    } 
    else if (input.turnRight && !this.lastTurnRight) {
      // Turn rudder to starboard (D key) - only on key press, not continuous
      this.playerShip.turnRudderStarboard();
      inputChanged = true;
      
      console.log(`Turning starboard: ${this.playerShip.getRudderSettingName()}`);
    }
    else if (input.centerRudder && !this.lastCenterRudder) {
      // Center rudder (Space key) - only on key press, not continuous
      this.playerShip.centerRudder();
      inputChanged = true;
      
      console.log(`Centering rudder: ${this.playerShip.getRudderSettingName()}`);
    }
    
    // Store current input state for next frame
    this.lastThrottleUp = input.throttleUp;
    this.lastThrottleDown = input.throttleDown;
    this.lastTurnLeft = input.turnLeft;
    this.lastTurnRight = input.turnRight;
    this.lastCenterRudder = input.centerRudder;
    
    // Debug log ship state when input changes
    if (inputChanged) {
      console.log(`Ship state: position=(${this.playerShip.position.x.toFixed(2)}, ${this.playerShip.position.y.toFixed(2)}), speed=${this.playerShip.currentSpeed.toFixed(2)}, rotation=${this.playerShip.rotation.toFixed(2)}`);
      console.log(`Naval controls: Speed=${this.playerShip.getSpeedSettingName()}, Rudder=${this.playerShip.getRudderSettingName()}`);
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
   * Updates the camera position to follow the player ship
   * @param deltaTime Time since last frame in seconds
   */
  private updateCamera(deltaTime: number): void {
    // Store old camera position for logging
    const oldCameraX = this.cameraPosition.x;
    const oldCameraY = this.cameraPosition.y;
    
    // Smoothly move the camera towards the player ship (lerp)
    this.cameraPosition.x += (this.playerShip.position.x - this.cameraPosition.x) * this.cameraLerpFactor;
    this.cameraPosition.y += (this.playerShip.position.y - this.cameraPosition.y) * this.cameraLerpFactor;
    
    // Log camera movement if significant
    if (Math.abs(this.cameraPosition.x - oldCameraX) > 0.01 || Math.abs(this.cameraPosition.y - oldCameraY) > 0.01) {
      console.log(`Camera moved: (${oldCameraX.toFixed(2)}, ${oldCameraY.toFixed(2)}) -> (${this.cameraPosition.x.toFixed(2)}, ${this.cameraPosition.y.toFixed(2)})`);
      console.log(`Distance to ship: (${(this.playerShip.position.x - this.cameraPosition.x).toFixed(2)}, ${(this.playerShip.position.y - this.cameraPosition.y).toFixed(2)})`);
    }
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
    
    // Render background grid
    this.renderer.renderBackground(this.cameraPosition);
    
    // Render player ship
    this.renderer.renderEntity(this.playerShip, this.cameraPosition);
    
    // Render other entities
    for (const entity of this.entities.values()) {
      this.renderer.renderEntity(entity, this.cameraPosition);
    }
    
    // Render HUD with naval controls
    this.renderer.renderHUD(this.playerShip);
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