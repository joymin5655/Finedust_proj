# AirLens Blueprint

## 1. Overview
**AirLens** is a Global Air Quality Intelligence Platform transitioning from a static HTML/JS multi-page application to a modern React + Supabase web platform (AirLens-web) and an iOS app. 

This document serves as the single source of truth for the ongoing migration and implementation based on **PRD v4.0** (with Supabase as the backend).

**Core Value Proposition:**
- **Glass-box AI:** Transparent data sources, uncertainties (p10-p90), and data quality scores (DQSS).
- **Causal Analysis:** Synthetic Difference-in-Differences (SDID) for policy impact.
- **Physics-ML & Gap-filling:** Satellite AOD + PINN models for regions without sensors.

---

## 2. Current Project State & Architecture
- **Initial State:** Multi-page HTML/Vanilla JS app.
- **Target State (Web):** React 18, Vite, Tailwind CSS 4, Three.js, Zustand/React Query, Supabase (Auth + Database + Edge Functions).
- **Repository Structure:** The root directory acts as the `AirLens-web` (React) workspace. The legacy Vanilla JS files are retained in the `AirLens-github` directory for historical reference and GitHub Pages continuity.

---

## 3. Implementation Plan (Migration to React + Supabase)

### Phase 0: Repository Restructuring & Environment Setup (Current)
- [x] Move legacy `.html`, `app/`, `scripts/` to `AirLens-github/` directory.
- [x] Re-establish Vite + React environment at the project root.
- [x] Install core dependencies: `react-router-dom`, `three`, `@react-three/fiber`, `zustand`, `tailwindcss`, `chart.js`, `@supabase/supabase-js`.
- [ ] Initialize Supabase project and configuration.

### Phase 1: Routing & Base Layout (Completed)
- [x] Configure `react-router-dom` for pages: Dashboard (`/`), Globe (`/globe`), Policy (`/policy`), Camera (`/camera`), About (`/about`).
- [x] Create layout components: Navigation Bar, Footer, and Theme Toggle (Glassmorphism 2.0 design).

### Phase 2: Core Features Migration (In Progress)
- [ ] **Dashboard:** Migrate real-time WAQI data fetching, location detection, and PM2.5 grading UI to React components.
- [ ] **Globe:** Migrate Three.js code to React (potentially using `@react-three/fiber` or wrapping the vanilla Three.js instance) to display PM2.5 and Satellite AOD.
- [ ] **Policy:** Migrate the 66-country SDID analysis charts to React + Chart.js.
- [ ] **Camera AI:** Migrate ONNX Runtime Web inference logic into a custom React hook.

### Phase 3: Supabase Integration (In Progress)
- [x] Initialize Supabase project and configuration.
- [x] Implement Edge Function for NASA MAIAC (MCD19A2) direct integration (`nasa-maiac-aod`).
- [x] Integrate Edge Function into `satelliteService.ts` and `airQualityService.ts`.
- [x] Update UI (`DataSourcesCard`) to display high-resolution satellite data source.
- [ ] Deploy Edge Function to production (Pending user login).
- [ ] Set up Supabase Authentication (Google, Apple, Email).
- [ ] Connect Supabase Tables for fetching `policies`, `stations`, and user profiles.

---

## 4. Design System & Styling
- **Framework:** Tailwind CSS
- **Colors:** Primary `#25e2f4` (Cyan), Dark Background `#102122`.
- **Effects:** Glassmorphism, blurred backdrops, smooth transitions.
- **Theme:** Dark mode support by default based on OS preference.
