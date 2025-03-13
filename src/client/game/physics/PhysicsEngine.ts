import Ship from '../entities/Ship';
import { Vector2 } from '@shared/types/Vector';

/**
 * Physics engine for handling collisions and movement
 */
class PhysicsEngine {
  // World boundaries
  private worldBounds = {
    minX: -5000,
    maxX: 5000,
    minY: -5000,
    maxY: 5000
  };

  /**
   * Creates a new physics engine
   */
  constructor() {}

  /**
   * Updates physics for all entities
   * @param entities List of entities to update
   * @param deltaTime Time since last frame in seconds
   */
  public update(entities: Ship[], deltaTime: number): void {
    // Debug log only if significant changes
    if (entities.length > 0 && entities[0].currentSpeed > 1.0) {
      const firstShip = entities[0];
      console.log(`Physics: position=(${firstShip.position.x.toFixed(2)}, ${firstShip.position.y.toFixed(2)}), velocity=(${firstShip.velocity.x.toFixed(2)}, ${firstShip.velocity.y.toFixed(2)})`);
    }
    
    // Apply world boundaries
    this.enforceWorldBoundaries(entities);
    
    // Check for collisions
    this.detectCollisions(entities);
  }

  /**
   * Enforces world boundaries for all entities
   * @param entities List of entities to check
   */
  private enforceWorldBoundaries(entities: Ship[]): void {
    for (const entity of entities) {
      // Enforce X boundaries
      if (entity.position.x < this.worldBounds.minX) {
        entity.position.x = this.worldBounds.minX;
        entity.velocity.x = 0;
      } else if (entity.position.x > this.worldBounds.maxX) {
        entity.position.x = this.worldBounds.maxX;
        entity.velocity.x = 0;
      }
      
      // Enforce Y boundaries
      if (entity.position.y < this.worldBounds.minY) {
        entity.position.y = this.worldBounds.minY;
        entity.velocity.y = 0;
      } else if (entity.position.y > this.worldBounds.maxY) {
        entity.position.y = this.worldBounds.maxY;
        entity.velocity.y = 0;
      }
    }
  }

  /**
   * Detects collisions between entities
   * @param entities List of entities to check
   */
  private detectCollisions(entities: Ship[]): void {
    const entityCount = entities.length;
    
    // Check each pair of entities for collisions
    for (let i = 0; i < entityCount; i++) {
      for (let j = i + 1; j < entityCount; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        if (this.checkCollision(entityA, entityB)) {
          this.resolveCollision(entityA, entityB);
        }
      }
    }
  }

  /**
   * Checks if two entities are colliding
   * @param entityA First entity
   * @param entityB Second entity
   * @returns True if the entities are colliding
   */
  private checkCollision(entityA: Ship, entityB: Ship): boolean {
    // Simple circle-based collision detection
    const dx = entityA.position.x - entityB.position.x;
    const dy = entityA.position.y - entityB.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Use the average of the entities' dimensions for collision radius
    const radiusA = Math.max(entityA.width, entityA.height) / 2;
    const radiusB = Math.max(entityB.width, entityB.height) / 2;
    
    return distance < (radiusA + radiusB);
  }

  /**
   * Resolves a collision between two entities
   * @param entityA First entity
   * @param entityB Second entity
   */
  private resolveCollision(entityA: Ship, entityB: Ship): void {
    // Calculate collision normal
    const dx = entityB.position.x - entityA.position.x;
    const dy = entityB.position.y - entityA.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize the collision normal
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Calculate relative velocity
    const rvx = entityB.velocity.x - entityA.velocity.x;
    const rvy = entityB.velocity.y - entityA.velocity.y;
    
    // Calculate relative velocity in terms of the normal direction
    const velAlongNormal = rvx * nx + rvy * ny;
    
    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) {
      return;
    }
    
    // Calculate restitution (bounciness)
    const restitution = 0.2;
    
    // Calculate impulse scalar
    const impulseScalar = -(1 + restitution) * velAlongNormal;
    
    // Apply impulse
    const impulseX = impulseScalar * nx;
    const impulseY = impulseScalar * ny;
    
    // Update velocities
    entityA.velocity.x -= impulseX;
    entityA.velocity.y -= impulseY;
    entityB.velocity.x += impulseX;
    entityB.velocity.y += impulseY;
    
    // Move entities apart to prevent sticking
    const percent = 0.2; // penetration resolution percentage
    const slop = 0.01; // penetration allowance
    
    // Use the average of the entities' dimensions for collision radius
    const radiusA = Math.max(entityA.width, entityA.height) / 2;
    const radiusB = Math.max(entityB.width, entityB.height) / 2;
    
    const penetration = (radiusA + radiusB) - distance;
    
    if (penetration > slop) {
      const correctionX = nx * penetration * percent;
      const correctionY = ny * penetration * percent;
      
      entityA.position.x -= correctionX / 2;
      entityA.position.y -= correctionY / 2;
      entityB.position.x += correctionX / 2;
      entityB.position.y += correctionY / 2;
    }
    
    // Apply damage based on collision force
    const collisionForce = Math.abs(velAlongNormal) * 5;
    if (collisionForce > 1) {
      const damage = Math.floor(collisionForce);
      entityA.takeDamage(damage);
      entityB.takeDamage(damage);
    }
  }
}

export default PhysicsEngine; 