# Changelog

All notable changes to the Digger game project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Mobile-first responsive layout
- Touch controls optimization
- Visual and audio enhancements
- See [tasklist.md](tasklist.md) for complete planned features

## [0.2.0] - 2025-05-18

### Added
- Implemented digging grid system
- Added resource collection system
- Created inventory management
- Implemented shop system (placeholder)
- Added layer progression mechanics

### Changed
- Refactored JavaScript code to use ES6 modules
- Created modular code structure for better maintainability:
  - gameState.js: Game state and configuration
  - resources.js: Resource generation and management
  - grid.js: Grid generation and cell interaction
  - ui.js: UI elements and notifications
  - inventory.js: Inventory system
  - main.js: Entry point that connects all modules
- Updated the game initialization process
- Improved file organization

### Removed
- Deleted monolithic JavaScript files (game.js, inventory.js)

### Technical
- Implemented ES6 module pattern
- Used proper import/export syntax
- Created clean separation of concerns

## [0.1.0] - 2025-05-16

### Added
- Initial project setup
- Basic file structure
- Project documentation
  - README.md with project overview
  - MIT License
  - CHANGELOG.md
  - Background design document
  - Development task list
- Basic HTML structure
- Initial CSS styling framework
- Core JavaScript file

### Technical
- Mobile-first CSS approach
- Vanilla HTML/CSS/JS implementation
- Project file organization
