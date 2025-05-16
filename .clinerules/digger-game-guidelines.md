# Digger Game Guidelines

## Brief overview
This set of guidelines focuses on the development approach for the Digger game - a cozy mining and collecting mobile game. These rules outline the preferred implementation style, code standards, and design principles to maintain consistency throughout development.

## Development priorities
- Always prioritize mobile-first responsive design for all UI components
- Implement touch-friendly controls with appropriately sized tap targets
- Optimize for short play sessions (5-10 minutes) with appropriate save points
- Focus on creating satisfying visual and audio feedback for all player interactions
- Maintain a cozy, low-pressure gameplay experience without punitive mechanics

## Implementation approach
- Use vanilla HTML, CSS, and JavaScript whenever possible
- Create modular code that separates concerns (game logic, UI, data management)
- Implement progressive enhancement for features where appropriate
- Design systems that accommodate future expansion (new resources, tools, areas)
- Prioritize performance optimization for mobile devices

## Visual design
- Maintain warm, earthy color palettes with vibrant gem highlights as described in background document
- Implement particle effects for satisfying mining feedback
- Create visually distinct mining zones while keeping the cozy aesthetic
- Use emoji-based icons for resources and items where appropriate
- Include subtle animations that enhance the gameplay experience

## Code organization
- Structure game systems into logical components (grid system, inventory, shop, progression)
- Implement resource systems with varying rarities and types
- Create clean separation between UI rendering and game state management
- Organize CSS with mobile-first principles
- Use descriptive variable and function names that reflect the game terminology

## Testing approach
- Test regularly on multiple device sizes
- Focus on touch interaction quality and responsiveness
- Ensure the game remains battery-friendly and performs well on lower-end devices
- Validate that the cozy, non-punitive design principles are maintained throughout
