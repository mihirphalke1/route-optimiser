# Route Optimizer

An intelligent route optimization tool with interactive visualizations, powered by Dijkstra's algorithm and WebAssembly.

## Features

### Smart Trip Planner

- **Interactive Map-Based UI**: Search for and add multiple real-world locations with an intuitive interface
- **Location Search**: Integrated with OpenStreetMap's Nominatim API for global location search
- **Optimal Route Calculation**: Uses Dijkstra's algorithm to find the shortest path connecting all locations
- **Visual Route Display**: Shows the optimized route on an interactive map with numbered markers
- **Animation**: Visualizes how the algorithm discovers the route step-by-step
- **Educational Component**: Includes explanations about how the algorithm works
- **Travel Statistics**: Shows total distance and provides an ordered list of stops
- **Dark/Light Mode Support**: Fully integrated with the application theme system for comfortable viewing in any environment
- **Export and Share**: Export your optimized routes as JSON data or share them with others
- **Travel Mode Options**: Choose between driving, walking, or cycling modes

### Route Designer

- **Custom Network Creation**: Design your own network of nodes and connections
- **Weighted Paths**: Assign custom weights to connections based on distance, time, or other metrics
- **Real-time Calculation**: Instantly find the shortest path using Dijkstra's algorithm
- **Step-by-Step Visualization**: Watch how the algorithm explores the graph to find the optimal solution
- **High Performance**: Core algorithm compiled to WebAssembly for near-native speed

## Technologies Used

- **React** with TypeScript for the frontend
- **Leaflet.js** for interactive maps
- **OpenStreetMap** with Nominatim for geocoding and location search
- **OSRM** (Open Source Routing Machine) for route calculation between points
- **Dijkstra's Algorithm** for finding optimal paths
- **WebAssembly** for high-performance route calculations
- **Tailwind CSS** and **shadcn/ui** for styling
- **Vite** for fast development and bundling

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/route-optimizer.git
cd route-optimizer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

### Smart Trip Planner

1. Navigate to the Smart Trip Planner page
2. Search for locations using the search bar
3. Click on search results to add them to your trip
4. Click "Find Best Route" to calculate the optimal route
5. View the route on the map and the ordered list of stops
6. Use the animation feature to see how the algorithm works
7. Toggle between light and dark mode using the theme switcher in the header
8. Export your route as JSON or share it with the dedicated buttons
9. Switch between travel modes (driving, walking, cycling) using the mode selector

### Route Designer

1. Navigate to the Route Designer page
2. Add nodes by clicking on the map
3. Create connections between nodes
4. Set weights for connections
5. Select start and end points
6. Calculate and visualize the optimal route

## How It Works

The Smart Trip Planner uses a combination of algorithms to find the optimal route:

1. **Graph Construction**: Builds a complete graph where locations are nodes and distances between them are edge weights
2. **Distance Calculation**: Uses the OpenRouteService API to get real-world travel distances
3. **Path Finding**: Applies Dijkstra's algorithm to find the shortest path between each pair of locations
4. **Route Optimization**: Uses the Nearest Neighbor algorithm with 2-opt improvement to solve the Traveling Salesperson Problem

## Accessibility Features

- **Responsive Design**: Works on devices of all sizes
- **Keyboard Navigation**: Fully navigable using keyboard controls
- **Dark/Light Themes**: Support for different visual preferences and reduced eye strain
- **High Contrast UI**: Clear visual distinction between UI elements
- **Screen Reader Support**: Semantic HTML and ARIA attributes for assistive technologies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap contributors
- The Leaflet.js project
- OSRM project for the routing engine
