/**
 * 2D Vector interface
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Vector utility functions
 */
export const Vector = {
  /**
   * Adds two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Sum of the vectors
   */
  add(a: Vector2, b: Vector2): Vector2 {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  },
  
  /**
   * Subtracts vector b from vector a
   * @param a First vector
   * @param b Second vector
   * @returns Difference of the vectors
   */
  subtract(a: Vector2, b: Vector2): Vector2 {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    };
  },
  
  /**
   * Multiplies a vector by a scalar
   * @param v Vector
   * @param scalar Scalar value
   * @returns Scaled vector
   */
  multiply(v: Vector2, scalar: number): Vector2 {
    return {
      x: v.x * scalar,
      y: v.y * scalar
    };
  },
  
  /**
   * Divides a vector by a scalar
   * @param v Vector
   * @param scalar Scalar value
   * @returns Divided vector
   */
  divide(v: Vector2, scalar: number): Vector2 {
    if (scalar === 0) {
      throw new Error('Cannot divide by zero');
    }
    
    return {
      x: v.x / scalar,
      y: v.y / scalar
    };
  },
  
  /**
   * Calculates the magnitude (length) of a vector
   * @param v Vector
   * @returns Magnitude of the vector
   */
  magnitude(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },
  
  /**
   * Normalizes a vector (makes it unit length)
   * @param v Vector
   * @returns Normalized vector
   */
  normalize(v: Vector2): Vector2 {
    const mag = this.magnitude(v);
    
    if (mag === 0) {
      return { x: 0, y: 0 };
    }
    
    return this.divide(v, mag);
  },
  
  /**
   * Calculates the dot product of two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Dot product
   */
  dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  },
  
  /**
   * Calculates the distance between two vectors
   * @param a First vector
   * @param b Second vector
   * @returns Distance between the vectors
   */
  distance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  /**
   * Calculates the angle of a vector in radians
   * @param v Vector
   * @returns Angle in radians
   */
  angle(v: Vector2): number {
    return Math.atan2(v.y, v.x);
  },
  
  /**
   * Creates a vector from an angle and magnitude
   * @param angle Angle in radians
   * @param magnitude Magnitude of the vector
   * @returns New vector
   */
  fromAngle(angle: number, magnitude: number = 1): Vector2 {
    return {
      x: Math.cos(angle) * magnitude,
      y: Math.sin(angle) * magnitude
    };
  },
  
  /**
   * Limits a vector to a maximum magnitude
   * @param v Vector
   * @param max Maximum magnitude
   * @returns Limited vector
   */
  limit(v: Vector2, max: number): Vector2 {
    const mag = this.magnitude(v);
    
    if (mag > max) {
      return this.multiply(this.normalize(v), max);
    }
    
    return { ...v };
  }
}; 