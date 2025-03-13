import { Vector2 } from '@shared/types/Vector';

/**
 * Input state interface
 */
interface InputState {
  throttleUp: boolean;
  throttleDown: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  centerRudder: boolean;
  fire: boolean;
}

/**
 * Handles user input for controlling the game
 */
class InputHandler {
  private inputState: InputState = {
    throttleUp: false,
    throttleDown: false,
    turnLeft: false,
    turnRight: false,
    centerRudder: false,
    fire: false
  };

  /**
   * Creates a new input handler
   * @param canvas The canvas element to attach listeners to
   */
  constructor(canvas: HTMLCanvasElement) {
    // Set up keyboard event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Set up mouse event listeners
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    console.log('InputHandler initialized and listening for keyboard/mouse events');
    console.log('Controls: W/S = Speed, A/D = Rudder, Space = Center Rudder');
  }

  /**
   * Handles key down events
   * @param event Keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.updateInputState(event.code, true);
  }

  /**
   * Handles key up events
   * @param event Keyboard event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.updateInputState(event.code, false);
  }

  /**
   * Handles mouse down events
   * @param event Mouse event
   */
  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left mouse button
      this.inputState.fire = true;
    }
  }

  /**
   * Handles mouse up events
   * @param event Mouse event
   */
  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left mouse button
      this.inputState.fire = false;
    }
  }

  /**
   * Updates the input state based on key code
   * @param keyCode The key code
   * @param isPressed Whether the key is pressed or released
   */
  private updateInputState(keyCode: string, isPressed: boolean): void {
    let stateChanged = false;
    
    switch (keyCode) {
      case 'KeyW':
        if (this.inputState.throttleUp !== isPressed) {
          this.inputState.throttleUp = isPressed;
          stateChanged = true;
          console.log(`Throttle Up (W): ${isPressed ? 'PRESSED' : 'RELEASED'}`);
        }
        break;
      case 'KeyS':
        if (this.inputState.throttleDown !== isPressed) {
          this.inputState.throttleDown = isPressed;
          stateChanged = true;
          console.log(`Throttle Down (S): ${isPressed ? 'PRESSED' : 'RELEASED'}`);
        }
        break;
      case 'KeyA':
        if (this.inputState.turnLeft !== isPressed) {
          this.inputState.turnLeft = isPressed;
          stateChanged = true;
          console.log(`Turn Left (A): ${isPressed ? 'PRESSED' : 'RELEASED'}`);
        }
        break;
      case 'KeyD':
        if (this.inputState.turnRight !== isPressed) {
          this.inputState.turnRight = isPressed;
          stateChanged = true;
          console.log(`Turn Right (D): ${isPressed ? 'PRESSED' : 'RELEASED'}`);
        }
        break;
      case 'Space':
        if (this.inputState.centerRudder !== isPressed) {
          this.inputState.centerRudder = isPressed;
          stateChanged = true;
          console.log(`Center Rudder (Space): ${isPressed ? 'PRESSED' : 'RELEASED'}`);
        }
        break;
    }
    
    // Log the current input state when it changes
    if (stateChanged) {
      console.log('Current input state:', JSON.stringify(this.inputState));
    }
  }

  /**
   * Gets the current input state
   * @returns The current input state
   */
  public getInput(): InputState {
    return { ...this.inputState };
  }
}

export default InputHandler; 