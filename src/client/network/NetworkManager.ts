import { io, Socket } from 'socket.io-client';
import { Vector2 } from '@shared/types/Vector';

// Player interface
interface Player {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  health: number;
  score: number;
}

/**
 * Network manager for client-server communication
 */
class NetworkManager {
  private socket: Socket;
  private players: Map<string, Player> = new Map();
  private localPlayerId: string | null = null;
  
  // Event callbacks
  private onPlayerJoinedCallback: ((player: Player) => void) | null = null;
  private onPlayerLeftCallback: ((playerId: string) => void) | null = null;
  private onPlayerMovedCallback: ((playerId: string, position: Vector2) => void) | null = null;
  private onPlayerRotatedCallback: ((playerId: string, rotation: number) => void) | null = null;
  private onPlayersListCallback: ((players: Player[]) => void) | null = null;
  
  /**
   * Creates a new network manager
   */
  constructor() {
    console.log('Initializing NetworkManager, connecting to server...');
    
    // Get the current hostname and port
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = window.location.hostname;
    // Use port 3001 for the server
    const serverPort = '3001';
    
    const serverUrl = `${protocol}//${hostname}:${serverPort}`;
    console.log('Connecting to server at:', serverUrl);
    
    // Connect to the server with explicit error handling
    try {
      this.socket = io(serverUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });
      
      console.log('Socket.io instance created');
    } catch (error) {
      console.error('Error creating socket connection:', error);
    }
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Sets up Socket.IO event listeners
   */
  private setupEventListeners(): void {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server. Reason:', reason);
    });
    
    // Player events
    this.socket.on('player:joined', (player: Player) => {
      console.log('You joined the game:', player);
      this.localPlayerId = player.id;
      this.players.set(player.id, player);
      
      if (this.onPlayerJoinedCallback) {
        this.onPlayerJoinedCallback(player);
      }
    });
    
    this.socket.on('player:new', (player: Player) => {
      console.log('New player joined:', player);
      this.players.set(player.id, player);
      
      if (this.onPlayerJoinedCallback) {
        this.onPlayerJoinedCallback(player);
      }
    });
    
    this.socket.on('player:left', (data: { id: string }) => {
      console.log('Player left:', data.id);
      this.players.delete(data.id);
      
      if (this.onPlayerLeftCallback) {
        this.onPlayerLeftCallback(data.id);
      }
    });
    
    this.socket.on('player:moved', (data: { id: string, position: Vector2 }) => {
      const player = this.players.get(data.id);
      if (player) {
        player.position = data.position;
        
        if (this.onPlayerMovedCallback) {
          this.onPlayerMovedCallback(data.id, data.position);
        }
      }
    });
    
    this.socket.on('player:rotated', (data: { id: string, rotation: number }) => {
      const player = this.players.get(data.id);
      if (player) {
        player.rotation = data.rotation;
        
        if (this.onPlayerRotatedCallback) {
          this.onPlayerRotatedCallback(data.id, data.rotation);
        }
      }
    });
    
    this.socket.on('players:list', (players: Player[]) => {
      console.log('Received players list:', players);
      
      // Update local players map
      players.forEach(player => {
        if (player.id !== this.localPlayerId) {
          this.players.set(player.id, player);
        }
      });
      
      if (this.onPlayersListCallback) {
        this.onPlayersListCallback(players);
      }
    });
  }
  
  /**
   * Joins the game with a player name
   * @param name Player name
   */
  public joinGame(name: string): void {
    this.socket.emit('player:join', { name });
  }
  
  /**
   * Sends a position update to the server
   * @param position New position
   */
  public updatePosition(position: Vector2): void {
    this.socket.emit('player:move', position);
  }
  
  /**
   * Sends a rotation update to the server
   * @param rotation New rotation
   */
  public updateRotation(rotation: number): void {
    this.socket.emit('player:rotate', rotation);
  }
  
  /**
   * Gets all players
   * @returns Array of all players
   */
  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
  
  /**
   * Gets the local player
   * @returns Local player or null if not joined
   */
  public getLocalPlayer(): Player | null {
    if (!this.localPlayerId) return null;
    return this.players.get(this.localPlayerId) || null;
  }
  
  /**
   * Sets the callback for when a player joins
   * @param callback Callback function
   */
  public onPlayerJoined(callback: (player: Player) => void): void {
    this.onPlayerJoinedCallback = callback;
  }
  
  /**
   * Sets the callback for when a player leaves
   * @param callback Callback function
   */
  public onPlayerLeft(callback: (playerId: string) => void): void {
    this.onPlayerLeftCallback = callback;
  }
  
  /**
   * Sets the callback for when a player moves
   * @param callback Callback function
   */
  public onPlayerMoved(callback: (playerId: string, position: Vector2) => void): void {
    this.onPlayerMovedCallback = callback;
  }
  
  /**
   * Sets the callback for when a player rotates
   * @param callback Callback function
   */
  public onPlayerRotated(callback: (playerId: string, rotation: number) => void): void {
    this.onPlayerRotatedCallback = callback;
  }
  
  /**
   * Sets the callback for when the players list is received
   * @param callback Callback function
   */
  public onPlayersList(callback: (players: Player[]) => void): void {
    this.onPlayersListCallback = callback;
  }
}

// Create a singleton instance
const networkManager = new NetworkManager();

export default networkManager; 