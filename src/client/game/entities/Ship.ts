import { Vector2 } from '@shared/types/Vector';

/**
 * Naval speed settings enum
 */
enum NavalSpeed {
  FULL_REVERSE = -0.6,  // 60% of max speed in reverse
  HALF_REVERSE = -0.3,  // 30% of max speed in reverse
  FULL_STOP = 0,
  DEAD_SLOW = 0.2,      // 20% of max speed
  SLOW = 0.4,           // 40% of max speed
  HALF = 0.7,           // 70% of max speed (increased from 0.6)
  FULL = 1.0            // 100% of max speed
}

/**
 * Naval rudder settings enum
 */
enum RudderSetting {
  HARD_PORT = -1.0,      // Full left
  HALF_PORT = -0.5,      // Half left
  MIDSHIPS = 0.0,        // Center
  HALF_STARBOARD = 0.5,  // Half right
  HARD_STARBOARD = 1.0   // Full right
}

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
  
  // Naval controls
  public targetSpeedSetting: NavalSpeed = NavalSpeed.FULL_STOP;
  public targetSpeed: number = 0;
  public rudderSetting: RudderSetting = RudderSetting.MIDSHIPS;
  
  // Visual properties
  public color: string = '#3366FF';
  public width: number = 40;
  public height: number = 80;
  
  // Turning physics constants
  private readonly MIN_TURN_FACTOR: number = 0.2;   // Minimum turning factor at low speeds
  private readonly MAX_TURN_FACTOR: number = 1.0;   // Maximum turning factor at optimal speed
  private readonly OPTIMAL_TURN_SPEED: number = 0.6; // Speed at which turning is most effective (as a fraction of max speed)
  private readonly MIN_SPEED_FOR_TURNING: number = 0.05; // Minimum speed required for any turning (as a fraction of max speed)
  
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
    // Apply naval speed settings
    this.updateSpeed(deltaTime);
    
    // Apply naval rudder settings with realistic turning physics
    this.updateRotation(deltaTime);
    
    // Calculate velocity based on current speed and rotation
    this.velocity = {
      x: Math.sin(this.rotation) * this.currentSpeed,
      y: -Math.cos(this.rotation) * this.currentSpeed
    };
    
    // Debug log velocity and rotation
    if (Math.abs(this.currentSpeed) > 0.1) {
      console.log(`Ship velocity: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)}), rotation: ${this.rotation.toFixed(2)}, speed: ${this.currentSpeed.toFixed(2)}`);
    }
    
    // Update position based on velocity
    const oldX = this.position.x;
    const oldY = this.position.y;
    
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Log position change if significant movement occurred
    if (Math.abs(this.position.x - oldX) > 0.1 || Math.abs(this.position.y - oldY) > 0.1) {
      console.log(`Ship position updated: (${oldX.toFixed(2)}, ${oldY.toFixed(2)}) -> (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}), deltaTime: ${deltaTime.toFixed(4)}`);
    }
    
    // Apply drag to slow down the ship
    this.applyDrag(deltaTime);
  }
  
  /**
   * Updates the ship's speed based on naval speed settings
   * @param deltaTime Time since last frame in seconds
   */
  private updateSpeed(deltaTime: number): void {
    // Calculate target speed based on naval speed setting
    this.targetSpeed = this.targetSpeedSetting * this.maxSpeed;
    
    // Gradually adjust current speed towards target speed
    const speedDiff = this.targetSpeed - this.currentSpeed;
    
    if (Math.abs(speedDiff) > 0.01) {
      // Accelerate or decelerate based on the difference
      const changeRate = this.acceleration * 15.0 * deltaTime; // Increased for more responsive controls
      
      if (speedDiff > 0) {
        // Accelerating
        this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + changeRate);
      } else {
        // Decelerating
        this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - changeRate);
      }
      
      console.log(`Ship speed adjusting: ${this.currentSpeed.toFixed(2)} → ${this.targetSpeed.toFixed(2)} (${this.getSpeedSettingName()})`);
    }
  }
  
  /**
   * Updates the ship's rotation based on rudder settings with realistic turning physics
   * @param deltaTime Time since last frame in seconds
   */
  private updateRotation(deltaTime: number): void {
    // Calculate normalized speed (as a fraction of max speed)
    const absSpeed = Math.abs(this.currentSpeed / this.maxSpeed);
    
    // No turning if the ship is not moving or moving too slowly
    if (absSpeed < this.MIN_SPEED_FOR_TURNING) {
      // If rudder is not centered, log that turning is not possible
      if (this.rudderSetting !== RudderSetting.MIDSHIPS) {
        console.log(`Ship cannot turn: insufficient speed (${absSpeed.toFixed(2)} < ${this.MIN_SPEED_FOR_TURNING})`);
      }
      return;
    }
    
    // Calculate turn factor - a bell curve that peaks at optimal speed
    let turnFactor;
    if (absSpeed < this.OPTIMAL_TURN_SPEED) {
      // Increasing effectiveness as speed increases from minimum to optimal
      turnFactor = this.MIN_TURN_FACTOR + (this.MAX_TURN_FACTOR - this.MIN_TURN_FACTOR) * 
                  ((absSpeed - this.MIN_SPEED_FOR_TURNING) / (this.OPTIMAL_TURN_SPEED - this.MIN_SPEED_FOR_TURNING));
    } else {
      // Decreasing effectiveness as speed increases beyond optimal
      turnFactor = this.MAX_TURN_FACTOR - (this.MAX_TURN_FACTOR - this.MIN_TURN_FACTOR) * 
                  ((absSpeed - this.OPTIMAL_TURN_SPEED) / (1 - this.OPTIMAL_TURN_SPEED));
    }
    
    // Ensure turn factor is within bounds
    turnFactor = Math.max(this.MIN_TURN_FACTOR, Math.min(this.MAX_TURN_FACTOR, turnFactor));
    
    // Reverse the rudder effect when going in reverse
    const directionFactor = this.currentSpeed >= 0 ? 1 : -1;
    
    // Apply rotation based on rudder setting, turn factor, and direction
    const rotationAmount = this.rudderSetting * this.rotationSpeed * turnFactor * directionFactor * deltaTime * 5.0;
    
    if (rotationAmount !== 0) {
      this.rotation += rotationAmount;
      
      // Normalize rotation to 0-2π
      while (this.rotation < 0) {
        this.rotation += Math.PI * 2;
      }
      while (this.rotation >= Math.PI * 2) {
        this.rotation -= Math.PI * 2;
      }
      
      // Log turning information for debugging
      console.log(`Ship turning: rudder=${this.rudderSetting.toFixed(2)}, turnFactor=${turnFactor.toFixed(2)}, speed=${absSpeed.toFixed(2)}`);
    }
  }
  
  /**
   * Sets the ship's speed setting
   * @param setting Naval speed setting
   */
  public setSpeedSetting(setting: NavalSpeed): void {
    this.targetSpeedSetting = setting;
    console.log(`Ship speed set to: ${this.getSpeedSettingName()}`);
  }
  
  /**
   * Increases the ship's speed setting
   */
  public increaseSpeedSetting(): void {
    const currentSetting = this.targetSpeedSetting;
    
    switch (currentSetting) {
      case NavalSpeed.FULL_REVERSE:
        this.setSpeedSetting(NavalSpeed.HALF_REVERSE);
        break;
      case NavalSpeed.HALF_REVERSE:
        this.setSpeedSetting(NavalSpeed.FULL_STOP);
        break;
      case NavalSpeed.FULL_STOP:
        this.setSpeedSetting(NavalSpeed.DEAD_SLOW);
        break;
      case NavalSpeed.DEAD_SLOW:
        this.setSpeedSetting(NavalSpeed.SLOW);
        break;
      case NavalSpeed.SLOW:
        this.setSpeedSetting(NavalSpeed.HALF);
        break;
      case NavalSpeed.HALF:
        this.setSpeedSetting(NavalSpeed.FULL);
        break;
      case NavalSpeed.FULL:
        // Already at maximum
        break;
    }
  }
  
  /**
   * Decreases the ship's speed setting
   */
  public decreaseSpeedSetting(): void {
    const currentSetting = this.targetSpeedSetting;
    
    switch (currentSetting) {
      case NavalSpeed.FULL:
        this.setSpeedSetting(NavalSpeed.HALF);
        break;
      case NavalSpeed.HALF:
        this.setSpeedSetting(NavalSpeed.SLOW);
        break;
      case NavalSpeed.SLOW:
        this.setSpeedSetting(NavalSpeed.DEAD_SLOW);
        break;
      case NavalSpeed.DEAD_SLOW:
        this.setSpeedSetting(NavalSpeed.FULL_STOP);
        break;
      case NavalSpeed.FULL_STOP:
        this.setSpeedSetting(NavalSpeed.HALF_REVERSE);
        break;
      case NavalSpeed.HALF_REVERSE:
        this.setSpeedSetting(NavalSpeed.FULL_REVERSE);
        break;
      case NavalSpeed.FULL_REVERSE:
        // Already at maximum reverse
        break;
    }
  }
  
  /**
   * Gets the name of the current speed setting
   * @returns Name of the current speed setting
   */
  public getSpeedSettingName(): string {
    switch (this.targetSpeedSetting) {
      case NavalSpeed.FULL_REVERSE:
        return "FULL REVERSE";
      case NavalSpeed.HALF_REVERSE:
        return "HALF REVERSE";
      case NavalSpeed.FULL_STOP:
        return "FULL STOP";
      case NavalSpeed.DEAD_SLOW:
        return "DEAD SLOW";
      case NavalSpeed.SLOW:
        return "SLOW";
      case NavalSpeed.HALF:
        return "HALF";
      case NavalSpeed.FULL:
        return "FULL";
      default:
        return "UNKNOWN";
    }
  }
  
  /**
   * Sets the ship's rudder setting
   * @param setting Rudder setting
   */
  public setRudderSetting(setting: RudderSetting): void {
    this.rudderSetting = setting;
    console.log(`Ship rudder set to: ${this.getRudderSettingName()}`);
  }
  
  /**
   * Gets the name of the current rudder setting
   * @returns Name of the current rudder setting
   */
  public getRudderSettingName(): string {
    switch (this.rudderSetting) {
      case RudderSetting.HARD_PORT:
        return "HARD PORT";
      case RudderSetting.HALF_PORT:
        return "HALF PORT";
      case RudderSetting.MIDSHIPS:
        return "MIDSHIPS";
      case RudderSetting.HALF_STARBOARD:
        return "HALF STARBOARD";
      case RudderSetting.HARD_STARBOARD:
        return "HARD STARBOARD";
      default:
        return "UNKNOWN";
    }
  }
  
  /**
   * Turn the rudder to port (left)
   */
  public turnRudderPort(): void {
    switch (this.rudderSetting) {
      case RudderSetting.HARD_STARBOARD:
        this.setRudderSetting(RudderSetting.HALF_STARBOARD);
        break;
      case RudderSetting.HALF_STARBOARD:
        this.setRudderSetting(RudderSetting.MIDSHIPS);
        break;
      case RudderSetting.MIDSHIPS:
        this.setRudderSetting(RudderSetting.HALF_PORT);
        break;
      case RudderSetting.HALF_PORT:
        this.setRudderSetting(RudderSetting.HARD_PORT);
        break;
      case RudderSetting.HARD_PORT:
        // Already at maximum port
        break;
    }
  }
  
  /**
   * Turn the rudder to starboard (right)
   */
  public turnRudderStarboard(): void {
    switch (this.rudderSetting) {
      case RudderSetting.HARD_PORT:
        this.setRudderSetting(RudderSetting.HALF_PORT);
        break;
      case RudderSetting.HALF_PORT:
        this.setRudderSetting(RudderSetting.MIDSHIPS);
        break;
      case RudderSetting.MIDSHIPS:
        this.setRudderSetting(RudderSetting.HALF_STARBOARD);
        break;
      case RudderSetting.HALF_STARBOARD:
        this.setRudderSetting(RudderSetting.HARD_STARBOARD);
        break;
      case RudderSetting.HARD_STARBOARD:
        // Already at maximum starboard
        break;
    }
  }
  
  /**
   * Center the rudder (set to midships)
   */
  public centerRudder(): void {
    this.setRudderSetting(RudderSetting.MIDSHIPS);
  }
  
  /**
   * Legacy method for backward compatibility
   * @param deltaTime Time since last frame in seconds
   */
  public increaseSpeed(deltaTime: number): void {
    this.increaseSpeedSetting();
  }
  
  /**
   * Legacy method for backward compatibility
   * @param deltaTime Time since last frame in seconds
   */
  public decreaseSpeed(deltaTime: number): void {
    this.decreaseSpeedSetting();
  }
  
  /**
   * Legacy method for backward compatibility
   * @param amount Amount to rotate in radians
   */
  public rotate(amount: number): void {
    if (amount < 0) {
      this.turnRudderPort();
    } else if (amount > 0) {
      this.turnRudderStarboard();
    } else {
      this.centerRudder();
    }
  }
  
  /**
   * Applies drag to slow down the ship
   * @param deltaTime Time since last frame in seconds
   */
  private applyDrag(deltaTime: number): void {
    // Only apply drag when not actively maintaining speed
    if (this.targetSpeedSetting === NavalSpeed.FULL_STOP) {
      const dragFactor = 0.1;
      
      if (Math.abs(this.currentSpeed) > 0.01) {
        const drag = this.currentSpeed * dragFactor * deltaTime;
        this.currentSpeed -= drag;
      } else {
        this.currentSpeed = 0;
      }
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
}

export default Ship; 