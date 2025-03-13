import { Vector2 } from '@shared/types/Vector';

/**
 * Ship configuration interface
 */
interface ShipConfig {
  position: Vector2;
  rotation: number;
  scale: Vector2;
  maxSpeed: number;
  rotationSpeed: number;
  acceleration: number;
  health: number;
  name: string;
}

/**
 * Ship entity class representing a player's battleship
 */
class Ship {
  // Position and movement
  public position: Vector2;
  public rotation: number;
  public scale: Vector2;
  public velocity: Vector2 = { x: 0, y: 0 };
  public currentSpeed: number = 0;
  
  // Ship properties
  public maxSpeed: number;
  public rotationSpeed: number;
  public acceleration: number;
  public health: number;
  public name: string;
  
  // Visual properties
  public color: string = '#3366FF';
  public width: number = 40;
  public height: number = 80;
  
  /**
   * Creates a new ship entity
   * @param config Ship configuration
   */
  constructor(config: ShipConfig) {
    this.position = config.position;
    this.rotation = config.rotation;
    this.scale = config.scale;
    this.maxSpeed = config.maxSpeed;
    this.rotationSpeed = config.rotationSpeed;
    this.acceleration = config.acceleration;
    this.health = config.health;
    this.name = config.name;
    
    // Assign a random bright color to make the ship more visible
    const colors = ['#FF3366', '#33FF66', '#6633FF', '#FFCC33', '#33CCFF'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    
    console.log(`Ship "${this.name}" created with color ${this.color} at position:`, this.position);
  }
  
  /**
   * Updates the ship's position and state
   * @param deltaTime Time since last frame in seconds
   */
  public update(deltaTime: number): void {
    // Calculate velocity based on current speed and rotation
    this.velocity = {
      x: Math.sin(this.rotation) * this.currentSpeed,
      y: -Math.cos(this.rotation) * this.currentSpeed
    };
    
    // Update position based on velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Apply drag to slow down the ship
    this.applyDrag(deltaTime);
  }
  
  /**
   * Increases the ship's speed
   * @param deltaTime Time since last frame in seconds
   */
  public increaseSpeed(deltaTime: number): void {
    this.currentSpeed = Math.min(
      this.maxSpeed,
      this.currentSpeed + this.acceleration * deltaTime
    );
  }
  
  /**
   * Decreases the ship's speed
   * @param deltaTime Time since last frame in seconds
   */
  public decreaseSpeed(deltaTime: number): void {
    this.currentSpeed = Math.max(
      -this.maxSpeed / 2, // Allow reverse at half speed
      this.currentSpeed - this.acceleration * deltaTime
    );
  }
  
  /**
   * Rotates the ship
   * @param amount Amount to rotate in radians
   */
  public rotate(amount: number): void {
    this.rotation += amount;
    
    // Normalize rotation to 0-2π
    while (this.rotation < 0) {
      this.rotation += Math.PI * 2;
    }
    while (this.rotation >= Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }
  }
  
  /**
   * Applies drag to slow down the ship
   * @param deltaTime Time since last frame in seconds
   */
  private applyDrag(deltaTime: number): void {
    const dragFactor = 0.2;
    
    if (Math.abs(this.currentSpeed) > 0.01) {
      const drag = this.currentSpeed * dragFactor * deltaTime;
      this.currentSpeed -= drag;
    } else {
      this.currentSpeed = 0;
    }
  }
  
  /**
   * Applies damage to the ship
   * @param amount Amount of damage to apply
   * @returns True if the ship is destroyed
   */
  public takeDamage(amount: number): boolean {
    this.health -= amount;
    return this.health <= 0;
  }
  
  /**
   * Generates a color based on the ship's name
   * @param name Ship name
   * @returns Hex color string
   */
  private generateColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const c = (hash & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();
    
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }
}

export default Ship; 