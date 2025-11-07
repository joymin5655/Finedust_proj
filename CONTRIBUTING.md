# 🛠️ Development Guide

## For Developers: How to Modify the Website

This guide will help you understand the codebase structure and make modifications easily.

---

## 📂 File Structure Overview

### HTML Files (Pages)

- **`index.html`** - Main landing page
- **`camera.html`** - Camera AI PM2.5 predictor page
- **`globe-enhanced.html`** - 3D globe visualization
- **`research.html`** - Research & policies page
- **`about.html`** - About page

### CSS Files (Styling)

- **`css/main.css`** - Global styles, theme system, navigation, buttons
  - CSS Variables (lines 10-75)
  - Dark mode styles (lines 489-557)
  - Theme toggle button (lines 559-752)

- **`css/camera.css`** - Camera AI page specific styles
- **`css/globe-enhanced.css`** - Globe page specific styles

### JavaScript Files (Functionality)

- **`js/theme-toggle.js`** - Dark/light mode management
  - `ThemeToggle` class handles all theme switching
  - Persists preference to localStorage

- **`js/main.js`** - Common utilities
  - Fade-in animations
  - Smooth scroll behavior

- **`js/hero-animation.js`** - Landing page particle animations
- **`js/camera.js`** - Camera AI functionality
- **`js/globe-enhanced.js`** - 3D globe logic
- **`js/data-service.js`** - API data fetching

---

## 🎨 Common Modifications

### 1. Change Colors

**Edit:** `css/main.css` (lines 11-28)

```css
:root {
  --color-primary: #25e2f4;        /* Main brand color */
  --color-secondary: #34C759;      /* Success/positive color */
  --color-danger: #FF3B30;         /* Error/warning color */

  /* Dark mode colors */
  --color-bg-dark: #000000;
  --color-text-dark: #F5F5F7;
}
```

### 2. Modify Dark Mode Styles

**Edit:** `css/main.css` (lines 489-557)

To change how elements look in dark mode:

```css
body.dark-mode .navbar {
  background: rgba(16, 33, 34, 0.72);  /* Navbar background in dark mode */
}

body.dark-mode .card {
  background: rgba(255, 255, 255, 0.05);  /* Card background in dark mode */
}
```

### 3. Adjust Dark Mode Toggle Size/Position

**Edit:** `css/main.css` (lines 562-567)

```css
.theme-toggle-container {
  position: fixed;
  top: 8px;      /* Distance from top */
  right: 24px;   /* Distance from right */
  z-index: 10000;
}
```

### 4. Change Toggle Button Size

**Edit:** `css/main.css` (lines 578-588)

```css
.toggle-cont {
  height: 32px;  /* Button height */
}

.toggle-cont .toggle-label {
  --width: 32px;  /* Button width */
  --gap: 3px;     /* Internal spacing */
}
```

### 5. Modify Landing Page Content

**Edit:** `index.html`

- **Hero section:** Lines 30-45
- **Features:** Lines 48-79
- **Statistics:** Lines 83-104

### 6. Add/Remove Navigation Items

**Edit:** `index.html` (lines 55-63)

```html
<ul class="navbar-menu">
  <li><a href="globe.html" class="navbar-link">Globe</a></li>
  <li><a href="camera.html" class="navbar-link">Camera AI</a></li>
  <!-- Add more items here -->
</ul>
```

### 7. Customize Animations

**Edit:** `js/main.js`

- **Fade-in animations:** Lines 13-35
- **Smooth scroll:** Lines 40-58

### 8. Change Theme Toggle Behavior

**Edit:** `js/theme-toggle.js`

The `ThemeToggle` class has methods you can modify:

```javascript
enableDarkMode()   // Enable dark mode
enableLightMode()  // Enable light mode
toggleTheme()      // Toggle between modes
getCurrentTheme()  // Get current theme ('dark' or 'light')
```

---

## 🔧 Adding Dark Mode to Other Pages

To add the dark mode toggle to other pages (like `camera.html`, `globe.html`):

### Step 1: Add CSS Link

```html
<link rel="stylesheet" href="css/main.css">
```

### Step 2: Add Toggle HTML

```html
<div class="theme-toggle-container">
  <div class="toggle-cont">
    <input class="toggle-input" id="theme-toggle" type="checkbox" />
    <label class="toggle-label" for="theme-toggle">
      <div class="cont-icon">
        <!-- Sparkle elements... -->
        <svg><!-- Icon SVG --></svg>
      </div>
    </label>
  </div>
</div>
```

### Step 3: Include Script

```html
<script src="js/theme-toggle.js"></script>
```

### Step 4: Add Dark Mode Styles

In your page-specific CSS, add dark mode overrides:

```css
body.dark-mode .your-element {
  background: #102122;
  color: #F5F5F7;
}
```

---

## 📱 Responsive Design

All responsive breakpoints are in `css/main.css`:

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

To modify mobile behavior:
- **Toggle button:** Lines 729-752
- **General layout:** Lines 380-406

---

## 🎯 Best Practices

### CSS Variables

Always use CSS variables for consistency:

```css
/* Good */
color: var(--color-primary);

/* Avoid */
color: #25e2f4;
```

### Dark Mode Classes

Add dark mode support to new components:

```css
.my-component {
  background: var(--color-bg);
  color: var(--color-text);
}

body.dark-mode .my-component {
  background: var(--color-bg-dark);
  color: var(--color-text-dark);
}
```

### JavaScript Modules

Keep functions modular and documented:

```javascript
/**
 * Description of what this function does
 * @param {string} param - Parameter description
 * @returns {boolean} Return value description
 */
function myFunction(param) {
  // Implementation
}
```

---

## 🐛 Troubleshooting

### Dark Mode Not Working

1. Check if `theme-toggle.js` is loaded
2. Verify toggle button has `id="theme-toggle"`
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`

### Styles Not Applying

1. Check CSS specificity
2. Verify dark mode class is on `<body>`
3. Use browser DevTools to inspect elements
4. Check for typos in class names

### Toggle Button Not Visible

1. Check z-index (should be 10000)
2. Verify position (fixed, top, right values)
3. Check if container exists in HTML

---

## 📚 Additional Resources

- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

## 💡 Quick Tips

1. **Test both themes** - Always check dark and light mode
2. **Use browser DevTools** - Inspect element styles live
3. **Comment your code** - Help future developers (including yourself!)
4. **Keep it modular** - One feature = one file when possible
5. **Mobile-first** - Test on small screens first

---

**Need help?** Open an issue on GitHub!
