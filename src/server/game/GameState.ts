import { Socket } from 'socket.io';

// Player interface
interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  score: number;
}

// Game state class
class GameState {
  private players: Map<string, Player>;
  
  constructor() {
    this.players = new Map();
  }
  
  /**
   * Adds a player to the game
   * @param socket Socket connection
   * @param name Player name
   * @returns The created player
   */
  public addPlayer(socket: Socket, name: string): Player {
    const player: Player = {
      id: socket.id,
      name: name || `Player ${this.players.size + 1}`,
      position: { x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500 },
      rotation: 0,
      health: 100,
      score: 0
    };
    
    this.players.set(socket.id, player);
    return player;
  }
  
  /**
   * Removes a player from the game
   * @param socketId Socket ID
   * @returns True if the player was removed
   */
  public removePlayer(socketId: string): boolean {
    return this.players.delete(socketId);
  }
  
  /**
   * Gets a player by socket ID
   * @param socketId Socket ID
   * @returns The player or undefined
   */
  public getPlayer(socketId: string): Player | undefined {
    return this.players.get(socketId);
  }
  
  /**
   * Gets all players
   * @returns Array of all players
   */
  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
  
  /**
   * Updates a player's position
   * @param socketId Socket ID
   * @param position New position
   * @returns True if the player was updated
   */
  public updatePlayerPosition(socketId: string, position: { x: number; y: number }): boolean {
    const player = this.players.get(socketId);
    if (!player) return false;
    
    player.position = position;
    return true;
  }
  
  /**
   * Updates a player's rotation
   * @param socketId Socket ID
   * @param rotation New rotation
   * @returns True if the player was updated
   */
  public updatePlayerRotation(socketId: string, rotation: number): boolean {
    const player = this.players.get(socketId);
    if (!player) return false;
    
    player.rotation = rotation;
    return true;
  }
}

// Create a singleton instance
const gameState = new GameState();

export default gameState; 