# SteelBuild Planner

SteelBuild Planner is a static, front-end project that helps teams scope and estimate pre-engineered steel building
projects. It includes a fast estimator, automated scope checklist, and a delivery roadmap so that early planning and
client conversations are grounded in realistic assumptions.

## Features

- **Estimator dashboard** that calculates floor area, roof area, steel weight, and budget range.
- **Scope checklist** that adapts to insulation, roof type, crane requirements, and fire ratings.
- **Timeline breakdown** that outlines design, fabrication, foundations, and erection phases.
- **Responsive UI** designed for desktop and mobile planning sessions.

## Project Structure

```
.
├── css/
│   └── style.css
├── js/
│   └── main.js
├── index.html
└── README.md
```

## Getting Started

Because the project is static, you can open `index.html` directly in your browser or run a local web server for a more
realistic environment.

### Option 1: Open the file directly

Double-click `index.html` or drag it into your browser.

### Option 2: Run a simple local server

```bash
python -m http.server 5500
```

Then visit `http://127.0.0.1:5500` in your browser.

## How the Estimator Works

1. **Inputs**: Length, width, height, roof pitch, bay count, use case, roof system, insulation, and optional upgrades.
2. **Cost model**: Uses a base cost per square foot and multipliers for the selected options.
3. **Outputs**: A budget range with contingency, plus a timeline and scope checklist for planning conversations.

> Note: This tool is educational and for preliminary planning only. Always validate project requirements with licensed
> engineers and local code officials.
