/**
 * Front Office Draft - Main Application with Synergy System
 */

// Application State
const state = {
    selectedOptions: [],
    totalCost: 0,
    scores: {
        baseImpact: 0,
        synergyBonus: 0,
        antiSynergyPenalty: 0,
        secretComboBonus: 0,
        finalScore: 0
    },
    activeSynergies: [],
    activeAntiSynergies: [],
    secretCombos: []
};

// DOM Elements
const elements = {
    introOverlay: document.getElementById('intro-overlay'),
    startButton: document.getElementById('start-button'),
    app: document.getElementById('app'),
    optionsGrid: document.getElementById('options-grid'),
    selectedItems: document.getElementById('selected-items'),
    selectedCount: document.getElementById('selected-count'),
    remainingBudget: document.getElementById('remaining-budget'),
    totalCostDisplay: document.getElementById('total-cost'),
    budgetBar: document.getElementById('budget-bar'),
    clearButton: document.getElementById('clear-button'),
    evaluateButton: document.getElementById('evaluate-button'),
    synergyList: document.getElementById('synergy-list'),
    scoreSection: document.getElementById('score-section'),
    baseImpactDisplay: document.getElementById('base-impact'),
    synergyBonusDisplay: document.getElementById('synergy-bonus'),
    antiSynergyDisplay: document.getElementById('anti-synergy'),
    finalScoreDisplay: document.getElementById('final-score'),
    successModal: document.getElementById('success-modal'),
    failureModal: document.getElementById('failure-modal'),
    claimCode: document.getElementById('claim-code'),
    copyButton: document.getElementById('copy-button'),
    closeModalButton: document.getElementById('close-modal'),
    closeFailureModalButton: document.getElementById('close-failure-modal')
};

/**
 * Initialize the application
 */
function init() {
    renderOptions();
    attachEventListeners();
    loadSavedState();
}

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    elements.startButton.addEventListener('click', startActivity);
    elements.clearButton.addEventListener('click', clearAllSelections);
    elements.evaluateButton.addEventListener('click', evaluateBuild);
    elements.copyButton.addEventListener('click', copyClaimCode);
    elements.closeModalButton.addEventListener('click', closeSuccessModal);
    elements.closeFailureModalButton.addEventListener('click', closeFailureModal);
}

/**
 * Start the activity
 */
function startActivity() {
    elements.introOverlay.classList.remove('active');
    setTimeout(() => {
        elements.introOverlay.classList.add('hidden');
        elements.app.classList.remove('hidden');
    }, 500);
}

/**
 * Render all option cards
 */
function renderOptions() {
    elements.optionsGrid.innerHTML = OPTIONS.map(option => createOptionCard(option)).join('');

    // Attach click handlers to all cards
    document.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const optionId = parseInt(card.dataset.id);
            toggleOption(optionId);
        });
    });
}

/**
 * Create HTML for an option card
 */
function createOptionCard(option) {
    const isSelected = state.selectedOptions.includes(option.id);
    const wouldExceedBudget = !isSelected && (state.totalCost + option.cost > CONFIG.BUDGET_LIMIT);

    return `
        <div class="option-card ${isSelected ? 'selected' : ''} ${wouldExceedBudget ? 'disabled' : ''}"
             data-id="${option.id}">
            <div class="selected-badge">✓</div>
            <div class="option-icon">${option.icon}</div>
            <div class="option-header">
                <h3 class="option-name">${option.name}</h3>
                <span class="option-cost">$${option.cost.toFixed(1)}M</span>
            </div>
            <p class="option-description">${option.description}</p>
            <div class="option-stats">
                <div class="stat">
                    <span class="stat-label">Impact</span>
                    <span class="stat-value">${option.impact.toFixed(1)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Type</span>
                    <span class="stat-value">${option.category === 'hire' ? '👤 Hire' : '🔧 Tool'}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle selection of an option
 */
function toggleOption(optionId) {
    const option = OPTIONS.find(opt => opt.id === optionId);
    const isSelected = state.selectedOptions.includes(optionId);

    if (isSelected) {
        // Deselect
        state.selectedOptions = state.selectedOptions.filter(id => id !== optionId);
        state.totalCost -= option.cost;
    } else {
        // Check budget
        if (state.totalCost + option.cost > CONFIG.BUDGET_LIMIT) {
            showBudgetWarning();
            return;
        }
        // Select
        state.selectedOptions.push(optionId);
        state.totalCost += option.cost;
    }

    checkSynergies(); // Check for new synergies!
    updateUI();
    saveState();
}

/**
 * Check for synergies and anti-synergies
 */
function checkSynergies() {
    state.activeSynergies = [];
    state.activeAntiSynergies = [];
    state.secretCombos = [];

    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));

    // Check regular synergies
    SYNERGIES.forEach(synergy => {
        if (synergy.minPeople) {
            // Special case: Culture Lead needs minimum people
            const hasCultureLead = state.selectedOptions.includes(9);
            const peopleCount = selectedData.filter(opt => opt.category === 'hire').length;
            if (hasCultureLead && peopleCount >= synergy.minPeople) {
                state.activeSynergies.push(synergy);
            }
        } else {
            // Regular synergy: check if all IDs are selected
            const hasAll = synergy.ids.every(id => state.selectedOptions.includes(id));
            if (hasAll) {
                state.activeSynergies.push(synergy);
            }
        }
    });

    // Check anti-synergies
    ANTI_SYNERGIES.forEach(antiSynergy => {
        if (antiSynergy.tags) {
            // Tag-based anti-synergy
            const tagCount = selectedData.filter(opt =>
                opt.tags.some(tag => antiSynergy.tags.includes(tag))
            ).length;
            if (tagCount >= antiSynergy.minCount) {
                state.activeAntiSynergies.push(antiSynergy);
            }
        } else if (antiSynergy.ids) {
            // ID-based anti-synergy
            const hasAll = antiSynergy.ids.every(id => state.selectedOptions.includes(id));
            if (hasAll) {
                state.activeAntiSynergies.push(antiSynergy);
            }
        }
    });

    // Check secret combos
    SECRET_COMBOS.forEach(combo => {
        const hasAll = combo.ids.every(id => state.selectedOptions.includes(id));
        if (hasAll) {
            state.secretCombos.push(combo);
        }
    });
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateBudgetDisplay();
    updateSelectedList();
    updateSynergyDisplay();
    renderOptions(); // Re-render to update card states
}

/**
 * Update budget display
 */
function updateBudgetDisplay() {
    const remaining = CONFIG.BUDGET_LIMIT - state.totalCost;
    const percentage = (state.totalCost / CONFIG.BUDGET_LIMIT) * 100;

    elements.remainingBudget.textContent = `$${remaining.toFixed(1)}M`;
    elements.totalCostDisplay.textContent = `$${state.totalCost.toFixed(1)}M`;
    elements.budgetBar.style.width = `${percentage}%`;

    // Update colors based on budget usage
    elements.remainingBudget.className = 'budget-value';
    elements.budgetBar.className = 'budget-bar';

    if (percentage > 90) {
        elements.remainingBudget.classList.add('danger');
        elements.budgetBar.classList.add('danger');
    } else if (percentage > 70) {
        elements.remainingBudget.classList.add('warning');
        elements.budgetBar.classList.add('warning');
    }
}

/**
 * Update selected items list
 */
function updateSelectedList() {
    elements.selectedCount.textContent = `(${state.selectedOptions.length})`;

    if (state.selectedOptions.length === 0) {
        elements.selectedItems.innerHTML = '<p class="empty-state">No items selected yet</p>';
        return;
    }

    const selectedOptionsData = state.selectedOptions.map(id =>
        OPTIONS.find(opt => opt.id === id)
    );

    elements.selectedItems.innerHTML = selectedOptionsData.map(option => `
        <div class="selected-item">
            <span class="selected-item-icon">${option.icon}</span>
            <span class="selected-item-name">${option.name}</span>
            <span class="selected-item-cost">$${option.cost.toFixed(1)}M</span>
            <button class="remove-item" onclick="toggleOption(${option.id})" title="Remove">×</button>
        </div>
    `).join('');
}

/**
 * Update synergy display
 */
function updateSynergyDisplay() {
    if (state.activeSynergies.length === 0 && state.activeAntiSynergies.length === 0 && state.secretCombos.length === 0) {
        elements.synergyList.innerHTML = '<p class="empty-state">Pick smart combos to unlock bonuses!</p>';
        return;
    }

    let html = '';

    // Show secret combos first (most exciting!)
    state.secretCombos.forEach(combo => {
        html += `
            <div class="synergy-item secret-combo">
                <div class="synergy-header">
                    <span class="synergy-name">${combo.name}</span>
                    <span class="synergy-bonus">+${combo.bonus.toFixed(1)}</span>
                </div>
                <p class="synergy-reason">${combo.message}</p>
            </div>
        `;
    });

    // Show regular synergies
    state.activeSynergies.forEach(synergy => {
        html += `
            <div class="synergy-item positive">
                <div class="synergy-header">
                    <span class="synergy-name">✨ ${synergy.name}</span>
                    <span class="synergy-bonus">+${synergy.bonus.toFixed(1)}</span>
                </div>
                <p class="synergy-reason">${synergy.reason}</p>
            </div>
        `;
    });

    // Show anti-synergies (warnings)
    state.activeAntiSynergies.forEach(antiSynergy => {
        html += `
            <div class="synergy-item negative">
                <div class="synergy-header">
                    <span class="synergy-name">⚠️ ${antiSynergy.name}</span>
                    <span class="synergy-bonus">${antiSynergy.penalty.toFixed(1)}</span>
                </div>
                <p class="synergy-reason">${antiSynergy.reason}</p>
            </div>
        `;
    });

    elements.synergyList.innerHTML = html;
}

/**
 * Clear all selections
 */
function clearAllSelections() {
    if (state.selectedOptions.length === 0) return;

    if (confirm('Are you sure you want to clear all selections?')) {
        state.selectedOptions = [];
        state.totalCost = 0;
        state.activeSynergies = [];
        state.activeAntiSynergies = [];
        state.secretCombos = [];
        elements.scoreSection.classList.add('hidden');
        updateUI();
        saveState();
    }
}

/**
 * Evaluate the current build
 */
function evaluateBuild() {
    if (state.selectedOptions.length === 0) {
        alert('Please select at least one option to evaluate your build.');
        return;
    }

    // Check requirements
    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));
    const peopleCount = selectedData.filter(opt => opt.category === 'hire').length;
    const toolCount = selectedData.filter(opt => opt.category === 'tool').length;

    if (peopleCount < REQUIREMENTS.minPeople || toolCount < REQUIREMENTS.minTools) {
        alert(REQUIREMENTS.requiredMessage);
        showFailureModal();
        return;
    }

    calculateScores();
    displayScores();

    // Check if build meets threshold
    if (state.scores.finalScore >= CONFIG.SUCCESS_THRESHOLD) {
        showSuccessModal();
    } else {
        showFailureModal();
    }
}

/**
 * Calculate performance scores with new system
 */
function calculateScores() {
    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));

    // Base Impact
    state.scores.baseImpact = selectedData.reduce((sum, opt) => sum + opt.impact, 0);

    // Synergy Bonus
    state.scores.synergyBonus = state.activeSynergies.reduce((sum, synergy) => sum + synergy.bonus, 0);

    // Secret Combo Bonus
    state.scores.secretComboBonus = state.secretCombos.reduce((sum, combo) => sum + combo.bonus, 0);

    // Total synergy (including secret combos)
    const totalSynergyBonus = state.scores.synergyBonus + state.scores.secretComboBonus;

    // Anti-Synergy Penalty
    state.scores.antiSynergyPenalty = state.activeAntiSynergies.reduce((sum, anti) => sum + anti.penalty, 0);

    // Final Score
    state.scores.finalScore = state.scores.baseImpact + totalSynergyBonus + state.scores.antiSynergyPenalty;
}

/**
 * Display scores in the sidebar
 */
function displayScores() {
    elements.scoreSection.classList.remove('hidden');

    const totalSynergyBonus = state.scores.synergyBonus + state.scores.secretComboBonus;

    elements.baseImpactDisplay.textContent = state.scores.baseImpact.toFixed(1);
    elements.synergyBonusDisplay.textContent = '+' + totalSynergyBonus.toFixed(1);
    elements.antiSynergyDisplay.textContent = state.scores.antiSynergyPenalty.toFixed(1);
    elements.finalScoreDisplay.textContent = state.scores.finalScore.toFixed(1);

    // Animate final score
    elements.finalScoreDisplay.parentElement.classList.add('pulse');
    setTimeout(() => {
        elements.finalScoreDisplay.parentElement.classList.remove('pulse');
    }, 500);
}

/**
 * Show success modal with claim code
 */
function showSuccessModal() {
    elements.claimCode.textContent = CONFIG.CLAIM_CODE;
    elements.successModal.classList.remove('hidden');
}

/**
 * Show failure modal
 */
function showFailureModal() {
    elements.failureModal.classList.remove('hidden');
}

/**
 * Close success modal
 */
function closeSuccessModal() {
    elements.successModal.classList.add('hidden');
}

/**
 * Close failure modal
 */
function closeFailureModal() {
    elements.failureModal.classList.add('hidden');
}

/**
 * Copy claim code to clipboard
 */
function copyClaimCode() {
    const code = elements.claimCode.textContent;

    navigator.clipboard.writeText(code).then(() => {
        // Show feedback
        const originalHTML = elements.copyButton.innerHTML;
        elements.copyButton.innerHTML = '✓';
        elements.copyButton.style.background = 'var(--success-green)';

        setTimeout(() => {
            elements.copyButton.innerHTML = originalHTML;
            elements.copyButton.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please manually copy: ' + code);
    });
}

/**
 * Show budget warning
 */
function showBudgetWarning() {
    alert('This selection would exceed your $10M budget. Remove some items first.');
}

/**
 * Save state to localStorage
 */
function saveState() {
    try {
        localStorage.setItem('frontOfficeDraft', JSON.stringify({
            selectedOptions: state.selectedOptions,
            totalCost: state.totalCost
        }));
    } catch (e) {
        console.warn('Could not save state:', e);
    }
}

/**
 * Load saved state from localStorage
 */
function loadSavedState() {
    try {
        const saved = localStorage.getItem('frontOfficeDraft');
        if (saved) {
            const data = JSON.parse(saved);
            state.selectedOptions = data.selectedOptions || [];
            state.totalCost = data.totalCost || 0;
            checkSynergies();
            updateUI();
        }
    } catch (e) {
        console.warn('Could not load saved state:', e);
    }
}

/**
 * Clear saved state (for testing)
 */
function clearSavedState() {
    localStorage.removeItem('frontOfficeDraft');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.draftApp = {
        state,
        clearSavedState,
        calculateScores,
        OPTIONS,
        CONFIG,
        SYNERGIES,
        ANTI_SYNERGIES,
        SECRET_COMBOS
    };
}
