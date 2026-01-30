/**
 * Front Office Draft - Options Data
 * Based on BOW 201-M3-L3 Excel Activity
 */

const OPTIONS = [
    {
        id: 1,
        name: "Elite Data Scientist",
        description: "Better models & decision support",
        cost: 3.0,
        awa: 1.8,
        culture: 1.15,
        risk: 0.0,
        scalability: 0.1,
        category: "hire"
    },
    {
        id: 2,
        name: "Sports Scientist",
        description: "Player health & injury reduction",
        cost: 2.5,
        awa: 1.2,
        culture: 1.15,
        risk: 0.0,
        scalability: 0.2,
        category: "hire"
    },
    {
        id: 3,
        name: "Veteran Scout",
        description: "Player trust & qualitative insight",
        cost: 1.2,
        awa: 0.2,
        culture: 1.25,
        risk: -0.15,
        scalability: 0.1,
        category: "hire"
    },
    {
        id: 4,
        name: "Hybrid Quant Scout",
        description: "Blend of analytics & scouting",
        cost: 1.5,
        awa: 0.9,
        culture: 1.05,
        risk: -0.15,
        scalability: 0.2,
        category: "hire"
    },
    {
        id: 5,
        name: "Machine Learning Engineer",
        description: "Predictive models & automation",
        cost: 2.0,
        awa: 1.4,
        culture: 1.0,
        risk: -0.15,
        scalability: 0.2,
        category: "hire"
    },
    {
        id: 6,
        name: "Tech Stack Upgrade",
        description: "Cleaner, faster data infrastructure",
        cost: 2.3,
        awa: 1.0,
        culture: 1.05,
        risk: 0.0,
        scalability: 0.2,
        category: "tool"
    },
    {
        id: 7,
        name: "Real-Time Data Pipeline",
        description: "In-game strategy support",
        cost: 1.8,
        awa: 0.7,
        culture: 1.05,
        risk: -0.15,
        scalability: 0.1,
        category: "tool"
    },
    {
        id: 8,
        name: "Wearable Tracking System",
        description: "Workload & recovery monitoring",
        cost: 2.0,
        awa: 0.6,
        culture: 1.15,
        risk: -0.15,
        scalability: 0.1,
        category: "tool"
    },
    {
        id: 9,
        name: "Culture/Communication Lead",
        description: "Department alignment & buy-in",
        cost: 0.9,
        awa: 0.3,
        culture: 1.25,
        risk: 0.0,
        scalability: 0.2,
        category: "hire"
    },
    {
        id: 10,
        name: "Player Development Analyst",
        description: "Faster improvement for young players",
        cost: 1.7,
        awa: 1.0,
        culture: 1.15,
        risk: -0.15,
        scalability: 0.1,
        category: "hire"
    }
];

/**
 * Configuration Constants
 */
const CONFIG = {
    BUDGET_LIMIT: 10.0,
    SUCCESS_THRESHOLD: 5.0,  // Final score needed for claim code
    CLAIM_CODE: "BOW-201-M3-EDGE-01"
};

/**
 * Evaluation Formula:
 * 1. Total AWA = Sum of all AWA values from selected options
 * 2. Culture Multiplier = Average of culture values from selected options
 * 3. Risk Penalty = Sum of all negative risk values (already negative)
 * 4. Scalability Bonus = Sum of all scalability values
 * 5. Final Score = (Total AWA × Culture Multiplier) + Risk Penalty + Scalability Bonus
 */
