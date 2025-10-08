# HaloTables 3D Reservation Studio

HaloTables is an immersive restaurant reservation playground that lets venue owners choreograph their dining rooms in 3D while giving guests a premium drag-and-drop inspired booking experience. The app is built with React, Vite, and react-three-fiber/three.js for real-time 3D interaction.

## Features

- **Dual personas** – Switch between Owner Studio and Guest Booking to manage layout and reservations from the same scene.
- **Interactive 3D floor** – Orbit, zoom, and drag tables on a richly lit floor plan using TransformControls.
- **Table intelligence** – Configure seating, pricing, active hours, and notes per table with instant updates.
- **Guest-friendly booking** – Select tables from the 3D world or curated cards to confirm or release reservations.
- **Responsive UI** – Futuristic glassmorphism interface adapts for tablets and desktops.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts on [http://localhost:5173](http://localhost:5173). Use the persona toggle on the left to experience both workflows.

## Build for Production

```bash
npm run build
```

The production build outputs to `dist/` which can be served with any static hosting solution.
