import Ship from '../entities/Ship';
import { Vector2 } from '@shared/types/Vector';
import networkManager from '../../network/NetworkManager';

/**
 * Renderer class for drawing the game world and entities
 */
class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize: number = 100; // Smaller grid size for more visible movement
  private gridColor: string = 'rgba(255, 255, 255, 0.3)'; // More visible grid lines
  
  // Track if HUD has been initialized
  private hudInitialized: boolean = false;
  
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
    
    // Set initial canvas size
    this.updateViewport();
  }
  
  /**
   * Updates the viewport size
   */
  public updateViewport(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  /**
   * Clears the canvas
   */
  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Fill with dark blue background
    this.ctx.fillStyle = '#0a2a5e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Renders the background grid
   * @param cameraPosition The camera position
   */
  public renderBackground(cameraPosition: Vector2): void {
    // Draw grid for reference
    this.renderGrid(cameraPosition);
    
    // Draw coordinate axes for better orientation
    this.renderCoordinateAxes(cameraPosition);
  }
  
  /**
   * Renders a grid for reference
   * @param cameraPosition The camera position
   */
  private renderGrid(cameraPosition: Vector2): void {
    this.ctx.save();
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    
    // Calculate grid offset
    const offsetX = this.canvas.width / 2 - cameraPosition.x % this.gridSize;
    const offsetY = this.canvas.height / 2 - cameraPosition.y % this.gridSize;
    
    // Draw vertical lines
    for (let x = offsetX; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = offsetY; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Renders coordinate axes for better orientation
   * @param cameraPosition The camera position
   */
  private renderCoordinateAxes(cameraPosition: Vector2): void {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.save();
    
    // X-axis (red)
    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, centerY - cameraPosition.y);
    this.ctx.lineTo(this.canvas.width, centerY - cameraPosition.y);
    this.ctx.stroke();
    
    // Y-axis (green)
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - cameraPosition.x, 0);
    this.ctx.lineTo(centerX - cameraPosition.x, this.canvas.height);
    this.ctx.stroke();
    
    // Origin marker
    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(centerX - cameraPosition.x, centerY - cameraPosition.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw coordinates at intervals
    this.ctx.fillStyle = 'white';
    this.ctx.font = '10px Arial';
    
    // X-axis coordinates
    for (let x = Math.floor(cameraPosition.x / 500) * 500; x < cameraPosition.x + this.canvas.width; x += 500) {
      const screenX = centerX + (x - cameraPosition.x);
      if (screenX >= 0 && screenX <= this.canvas.width) {
        this.ctx.fillText(x.toString(), screenX, centerY - cameraPosition.y + 15);
      }
    }
    
    // Y-axis coordinates
    for (let y = Math.floor(cameraPosition.y / 500) * 500; y < cameraPosition.y + this.canvas.height; y += 500) {
      const screenY = centerY + (y - cameraPosition.y);
      if (screenY >= 0 && screenY <= this.canvas.height) {
        this.ctx.fillText(y.toString(), centerX - cameraPosition.x + 5, screenY);
      }
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
    
    // Draw a position marker (crosshair) at the entity's position
    this.ctx.save();
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 2;
    
    // Horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(screenX - 10, screenY);
    this.ctx.lineTo(screenX + 10, screenY);
    this.ctx.stroke();
    
    // Vertical line
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY - 10);
    this.ctx.lineTo(screenX, screenY + 10);
    this.ctx.stroke();
    this.ctx.restore();
    
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
    
    this.ctx.restore();
    
    // Draw ship name horizontally under the ship (not rotating with the ship)
    this.ctx.save();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(entity.name || 'Unknown', screenX, screenY + entity.height / 2 + 20);
    this.ctx.restore();
  }
  
  /**
   * Renders the HUD (Heads-Up Display) with naval controls
   * @param playerShip The player's ship
   */
  public renderHUD(playerShip: Ship): void {
    if (!('getSpeedSettingName' in playerShip && 'getRudderSettingName' in playerShip)) {
      return; // Skip if ship doesn't have naval controls
    }
    
    // Log HUD initialization once
    if (!this.hudInitialized) {
      console.log('Initializing HUD for player ship:', playerShip.name);
      this.hudInitialized = true;
    }
    
    // Render the ship controls panel
    this.renderShipControlsPanel(playerShip);
    
    // Render the player ranking in the upper right corner
    this.renderPlayerRanking();
    
    // Render the help box in the lower right corner
    this.renderHelpBox();
  }
  
  /**
   * Renders the ship controls panel in the upper left corner
   * @param playerShip The player's ship
   */
  private renderShipControlsPanel(playerShip: Ship): void {
    const padding = 15;
    const panelWidth = 180;
    const panelHeight = 120;
    const cornerRadius = 8;
    
    this.ctx.save();
    
    // Draw semi-transparent panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.roundRect(padding, padding, panelWidth, panelHeight, cornerRadius);
    this.ctx.fill();
    
    // Draw panel border
    this.ctx.strokeStyle = 'rgba(0, 120, 215, 0.7)'; // Blue border for ship panel
    this.ctx.lineWidth = 2;
    this.roundRect(padding, padding, panelWidth, panelHeight, cornerRadius);
    this.ctx.stroke();
    
    // Draw title
    this.ctx.fillStyle = '#00AAFF'; // Bright blue for ship name
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText(playerShip.name, padding + 10, padding + 20);
    
    // Draw separator line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(padding + 5, padding + 30);
    this.ctx.lineTo(padding + panelWidth - 5, padding + 30);
    this.ctx.stroke();
    
    // Draw ship info
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`Health: ${playerShip.health}`, padding + 10, padding + 50);
    this.ctx.fillText(`Position: (${playerShip.position.x.toFixed(0)}, ${playerShip.position.y.toFixed(0)})`, padding + 10, padding + 70);
    
    // Draw speed controls
    this.ctx.fillStyle = '#FFCC33';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('SPEED:', padding + 10, padding + 90);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(playerShip.getSpeedSettingName(), padding + 70, padding + 90);
    
    // Draw rudder controls - text only, no indicator
    this.ctx.fillStyle = '#FFCC33';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('RUDDER:', padding + 10, padding + 110);
    
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(playerShip.getRudderSettingName(), padding + 70, padding + 110);
    
    this.ctx.restore();
  }
  
  /**
   * Renders the player ranking in the upper right corner
   */
  private renderPlayerRanking(): void {
    const padding = 15;
    const panelWidth = 220;
    const headerHeight = 40;
    const rowHeight = 25;
    const cornerRadius = 8;
    
    // Get all players from the network manager
    const players = networkManager.getAllPlayers();
    
    // Sort players by score (descending)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // Limit to 10 players
    const displayPlayers = sortedPlayers.slice(0, 10);
    
    // Calculate panel height based on number of players
    const panelHeight = headerHeight + (displayPlayers.length * rowHeight) + padding;
    
    // Position in upper right corner
    const x = this.canvas.width - panelWidth - padding;
    const y = padding;
    
    this.ctx.save();
    
    // Draw semi-transparent panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.roundRect(x, y, panelWidth, panelHeight, cornerRadius);
    this.ctx.fill();
    
    // Draw panel border
    this.ctx.strokeStyle = 'rgba(215, 120, 0, 0.7)'; // Orange border for ranking panel
    this.ctx.lineWidth = 2;
    this.roundRect(x, y, panelWidth, panelHeight, cornerRadius);
    this.ctx.stroke();
    
    // Draw title
    this.ctx.fillStyle = '#FFAA00'; // Orange for ranking title
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PLAYER RANKING', x + panelWidth / 2, y + 25);
    
    // Draw separator line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 5, y + headerHeight - 5);
    this.ctx.lineTo(x + panelWidth - 5, y + headerHeight - 5);
    this.ctx.stroke();
    
    // Draw column headers
    this.ctx.fillStyle = '#FFCC33';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('RANK', x + 15, y + headerHeight + 15);
    this.ctx.fillText('NAME', x + 55, y + headerHeight + 15);
    this.ctx.fillText('LVL', x + 155, y + headerHeight + 15);
    this.ctx.fillText('KILLS', x + 185, y + headerHeight + 15);
    
    // Draw player rows
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    
    // Highlight the local player
    const localPlayer = networkManager.getLocalPlayer();
    
    displayPlayers.forEach((player, index) => {
      const rowY = y + headerHeight + (index + 1) * rowHeight + 5;
      const isLocalPlayer = player.id === localPlayer?.id;
      
      // Highlight background for local player
      if (isLocalPlayer) {
        this.ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
        this.ctx.fillRect(x + 5, rowY - 15, panelWidth - 10, rowHeight);
        this.ctx.fillStyle = '#FFFFFF';
      }
      
      // Draw rank number
      this.ctx.fillText(`${index + 1}.`, x + 15, rowY);
      
      // Draw player name (truncate if too long)
      const displayName = player.name.length > 12 ? player.name.substring(0, 10) + '...' : player.name;
      this.ctx.fillText(displayName, x + 55, rowY);
      
      // Draw level (hardcoded to 1 for now)
      this.ctx.fillText('1', x + 155, rowY);
      
      // Draw kills (hardcoded to 0 for now)
      this.ctx.fillText('0', x + 185, rowY);
      
      // Reset fill style after drawing local player
      if (isLocalPlayer) {
        this.ctx.fillStyle = '#FFFFFF';
      }
    });
    
    this.ctx.restore();
  }
  
  /**
   * Renders a help box in the lower right corner
   */
  private renderHelpBox(): void {
    const padding = 20;
    const panelWidth = 220; // Increased width to fit longer text
    const panelHeight = 160; // Increased height to fit more controls
    const cornerRadius = 10;
    const x = this.canvas.width - panelWidth - padding;
    const y = this.canvas.height - panelHeight - padding;
    
    this.ctx.save();
    
    // Draw semi-transparent panel background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.roundRect(x, y, panelWidth, panelHeight, cornerRadius);
    this.ctx.fill();
    
    // Draw panel border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.roundRect(x, y, panelWidth, panelHeight, cornerRadius);
    this.ctx.stroke();
    
    // Draw title
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillText('NAVAL CONTROLS', x + 15, y + 25);
    
    // Draw separator line
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y + 35);
    this.ctx.lineTo(x + panelWidth - 10, y + 35);
    this.ctx.stroke();
    
    // Draw controls
    this.ctx.font = '12px Arial';
    this.ctx.fillText('W: Increase Speed Forward', x + 15, y + 55);
    this.ctx.fillText('S: Decrease Speed / Reverse', x + 15, y + 75);
    this.ctx.fillText('A/D: Turn Rudder', x + 15, y + 95);
    this.ctx.fillText('Space: Center Rudder', x + 15, y + 115);
    
    // Draw ship physics info
    this.ctx.fillStyle = '#FFCC33';
    this.ctx.fillText('Ship Physics:', x + 15, y + 135);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('• Must have speed to turn', x + 15, y + 155);
    
    this.ctx.restore();
  }
  
  /**
   * Draws a rounded rectangle
   * @param x X position
   * @param y Y position
   * @param width Width
   * @param height Height
   * @param radius Corner radius
   */
  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}

export default Renderer; 