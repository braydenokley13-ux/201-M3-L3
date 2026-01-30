/**
 * Front Office Draft - Main Application Logic
 */

// Application State
const state = {
    selectedOptions: [],
    totalCost: 0,
    scores: {
        totalAwa: 0,
        cultureMult: 0,
        riskPenalty: 0,
        scalabilityBonus: 0,
        finalScore: 0
    }
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
    scoreSection: document.getElementById('score-section'),
    totalAwaDisplay: document.getElementById('total-awa'),
    cultureMultDisplay: document.getElementById('culture-mult'),
    riskPenaltyDisplay: document.getElementById('risk-penalty'),
    scalabilityBonusDisplay: document.getElementById('scalability-bonus'),
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
            <div class="option-header">
                <h3 class="option-name">${option.name}</h3>
                <span class="option-cost">$${option.cost.toFixed(1)}M</span>
            </div>
            <p class="option-description">${option.description}</p>
            <div class="option-stats">
                <div class="stat">
                    <span class="stat-label">AWA</span>
                    <span class="stat-value ${option.awa > 1 ? 'positive' : ''}">${option.awa.toFixed(1)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Culture</span>
                    <span class="stat-value ${option.culture > 1.1 ? 'positive' : ''}">${option.culture.toFixed(2)}x</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Risk</span>
                    <span class="stat-value ${option.risk < 0 ? 'negative' : ''}">${option.risk.toFixed(2)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Scale</span>
                    <span class="stat-value ${option.scalability > 0.15 ? 'positive' : ''}">${option.scalability.toFixed(1)}</span>
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

    updateUI();
    saveState();
}

/**
 * Update all UI elements
 */
function updateUI() {
    updateBudgetDisplay();
    updateSelectedList();
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
            <span class="selected-item-name">${option.name}</span>
            <span class="selected-item-cost">$${option.cost.toFixed(1)}M</span>
            <button class="remove-item" onclick="toggleOption(${option.id})" title="Remove">×</button>
        </div>
    `).join('');
}

/**
 * Clear all selections
 */
function clearAllSelections() {
    if (state.selectedOptions.length === 0) return;

    if (confirm('Are you sure you want to clear all selections?')) {
        state.selectedOptions = [];
        state.totalCost = 0;
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
 * Calculate performance scores
 */
function calculateScores() {
    const selectedOptionsData = state.selectedOptions.map(id =>
        OPTIONS.find(opt => opt.id === id)
    );

    // Total AWA
    state.scores.totalAwa = selectedOptionsData.reduce((sum, opt) => sum + opt.awa, 0);

    // Culture Multiplier (average)
    const totalCulture = selectedOptionsData.reduce((sum, opt) => sum + opt.culture, 0);
    state.scores.cultureMult = selectedOptionsData.length > 0
        ? totalCulture / selectedOptionsData.length
        : 1.0;

    // Risk Penalty (sum of negative values)
    state.scores.riskPenalty = selectedOptionsData.reduce((sum, opt) => sum + opt.risk, 0);

    // Scalability Bonus
    state.scores.scalabilityBonus = selectedOptionsData.reduce((sum, opt) => sum + opt.scalability, 0);

    // Final Score = (Total AWA × Culture Multiplier) + Risk Penalty + Scalability Bonus
    state.scores.finalScore =
        (state.scores.totalAwa * state.scores.cultureMult) +
        state.scores.riskPenalty +
        state.scores.scalabilityBonus;
}

/**
 * Display scores in the sidebar
 */
function displayScores() {
    elements.scoreSection.classList.remove('hidden');

    elements.totalAwaDisplay.textContent = state.scores.totalAwa.toFixed(2);
    elements.cultureMultDisplay.textContent = state.scores.cultureMult.toFixed(2) + 'x';
    elements.riskPenaltyDisplay.textContent = state.scores.riskPenalty.toFixed(2);
    elements.scalabilityBonusDisplay.textContent = state.scores.scalabilityBonus.toFixed(2);
    elements.finalScoreDisplay.textContent = state.scores.finalScore.toFixed(2);

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
        CONFIG
    };
}
