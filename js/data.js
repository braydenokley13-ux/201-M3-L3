/**
 * Front Office Draft v2 - Options Data with Strategic Depth
 * Synergies, Anti-Synergies, Special Combos, Character Profiles, Challenge Modes
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
        icon: "\u{1F4CA}",
        profile: {
            background: "PhD from MIT, 8 years at a hedge fund",
            personality: "Brilliant but demanding \u2014 expects world-class infrastructure",
            quote: "\u201CThe data doesn\u2019t lie. But it doesn\u2019t explain itself either.\u201D"
        }
    },
    {
        id: 2,
        name: "Sports Scientist",
        description: "Player health & injury reduction",
        cost: 2.5,
        impact: 1.5,
        category: "hire",
        tags: ["health", "people-focused", "expensive"],
        icon: "\u{1F52C}",
        profile: {
            background: "Former Olympic team physiologist",
            personality: "Passionate about player welfare, skeptical of pure analytics",
            quote: "\u201CYou can\u2019t optimize what you don\u2019t understand biologically.\u201D"
        }
    },
    {
        id: 3,
        name: "Veteran Scout",
        description: "Player trust & qualitative insight",
        cost: 1.2,
        impact: 0.8,
        category: "hire",
        tags: ["scouting", "people-focused", "traditional"],
        icon: "\u{1F50D}",
        profile: {
            background: "30 years in professional scouting, hundreds of draft picks",
            personality: "Old-school instincts, resistant to change but deeply respected",
            quote: "\u201CI\u2019ve seen more talent in a high school gym than your algorithm ever will.\u201D"
        }
    },
    {
        id: 4,
        name: "Hybrid Quant Scout",
        description: "Blend of analytics & scouting",
        cost: 1.5,
        impact: 1.2,
        category: "hire",
        tags: ["scouting", "analytics", "balanced"],
        icon: "\u{1F3AF}",
        profile: {
            background: "Former minor league player turned analytics convert",
            personality: "The bridge builder \u2014 speaks both languages fluently",
            quote: "\u201CThe best scouts use every tool available. Spreadsheets AND gut feelings.\u201D"
        }
    },
    {
        id: 5,
        name: "Machine Learning Engineer",
        description: "Predictive models & automation",
        cost: 2.0,
        impact: 1.6,
        category: "hire",
        tags: ["analytics", "tech-heavy", "automation"],
        icon: "\u{1F916}",
        profile: {
            background: "Ex-Google, built recommendation systems for millions of users",
            personality: "Moves fast, automates everything, can seem dismissive of non-technical staff",
            quote: "\u201CGive me the data and I\u2019ll find patterns no human eye can see.\u201D"
        }
    },
    {
        id: 6,
        name: "Tech Stack Upgrade",
        description: "Cleaner, faster data infrastructure",
        cost: 2.3,
        impact: 1.0,
        category: "tool",
        tags: ["infrastructure", "tech-heavy", "enabler"],
        icon: "\u{1F4BB}",
        spec: "Cloud-native platform, 10x query performance, integrates with all major data sources"
    },
    {
        id: 7,
        name: "Real-Time Data Pipeline",
        description: "In-game strategy support",
        cost: 1.8,
        impact: 0.9,
        category: "tool",
        tags: ["infrastructure", "analytics", "enabler"],
        icon: "\u26A1",
        spec: "Sub-second latency, handles 50K events/sec, feeds dashboards and models simultaneously"
    },
    {
        id: 8,
        name: "Wearable Tracking System",
        description: "Workload & recovery monitoring \u2014 most valuable with staff who can interpret the data",
        cost: 2.0,
        impact: 0.8,
        category: "tool",
        tags: ["health", "data-collection", "enabler"],
        icon: "\u231A",
        spec: "GPS, accelerometer, heart rate, sleep tracking \u2014 24/7 player monitoring"
    },
    {
        id: 9,
        name: "Culture/Communication Lead",
        description: "Department alignment & buy-in",
        cost: 0.9,
        impact: 0.5,
        category: "hire",
        tags: ["culture", "people-focused", "cheap"],
        icon: "\u{1F91D}",
        profile: {
            background: "Organizational psychologist, worked with 3 championship teams",
            personality: "The glue \u2014 makes everyone else\u2019s work better by ensuring collaboration",
            quote: "\u201CThe smartest room in the world is useless if nobody\u2019s listening.\u201D"
        }
    },
    {
        id: 10,
        name: "Player Development Analyst",
        description: "Faster improvement for young players",
        cost: 1.7,
        impact: 1.1,
        category: "hire",
        tags: ["development", "analytics", "people-focused"],
        icon: "\u{1F4C8}",
        profile: {
            background: "Sports science + data analytics double major, 5 years in player development",
            personality: "Patient, detail-oriented, obsessed with marginal gains",
            quote: "\u201CEvery player has a ceiling. My job is to raise it.\u201D"
        }
    }
];

/**
 * SYNERGIES - Combinations that work well together
 */
const SYNERGIES = [
    {
        name: "Tech Stack + Data Scientist",
        ids: [1, 6],
        bonus: 1.5,
        reason: "Great tools make great scientists even better!"
    },
    {
        name: "ML Engineer + Tech Stack",
        ids: [5, 6],
        bonus: 1.3,
        reason: "AI needs powerful infrastructure to shine"
    },
    {
        name: "Sports Scientist + Wearables",
        ids: [2, 8],
        bonus: 1.4,
        reason: "Wearable data makes injury prevention way more effective"
    },
    {
        name: "Culture Lead Boost",
        ids: [9],
        bonus: 0.7,
        minPeople: 3,
        reason: "Culture Lead makes big teams work better together"
    },
    {
        name: "Scout Combo",
        ids: [3, 4],
        bonus: 1.2,
        reason: "Traditional + Modern scouting = complete picture"
    },
    {
        name: "Data Pipeline Power",
        ids: [7, 1],
        bonus: 1.3,
        reason: "Real-time data supercharges decision-making"
    },
    {
        name: "Player Development System",
        ids: [10, 7],
        bonus: 1.0,
        reason: "Instant feedback accelerates player growth"
    }
];

/**
 * ANTI-SYNERGIES - Combinations that create friction
 */
const ANTI_SYNERGIES = [
    {
        name: "Tech Concentration",
        tags: ["tech-heavy"],
        minCount: 2,
        penalty: -0.5,
        reason: "Tech-heavy overlap \u2014 diminishing returns without diverse perspectives"
    },
    {
        name: "Old vs New Friction",
        ids: [3, 5],
        penalty: -0.6,
        reason: "The Veteran Scout and ML Engineer compete for influence on player evaluation \u2014 without a bridge, one marginalizes the other"
    },
    {
        name: "Infrastructure Redundancy",
        tags: ["infrastructure"],
        minCount: 2,
        penalty: -0.4,
        reason: "Redundant infrastructure \u2014 the overlap costs more to maintain than it\u2019s worth"
    },
    {
        name: "Top-Heavy Payroll",
        tags: ["expensive"],
        minCount: 2,
        penalty: -0.3,
        reason: "Two premium hires absorb most of your budget, leaving less for the tools and support they need"
    }
];

/**
 * SPECIAL SECRET COMBOS - Hidden powerful combinations
 */
const SECRET_COMBOS = [
    {
        name: "\u{1F3C6} The Complete Package",
        ids: [1, 6, 9],
        bonus: 2.5,
        message: "Perfect blend of analytics, infrastructure, and teamwork!"
    },
    {
        name: "\u{1F3C6} Health & Performance Lab",
        ids: [2, 8, 10],
        bonus: 2.2,
        message: "Ultimate player development and health system!"
    },
    {
        name: "\u{1F3C6} AI-Powered Scouting",
        ids: [4, 5, 7],
        bonus: 2.0,
        message: "Next-gen scouting with AI and real-time data!"
    },
    {
        name: "\u{1F3C6} Budget All-Stars",
        ids: [9, 3, 4],
        bonus: 1.8,
        message: "Amazing value! Proof you don\u2019t need to overspend!"
    }
];

/**
 * ROLE REQUIREMENTS
 */
const REQUIREMENTS = {
    minPeople: 2,
    minTools: 1,
    minTotalItems: 3,
    requiredMessage: "You need at least 2 people and 1 tool for a complete team!"
};

/**
 * Configuration Constants
 */
const CONFIG = {
    BUDGET_LIMIT: 10.0,
    SUCCESS_THRESHOLD: 7.0,
    CLAIM_CODE: "BOW-201-M3-EDGE-01"
};

/**
 * Rival GM names
 */
const RIVAL_NAMES = ["GM Martinez", "GM Chen", "GM Okafor", "GM Patel", "GM Williams"];

/**
 * Challenge Modes (unlocked after first win)
 */
const CHALLENGE_MODES = {
    standard: {
        name: "Standard",
        description: "Build the best analytics department with $10M.",
        icon: "\u{1F3E2}",
        budgetLimit: 10.0,
        hiddenTags: [],
        exactItems: null
    },
    moneyball: {
        name: "Moneyball",
        description: "Can you build a winner spending less than the competition?",
        icon: "\u{1F4B0}",
        budgetLimit: 6.5,
        hiddenTags: [],
        exactItems: null
    },
    oldschool: {
        name: "Old School",
        description: "Build a department the traditional way \u2014 no data scientists, no ML, no tech stack.",
        icon: "\u{1F4CB}",
        budgetLimit: 10.0,
        hiddenTags: ["tech-heavy"],
        exactItems: null
    },
    innovation: {
        name: "Innovation Lab",
        description: "Pure technology play \u2014 prove the machines can do it all.",
        icon: "\u{1F52C}",
        budgetLimit: 10.0,
        hiddenTags: ["people-focused", "traditional"],
        exactItems: null
    },
    fullroster: {
        name: "Full Roster",
        description: "Fill every seat. No empty desks, no wasted roles.",
        icon: "\u{1F4DD}",
        budgetLimit: 10.0,
        hiddenTags: [],
        exactItems: 6
    }
};

/**
 * Build Rating Tiers
 */
const BUILD_RATINGS = [
    { min: 9.5, tier: "Platinum", label: "Best in League", color: "#b8d4e3" },
    { min: 8.5, tier: "Gold", label: "Elite Operation", color: "#f4b223" },
    { min: 7.5, tier: "Silver", label: "Strong Department", color: "#c0c0c0" },
    { min: 7.0, tier: "Bronze", label: "Passing Grade", color: "#cd7f32" }
];

/**
 * "Why This Works" explanations per secret combo build
 */
const BUILD_EXPLANATIONS = {
    "1,6,9": "You paired a top-tier analyst with the infrastructure they need, then added a Culture Lead to ensure the rest of the organization actually adopts what analytics produces. Technology without buy-in fails. You solved both problems.",
    "2,8,10": "You built an integrated player health system. The Sports Scientist interprets Wearable data, while the Player Development Analyst turns insights into training plans. Each role feeds the next.",
    "9,3,4": "You proved smart spending beats big spending. Your scouts provide human insight, your Culture Lead keeps them aligned, and your pipeline ensures information flows in real time.",
    "3,4,5,7,9": "The most synergistic build in the game. Two secret combos and multiple synergies, while managing friction between your Veteran Scout and ML Engineer. Diversity of perspective is what makes it powerful.",
    "4,5,7": "You built a next-generation scouting operation. The Hybrid Quant Scout bridges traditional scouting and analytics, the ML Engineer provides predictive models, and the Real-Time Pipeline feeds it all live data.",
    "default": "You built a team where people and tools reinforce each other. Your synergy bonuses show where choices created value beyond their individual contributions."
};

/**
 * Ticker message templates
 */
const TICKER_MESSAGES = {
    gameStart: [
        "DRAFT DAY \u2014 All eyes on the new VP of Analytics",
        "League sources: Analytics department budget set at $10M"
    ],
    gameStartRival: [
        "DRAFT DAY \u2014 {rivalName} vs. the new VP of Analytics",
        "League sources: Two teams competing for top analytics talent"
    ],
    firstPick: [
        "BREAKING: Front office selects {itemName} with their first pick",
        "Insiders say the front office is building around {buildType}"
    ],
    synergyFound: [
        "ANALYSIS: {synergyName} combo could be a game-changer",
        "Experts note the strategic pairing in the analytics department"
    ],
    antiSynergyFound: [
        "CONCERN: Sources worry about {antiName} in the new department",
        "Former executives question the latest roster decision"
    ],
    secretCombo: [
        "BREAKING NEWS: {comboName} \u2014 analysts call this a \u2018franchise-altering\u2019 combination"
    ],
    lowBudget: [
        "SALARY CAP WATCH: Only ${remaining}M remaining in the analytics budget"
    ],
    rivalPick: [
        "{rivalName} swoops in on {itemName} \u2014 a blow to teams that had their eye on it"
    ],
    evalPass: [
        "OFFICIAL: New analytics department passes performance review with a {score} rating"
    ],
    evalFail: [
        "REPORT: Analytics department falls short of expectations \u2014 retooling expected"
    ]
};
