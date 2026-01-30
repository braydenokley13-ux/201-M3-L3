/**
 * Front Office Draft - Options Data with Strategic Depth
 * Now with Synergies, Anti-Synergies, and Special Combos!
 */

const OPTIONS = [
    {
        id: 1,
        name: "Elite Data Scientist",
        description: "Better models & decision support",
        cost: 3.0,
        impact: 2.0,
        category: "hire",
        tags: ["analytics", "tech-heavy", "expensive"],
        icon: "📊"
    },
    {
        id: 2,
        name: "Sports Scientist",
        description: "Player health & injury reduction",
        cost: 2.5,
        impact: 1.5,
        category: "hire",
        tags: ["health", "people-focused", "expensive"],
        icon: "🔬"
    },
    {
        id: 3,
        name: "Veteran Scout",
        description: "Player trust & qualitative insight",
        cost: 1.2,
        impact: 0.8,
        category: "hire",
        tags: ["scouting", "people-focused", "traditional"],
        icon: "🔍"
    },
    {
        id: 4,
        name: "Hybrid Quant Scout",
        description: "Blend of analytics & scouting",
        cost: 1.5,
        impact: 1.2,
        category: "hire",
        tags: ["scouting", "analytics", "balanced"],
        icon: "🎯"
    },
    {
        id: 5,
        name: "Machine Learning Engineer",
        description: "Predictive models & automation",
        cost: 2.0,
        impact: 1.6,
        category: "hire",
        tags: ["analytics", "tech-heavy", "automation"],
        icon: "🤖"
    },
    {
        id: 6,
        name: "Tech Stack Upgrade",
        description: "Cleaner, faster data infrastructure",
        cost: 2.3,
        impact: 1.0,
        category: "tool",
        tags: ["infrastructure", "tech-heavy", "enabler"],
        icon: "💻"
    },
    {
        id: 7,
        name: "Real-Time Data Pipeline",
        description: "In-game strategy support",
        cost: 1.8,
        impact: 0.9,
        category: "tool",
        tags: ["infrastructure", "analytics", "enabler"],
        icon: "⚡"
    },
    {
        id: 8,
        name: "Wearable Tracking System",
        description: "Workload & recovery monitoring",
        cost: 2.0,
        impact: 0.7,
        category: "tool",
        tags: ["health", "data-collection", "enabler"],
        icon: "⌚"
    },
    {
        id: 9,
        name: "Culture/Communication Lead",
        description: "Department alignment & buy-in",
        cost: 0.9,
        impact: 0.5,
        category: "hire",
        tags: ["culture", "people-focused", "cheap"],
        icon: "🤝"
    },
    {
        id: 10,
        name: "Player Development Analyst",
        description: "Faster improvement for young players",
        cost: 1.7,
        impact: 1.1,
        category: "hire",
        tags: ["development", "analytics", "people-focused"],
        icon: "📈"
    }
];

/**
 * SYNERGIES - Combinations that work well together!
 * When you have both items, you get a bonus
 */
const SYNERGIES = [
    {
        name: "Tech Stack + Data Scientist",
        ids: [1, 6], // Elite Data Scientist + Tech Stack
        bonus: 1.5,
        reason: "Great tools make great scientists even better!"
    },
    {
        name: "ML Engineer + Tech Stack",
        ids: [5, 6], // ML Engineer + Tech Stack
        bonus: 1.3,
        reason: "AI needs powerful infrastructure to shine"
    },
    {
        name: "Sports Scientist + Wearables",
        ids: [2, 8], // Sports Scientist + Wearable Tracking
        bonus: 1.4,
        reason: "Wearable data makes injury prevention way more effective"
    },
    {
        name: "Culture Lead Boost",
        ids: [9], // Culture Lead with 3+ other hires
        bonus: 1.0,
        minPeople: 3,
        reason: "Culture Lead makes big teams work better together"
    },
    {
        name: "Scout Combo",
        ids: [3, 4], // Veteran Scout + Hybrid Quant Scout
        bonus: 1.2,
        reason: "Traditional + Modern scouting = complete picture"
    },
    {
        name: "Data Pipeline Power",
        ids: [7, 1], // Real-Time Pipeline + Elite Data Scientist
        bonus: 1.3,
        reason: "Real-time data supercharges decision-making"
    },
    {
        name: "Player Development System",
        ids: [10, 7], // Player Dev Analyst + Real-Time Pipeline
        bonus: 1.0,
        reason: "Instant feedback accelerates player growth"
    }
];

/**
 * ANTI-SYNERGIES - Combinations that hurt each other!
 * When you have both, you LOSE points (they conflict)
 */
const ANTI_SYNERGIES = [
    {
        name: "Too Tech-Heavy",
        tags: ["tech-heavy"],
        minCount: 3,
        penalty: -1.5,
        reason: "Too much tech, not enough people skills = poor adoption"
    },
    {
        name: "Old vs New Conflict",
        ids: [3, 5], // Veteran Scout + ML Engineer
        penalty: -0.8,
        reason: "Traditional scout clashes with AI-first approach"
    },
    {
        name: "Infrastructure Overkill",
        tags: ["infrastructure"],
        minCount: 2,
        penalty: -1.0,
        reason: "You don't need two infrastructure systems!"
    }
];

/**
 * SPECIAL SECRET COMBOS - Hidden powerful combinations!
 * These give HUGE bonuses if you discover them
 */
const SECRET_COMBOS = [
    {
        name: "🏆 The Complete Package",
        ids: [1, 6, 9], // Data Scientist + Tech Stack + Culture Lead
        bonus: 2.5,
        message: "Perfect blend of analytics, infrastructure, and teamwork!"
    },
    {
        name: "🏆 Health & Performance Lab",
        ids: [2, 8, 10], // Sports Scientist + Wearables + Player Dev
        bonus: 2.2,
        message: "Ultimate player development and health system!"
    },
    {
        name: "🏆 AI-Powered Scouting",
        ids: [4, 5, 7], // Hybrid Scout + ML Engineer + Real-Time Pipeline
        bonus: 2.0,
        message: "Next-gen scouting with AI and real-time data!"
    },
    {
        name: "🏆 Budget All-Stars",
        ids: [9, 3, 4], // Culture Lead + Veteran Scout + Hybrid Scout
        bonus: 1.8,
        message: "Amazing value! Proof you don't need to overspend!"
    }
];

/**
 * ROLE REQUIREMENTS
 * You need a BALANCED team to succeed!
 */
const REQUIREMENTS = {
    minPeople: 2,        // Must hire at least 2 people
    minTools: 1,         // Must have at least 1 tool
    minTotalItems: 3,    // Must select at least 3 things total
    requiredMessage: "You need at least 2 people and 1 tool for a complete team!"
};

/**
 * Configuration Constants
 */
const CONFIG = {
    BUDGET_LIMIT: 10.0,
    SUCCESS_THRESHOLD: 7.0,  // Raised because synergies can add a lot!
    CLAIM_CODE: "BOW-201-M3-EDGE-01"
};

/**
 * NEW SCORING FORMULA:
 * 1. Base Score = Sum of all impact values
 * 2. Add synergy bonuses
 * 3. Subtract anti-synergy penalties
 * 4. Add secret combo bonuses (if found!)
 * 5. Apply role requirement check (fail if not met)
 * 6. Final Score = Base + Synergies - Anti-Synergies + Secret Combos
 */
