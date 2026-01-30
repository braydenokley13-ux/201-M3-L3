# Front Office Draft

**Building on Winning — 201: Front Office Foundations · Module 3 · Lesson 3**

An interactive HTML5 activity where users build their ideal analytics and performance department within a $10M budget.

## Overview

The Front Office Draft challenges users to:
- Select hires and tools for an analytics department
- Stay within a $10M budget
- Optimize for performance metrics (AWA, culture, risk, scalability)
- Earn a claim code by meeting the performance threshold

## Features

### Interactive Experience
- **Real-time budget tracking** with visual progress bar
- **Click-to-select** interface for easy interaction
- **Dynamic scoring** with instant feedback
- **Persistent state** using localStorage
- **Responsive design** for mobile, tablet, and desktop
- **Smooth animations** and visual feedback

### Performance Metrics
The build is evaluated on four key metrics:
1. **Total AWA (Analytics Wins Added)**: Sum of impact values
2. **Culture Multiplier**: Average culture fit of selections
3. **Risk Penalty**: Sum of risk factors (negative values)
4. **Scalability Bonus**: Sum of scalability ratings

**Final Score Formula:**
```
Final Score = (Total AWA × Culture Multiplier) + Risk Penalty + Scalability Bonus
```

Meeting the performance threshold reveals the claim code: `BOW-201-M3-EDGE-01`

## Available Options

### Hires
1. **Elite Data Scientist** - $3.0M - Better models & decision support
2. **Sports Scientist** - $2.5M - Player health & injury reduction
3. **Veteran Scout** - $1.2M - Player trust & qualitative insight
4. **Hybrid Quant Scout** - $1.5M - Blend of analytics & scouting
5. **Machine Learning Engineer** - $2.0M - Predictive models & automation
6. **Culture/Communication Lead** - $0.9M - Department alignment & buy-in
7. **Player Development Analyst** - $1.7M - Faster improvement for young players

### Tools
1. **Tech Stack Upgrade** - $2.3M - Cleaner, faster data infrastructure
2. **Real-Time Data Pipeline** - $1.8M - In-game strategy support
3. **Wearable Tracking System** - $2.0M - Workload & recovery monitoring

## Project Structure

```
201-M3-L3/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # Complete styling with animations
├── js/
│   ├── data.js             # Options data and configuration
│   └── app.js              # Application logic and interactivity
├── assets/                 # (Reserved for future images/icons)
└── README.md               # This file
```

## Technical Details

### Built With
- **HTML5** - Semantic markup
- **CSS3** - Modern layouts with Grid and Flexbox
- **Vanilla JavaScript** - No frameworks, pure JS
- **Google Fonts** - Inter font family
- **LocalStorage API** - State persistence

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Zero dependencies
- Fast load time (< 1s)
- Optimized animations
- Responsive design

## Usage

### Local Development
1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No build process or server required

### Deployment
Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

Simply upload all files maintaining the directory structure.

## How to Play

1. **Read the instructions** on the welcome screen
2. **Click "START NOW"** to begin
3. **Select hires and tools** by clicking on cards
4. **Monitor your budget** in the sidebar
5. **Review your selections** in the selected items list
6. **Click "Evaluate Build"** when ready
7. **Copy the claim code** if you meet the threshold
8. **Submit the code** in the BOW Finish Form to earn XP

## Tips for Success

- Balance high-impact data scientists with cultural fits
- Don't ignore risk factors - they can sink your score
- Scalability bonuses add up quickly
- Culture multiplier affects your entire AWA total
- Use your full budget wisely
- The cheapest option isn't always the best value

## Development Notes

### State Management
The application uses a simple state object:
```javascript
state = {
    selectedOptions: [],
    totalCost: 0,
    scores: { ... }
}
```

### Debugging
Access the debug interface in browser console:
```javascript
window.draftApp.state          // Current state
window.draftApp.OPTIONS        // All options data
window.draftApp.CONFIG         // Configuration
window.draftApp.clearSavedState()  // Reset localStorage
```

### Customization
To modify the activity:
- **Change options**: Edit `js/data.js`
- **Adjust threshold**: Modify `CONFIG.SUCCESS_THRESHOLD` in `data.js`
- **Update styling**: Edit `css/styles.css`
- **Modify layout**: Update `index.html`

## Credits

**Activity Design**: Building on Winning (BOW) Program
**Course**: 201 - Front Office Foundations
**Module**: M3 - Analytics & Performance
**Lesson**: L3 - Building Your Team

**Technical Implementation**: Redesigned as modern HTML5 interactive activity

## License

This educational activity is part of the Building on Winning curriculum.

---

**Good luck. Build smart.**
