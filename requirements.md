Project: Top-Down Retro Massive Multiplayer Marine Shooter

1. Introduction

This document outlines the requirements for a browser-based multiplayer game featuring naval battles. Players engage in combat on an open water map, collect wreckage to upgrade their ships, and climb the leaderboard.

2. Game Concept

Endless Water Map: The game world consists entirely of an open sea with no predefined borders.

Persistent World: The game server runs continuously, allowing players to enter and leave at any time.

Ship Growth: Players who win battles collect wreckage from defeated enemies, which improves their ship’s size, durability, and firepower.

Leveling System: New players start with a small ship and gain experience through combat and exploration.

Realistic Naval Combat: The game includes momentum-based movement and limited acceleration.

Varied Arsenal: Players use cannons, torpedoes, and missiles, each with distinct tactical advantages.

Leaderboards and Achievements: Players compete for high scores based on kills, survival time, and collected wreckage.

Dynamic Weather (Future Feature): Changing sea conditions such as fog and storms may affect visibility and movement.

3. Controls

W/S: Increase/decrease ship speed (throttle control)

A/D: Steer left/right (rudder control)

Mouse Movement: Rotate gun turrets

Left Mouse Button: Fire cannons (direct fire with limited range and reload time)

Right Mouse Button: Fire Missles (target must be locked before firing)

f : Fire Surfae to surface missiles

R Key: Fire Torpedos

4. Technology Stack

Frontend

React (with Cursor): UI and frontend logic

WebGL: For optimized performance and visual effects

Backend

Sonnet: Game state management and server logic

WebSockets (Socket.IO or Colyseus): Real-time player communication

PostgreSQL: Persistent storage for player stats and progression

Redis: Fast in-memory storage for session data and real-time events

Fly.io or DigitalOcean: Scalable game server hosting

5. Game Mechanics

Ship Movement

Momentum and Inertia: Ships accelerate and decelerate gradually, making navigation strategic.

Turning Speed Based on Ship Size: Larger ships turn slower but have greater stability.


Combat System

Cannons: Short to medium range, high damage, but slower reload time.

Surface to Air Missiles: Medium range, lock-on required, medium damage, can engage enemy missiles.

Surfae to Surface Miissiles: Very Long Range (extending screen), self homing, high damage

Torpedoes: Slow but devastating, ideal for large ships, can be avoided with quick maneuvers.

Ship Upgrades

Hull Durability: Improves resistance against damage.

Engine Power: Increases speed and acceleration.

Weapon Systems: Enhances fire rate, damage, and reload times.

Self Defense System: Does engage enemy missiles on its own (Later future: Flares, Close in Weapon System, Point Defence Missile System, Point Defence Laser System)

Radar & Targeting Systems: Extends enemy detection range.

Player Progression

Experience Points: Earned from battles and exploration.

Skill Tree (Future Feature): Players choose between attack-focused, defense-focused, or balanced upgrade paths.

6. Multiplayer Features

Dedicated Servers: Support for real-time player synchronization.

Team-Based Mode (Future Feature): Players can form alliances.

Voice Chat & Ping System (Future Feature): Team communication features.

AI-Controlled Ships: To keep the battlefield active if player count is low.

7. Future Enhancements

Weather Effects: Fog, rain, and storms affecting gameplay.

Day/Night Cycle: Tactical advantage changes over time.

Ship Customization: Skins, flags, and emblems.

Interactive Map: Hidden islands with supply depots.

