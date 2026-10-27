# The Future Builder — Developer Portfolio Website

A personal portfolio website engineered for a first-year Computer Science & Engineering (CSE) student exploring software development, artificial intelligence, quantitative research, and technology entrepreneurship.

Designed around the **"The Future Builder"** aesthetic: minimal editorial layout, near-black graphite surfaces, subtle dark borders, and restrained electric lime highlights.

---

## 📁 Project Structure

```
portfolio/
├── index.html       # Semantic HTML5 layout, accessible sections & SVG graphics
├── styles.css       # Complete design system with CSS custom properties & responsive grid
├── script.js        # Interactive 3D geometric canvas, modal dialogues & copy actions
├── config.js        # Centralized personal configuration (email, handles, links)
└── README.md        # Documentation and customization guide
```

---

## 🚀 How to Run the Website

### Option 1: Direct File Opening
Double-click `index.html` or open it with your web browser (Chrome, Safari, Firefox, Edge). Because the site uses vanilla HTML, CSS, and JavaScript with zero build dependencies, it runs instantly offline or online.

### Option 2: Local HTTP Server (Recommended)
From your terminal, navigate to the portfolio directory and run Python's built-in server:

```bash
cd /Users/adityasanjeevkumar/.gemini/antigravity/scratch/portfolio
python3 -m http.server 3000
```

Then visit:
```
http://localhost:3000
```

---

## ⚙️ Customization & Replacing Placeholders

All your personal details and links can be configured in **`config.js`**:

```javascript
window.PORTFOLIO_CONFIG = {
  monogram: "AK",                          // Your initials or monogram
  statusPill: "CSE '28 // ACTIVE",         // Your batch/academic status
  email: "your.email@example.com",         // Your actual email address
  socials: {
    github: "https://github.com/your-username",      // Your GitHub URL
    linkedin: "https://linkedin.com/in/your-username", // Your LinkedIn URL
    blog: "#work"                          // URL to your blog or publication
  },
  timezone: "Asia/Kolkata",                // Your campus timezone
  timezoneLabel: "Campus Time (IST)"
};
```

### Updating Project Cards
In `index.html`, navigate to `#work`. Each project card is structured as an `<article class="project-card">`. When you add a new project:
1. Update the title and description.
2. Adjust the status badge (`in-progress`, `prototype`, or `learning`).
3. Add your technology tags.
4. When a repository or deployment URL is ready, simply wrap the footer action in an `<a>` tag with your target URL.

### Updating the "Now" Page
In `index.html`, navigate to `#now` to update what you are currently studying, building, or planning to explore next.

---

## 🎨 Design System Palette

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `--bg-base` | `#0B0D0B` | Near-black graphite background |
| `--surface` | `#141714` | Dark charcoal cards and panels |
| `--primary-text` | `#F2F3EE` | Soft white editorial headlines |
| `--secondary-text` | `#A0A69D` | Muted gray body text |
| `--accent` | `#C6FF63` | Electric lime highlights and active states |
| `--borders` | `#292E28` | Subtle dark hairline borders |

---

## ♿ Accessibility & Performance
- **Zero build dependencies**: Loads in milliseconds with minimal resource footprint.
- **Accessibility**: Includes keyboard navigation, visible focus rings, ARIA labels, semantic markup, and `aria-expanded` attributes for mobile drawer and dialogs.
- **Reduced Motion**: Automatically honors `prefers-reduced-motion: reduce` by halting canvas rotation and animations.
- **Smart GPU Usage**: The hero 3D wireframe canvas automatically pauses using `IntersectionObserver` whenever it is scrolled out of the user's viewport.

