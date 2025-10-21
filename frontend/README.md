Frontend Documentation 🚗✨
\ Documentation for the Frontend of Web-Carshowroom-Full-stack
🚀 Overview
The Frontend of Web-Carshowroom-Full-stack is built to provide an interactive and visually appealing car browsing experience. It uses React for dynamic UI components, Three.js for 3D rendering, and Framer Motion for smooth animations. The interface includes sliders for car models, detailed options, and responsive design for all devices.
Project Structure

src/: Main source code directory.
assets/: Static assets like images, fonts, and icons.
components/: Reusable React components (e.g., CarSlider, CarDetails).
pages/: Page components for routing (e.g., Home, CarModel).
styles/: CSS and Tailwind configurations for styling.
App.tsx: Main app component with routing setup.
index.tsx: Entry point for the React application.



Dependencies

@react-three/drei: 10.0.4 - For 3D rendering utilities with Three.js.
@react-three/fiber: 9.1.0 - React renderer for Three.js.
axios: 1.8.4 - For making HTTP requests to the backend.
chart.js: 4.4.8 - For rendering charts (e.g., car stats).
framer-motion: 12.6.2 - For animations and transitions.
react-chartjs-2: 5.3.0 - React wrapper for Chart.js.
react-router-dom: 7.4.1 - For client-side routing.
react: 19.0.0 - Core React library.
react-dom: 19.0.0 - React DOM for rendering.
tailwindcss: 3.4.17 - Utility-first CSS framework for styling.
three: 0.174.0 - For 3D graphics and rendering.
validator: 13.15.0 - For form input validation.
vite: 6.2.1 - Build tool for fast development.

Dev Dependencies

@eslint/js: 9.22.0 - ESLint for JavaScript linting.
@types/react-dom: 19.0.4 - TypeScript types for React DOM.
@types/react: 19.0.10 - TypeScript types for React.
@vitejs/plugin-react: 4.3.4 - Vite plugin for React support.
autoprefixer: 10.4.21 - For adding vendor prefixes to CSS.
eslint-plugin-react-hooks: 5.2.0 - ESLint rules for React hooks.
eslint-plugin-react-refresh: 0.4.19 - ESLint plugin for React Refresh.
eslint: 9.22.0 - Core ESLint for linting.
globals: 15.15.0 - Global variables for ESLint.
postcss: 8.5.3 - For CSS transformations.
typescript-eslint: 8.26.0 - ESLint for TypeScript.
typescript: 5.7.3 - TypeScript for type safety.

Setup and Usage

Navigate to the Frontend directory:
cd web-carshowroom-Frontend


Install dependencies:
npm install


Start the development server:
npm start


Open http://localhost:3000 in your browser to view the app.


Features

3D Car Models: Rendered using @react-three/fiber and three.
Interactive Sliders: Built with framer-motion for smooth transitions.
Responsive Design: Styled with tailwindcss for cross-device compatibility.
Dynamic Charts: Display car stats using react-chartjs-2.
Routing: Managed with react-router-dom for seamless navigation.

Testing

Unit Testing: Use Jest or React Testing Library for component tests.
Manual Testing: Test on different devices and browsers for responsiveness.

