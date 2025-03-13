import Ship from '../entities/Ship';
import { Vector2 } from '@shared/types/Vector';

/**
 * Renderer class for drawing the game world and entities
 */
class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private waterPattern: CanvasPattern | null = null;
  private waterOffset: Vector2 = { x: 0, y: 0 };
  
  /**
   * Creates a new renderer
   * @param canvas The canvas element to render to
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    
    this.ctx = context;
    
    // Create water pattern
    this.createWaterPattern();
    
    // Set initial canvas size
    this.updateViewport();
  }
  
  /**
   * Updates the viewport size
   */
  public updateViewport(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Recreate water pattern when viewport changes
    this.createWaterPattern();
  }
  
  /**
   * Clears the canvas
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Renders the water background
   * @param cameraPosition The camera position
   */
  public renderWater(cameraPosition: Vector2): void {
    if (!this.waterPattern) {
      this.createWaterPattern();
    }
    
    // Update water offset based on camera position
    this.waterOffset = {
      x: -cameraPosition.x * 0.1 % 200,
      y: -cameraPosition.y * 0.1 % 200
    };
    
    // Fill canvas with water pattern
    this.ctx.save();
    this.ctx.fillStyle = this.waterPattern || '#1a75ff';
    this.ctx.translate(this.waterOffset.x, this.waterOffset.y);
    this.ctx.fillRect(-this.waterOffset.x, -this.waterOffset.y, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    
    // Draw grid lines for reference
    this.renderGrid(cameraPosition);
  }
  
  /**
   * Renders a grid for reference
   * @param cameraPosition The camera position
   */
  private renderGrid(cameraPosition: Vector2): void {
    const gridSize = 500;
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    
    this.ctx.save();
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    
    // Calculate grid offset
    const offsetX = this.canvas.width / 2 - cameraPosition.x % gridSize;
    const offsetY = this.canvas.height / 2 - cameraPosition.y % gridSize;
    
    // Draw vertical lines
    for (let x = offsetX; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = offsetY; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Renders an entity
   * @param entity The entity to render
   * @param cameraPosition The camera position
   */
  public renderEntity(entity: Ship, cameraPosition: Vector2): void {
    // Calculate screen position
    const screenX = this.canvas.width / 2 + (entity.position.x - cameraPosition.x);
    const screenY = this.canvas.height / 2 + (entity.position.y - cameraPosition.y);
    
    console.log('Rendering entity at screen position:', screenX, screenY);
    
    this.ctx.save();
    
    // Translate to entity position
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(entity.rotation);
    
    // Draw ship hull with more visible colors
    this.ctx.fillStyle = entity.color || '#FF3366'; // Bright color as fallback
    this.ctx.strokeStyle = '#FFFFFF'; // White outline for better visibility
    this.ctx.lineWidth = 3; // Thicker outline
    
    // Ship body
    this.ctx.beginPath();
    this.ctx.moveTo(0, -entity.height / 2);
    this.ctx.lineTo(entity.width / 3, entity.height / 2);
    this.ctx.lineTo(-entity.width / 3, entity.height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke(); // Add outline
    
    // Draw ship name for debugging
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(entity.name || 'Unknown', 0, entity.height / 2 + 20);
    
    this.ctx.restore();
  }
  
  /**
   * Renders a health bar for an entity
   * @param entity The entity to render the health bar for
   */
  private renderHealthBar(entity: Ship): void {
    const barWidth = entity.width;
    const barHeight = 5;
    const barY = entity.height / 2 + 10;
    
    // Background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    
    // Health fill
    const healthPercent = Math.max(0, entity.health) / 100;
    const healthWidth = barWidth * healthPercent;
    
    // Choose color based on health
    let healthColor = '#00FF00'; // Green
    if (healthPercent < 0.3) {
      healthColor = '#FF0000'; // Red
    } else if (healthPercent < 0.6) {
      healthColor = '#FFFF00'; // Yellow
    }
    
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
  }
  
  /**
   * Creates a water pattern for the background
   */
  private createWaterPattern(): void {
    // Create a small canvas for the pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 200;
    patternCanvas.height = 200;
    const patternCtx = patternCanvas.getContext('2d');
    
    if (!patternCtx) {
      return;
    }
    
    // Fill with base water color
    patternCtx.fillStyle = '#1a75ff';
    patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    
    // Add some variation
    patternCtx.fillStyle = '#0066ff';
    
    // Draw random waves
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * patternCanvas.width;
      const y = Math.random() * patternCanvas.height;
      const width = 20 + Math.random() * 40;
      const height = 5 + Math.random() * 10;
      
      patternCtx.beginPath();
      patternCtx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
      patternCtx.fill();
    }
    
    // Create pattern from the small canvas
    this.waterPattern = this.ctx.createPattern(patternCanvas, 'repeat');
  }
}

export default Renderer; 