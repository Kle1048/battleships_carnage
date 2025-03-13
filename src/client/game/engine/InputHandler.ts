import { Vector2 } from '@shared/types/Vector';

/**
 * Input state interface
 */
interface InputState {
  throttleUp: boolean;
  throttleDown: boolean;
  turnLeft: boolean;
  turnRight: boolean;
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
    switch (keyCode) {
      case 'KeyW':
        this.inputState.throttleUp = isPressed;
        break;
      case 'KeyS':
        this.inputState.throttleDown = isPressed;
        break;
      case 'KeyA':
        this.inputState.turnLeft = isPressed;
        break;
      case 'KeyD':
        this.inputState.turnRight = isPressed;
        break;
      case 'Space':
        this.inputState.fire = isPressed;
        break;
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