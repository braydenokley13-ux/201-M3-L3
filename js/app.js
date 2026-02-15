/**
 * Front Office Draft v2 - Main Application
 * Complete game logic with all v2 features
 */

// Copy button SVG stored once for debounce fix
const COPY_BUTTON_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

// Application State
const state = {
    selectedOptions: [],
    totalCost: 0,
    scores: { baseImpact: 0, synergyBonus: 0, antiSynergyPenalty: 0, secretComboBonus: 0, finalScore: 0 },
    activeSynergies: [],
    activeAntiSynergies: [],
    secretCombos: [],
    hasEvaluated: false,
    firstSynergyDiscovered: false,
    isCopying: false,
    clearConfirmPending: false,
    clearConfirmTimer: null,
    // Rival GM
    rivalEnabled: false,
    rivalName: '',
    rivalPicks: [],
    // Challenge mode
    challengeMode: 'standard',
    activeBudgetLimit: CONFIG.BUDGET_LIMIT,
    // Timeline
    draftHistory: [],
    pickCounter: 0,
    // Discovery
    discoveredCombos: [],
    // Ticker
    tickerVisible: true,
    tickerMessages: []
};

// Persistent state (localStorage)
let persistent = {
    hasWon: false,
    bestScore: 0,
    bestRating: '',
    winningBuilds: [],
    discoveredCombos: [],
    challengesCompleted: [],
    gmNotes: '',
    rivalPref: false,
    tickerPref: true
};

// DOM Elements
const elements = {};

function cacheElements() {
    const ids = [
        'intro-overlay', 'start-button', 'back-to-home', 'app', 'options-grid', 'selected-items',
        'selected-count', 'remaining-budget', 'total-cost', 'budget-bar', 'budget-limit-display',
        'clear-button', 'evaluate-button', 'synergy-list', 'score-section',
        'base-impact', 'synergy-bonus', 'anti-synergy', 'final-score',
        'success-modal', 'failure-modal', 'claim-code', 'copy-button',
        'close-modal', 'close-failure-modal', 'rival-toggle', 'rival-badge',
        'challenge-badge', 'challenge-modes-section', 'challenge-grid',
        'combos-found-count', 'discovery-list', 'scoring-info-toggle', 'scoring-info-content',
        'notes-toggle', 'notes-content', 'gm-notes', 'notes-count',
        'what-if-button', 'what-if-panel', 'swap-remove', 'swap-add',
        'swap-preview', 'swap-delta', 'swap-details', 'apply-swap', 'cancel-swap',
        'stale-score-notice', 'draft-timeline', 'draft-ticker', 'ticker-content', 'ticker-close',
        'confetti-container', 'build-rating', 'rating-tier', 'rating-label',
        'success-score', 'personal-best', 'why-explanation', 'why-section',
        'efficiency-section', 'efficiency-message', 'build-counter', 'next-tier-hint',
        'challenge-prompt', 'failure-title', 'failure-subtitle',
        'proximity-section', 'proximity-bar', 'proximity-score-label',
        'near-miss-message', 'hint-list'
    ];
    ids.forEach(id => {
        const camelId = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        elements[camelId] = document.getElementById(id);
    });
}

/** Initialize */
function init() {
    cacheElements();
    loadPersistent();
    renderOptions();
    attachEventListeners();
    loadSavedState();
    renderDiscoveryTracker();
    renderChallengeModes();
    loadGMNotes();
    initTicker();
}

/** Attach all event listeners */
function attachEventListeners() {
    elements.startButton.addEventListener('click', startActivity);
    if (elements.backToHome) elements.backToHome.addEventListener('click', backToHome);
    elements.clearButton.addEventListener('click', handleClearAll);
    elements.evaluateButton.addEventListener('click', evaluateBuild);
    elements.copyButton.addEventListener('click', copyClaimCode);
    elements.closeModal.addEventListener('click', closeSuccessModal);
    elements.closeFailureModal.addEventListener('click', closeFailureModal);

    // Collapsible sections
    elements.scoringInfoToggle.addEventListener('click', () => toggleCollapsible('scoringInfoToggle', 'scoringInfoContent'));
    elements.notesToggle.addEventListener('click', () => toggleCollapsible('notesToggle', 'notesContent'));

    // GM Notes
    const notesEl = elements.gmNotes;
    if (notesEl) {
        notesEl.addEventListener('input', () => {
            elements.notesCount.textContent = notesEl.value.length;
        });
        notesEl.addEventListener('blur', saveGMNotes);
        let notesSaveTimer;
        notesEl.addEventListener('input', () => {
            clearTimeout(notesSaveTimer);
            notesSaveTimer = setTimeout(saveGMNotes, 5000);
        });
    }

    // What-If
    if (elements.whatIfButton) elements.whatIfButton.addEventListener('click', openWhatIf);
    if (elements.cancelSwap) elements.cancelSwap.addEventListener('click', closeWhatIf);
    if (elements.applySwap) elements.applySwap.addEventListener('click', applySwap);
    if (elements.swapRemove) elements.swapRemove.addEventListener('change', previewSwap);
    if (elements.swapAdd) elements.swapAdd.addEventListener('change', previewSwap);

    // Ticker close
    if (elements.tickerClose) elements.tickerClose.addEventListener('click', hideTicker);

    // Keyboard: close modals with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!elements.successModal.classList.contains('hidden')) closeSuccessModal();
            if (!elements.failureModal.classList.contains('hidden')) closeFailureModal();
        }
    });

    // Rival toggle
    if (elements.rivalToggle) {
        elements.rivalToggle.checked = persistent.rivalPref;
        elements.rivalToggle.addEventListener('change', () => {
            persistent.rivalPref = elements.rivalToggle.checked;
            savePersistent();
        });
    }
}

/** Start the activity */
function startActivity() {
    // Set rival
    state.rivalEnabled = elements.rivalToggle ? elements.rivalToggle.checked : false;
    if (state.rivalEnabled) {
        state.rivalName = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
        elements.rivalBadge.textContent = 'vs. ' + state.rivalName;
        elements.rivalBadge.classList.remove('hidden');
    }

    // Set challenge mode
    const selectedChallenge = document.querySelector('.challenge-card.selected');
    if (selectedChallenge) {
        state.challengeMode = selectedChallenge.dataset.mode;
    } else {
        state.challengeMode = 'standard';
    }

    const mode = CHALLENGE_MODES[state.challengeMode];
    state.activeBudgetLimit = mode.budgetLimit;

    if (state.challengeMode !== 'standard') {
        elements.challengeBadge.textContent = mode.icon + ' ' + mode.name;
        elements.challengeBadge.classList.remove('hidden');
    }

    elements.budgetLimitDisplay.textContent = '$' + state.activeBudgetLimit.toFixed(1) + 'M';

    elements.introOverlay.classList.remove('active');
    setTimeout(() => {
        elements.introOverlay.classList.add('hidden');
        elements.app.classList.remove('hidden');
    }, 500);

    // Ticker start messages
    if (state.rivalEnabled) {
        addTickerMessage(TICKER_MESSAGES.gameStartRival[0].replace('{rivalName}', state.rivalName));
    } else {
        addTickerMessage(TICKER_MESSAGES.gameStart[0]);
    }
    addTickerMessage(TICKER_MESSAGES.gameStart[1]);

    renderOptions();
    updateBudgetDisplay();
}

/** Back to home / intro screen */
function backToHome() {
    // Clear session state so intro overlay works fresh
    localStorage.removeItem('frontOfficeDraft');
    // Reset runtime state
    clearAllSelections();
    state.rivalEnabled = false;
    state.rivalName = '';
    state.challengeMode = 'standard';
    state.activeBudgetLimit = CONFIG.BUDGET_LIMIT;
    state.tickerMessages = [];
    if (elements.tickerContent) elements.tickerContent.innerHTML = '';
    // Hide game, show intro
    elements.app.classList.add('hidden');
    elements.rivalBadge.classList.add('hidden');
    elements.challengeBadge.classList.add('hidden');
    elements.introOverlay.classList.remove('hidden');
    elements.introOverlay.classList.add('active');
    // Re-render challenge modes (in case player has won since)
    renderChallengeModes();
}

// ========================
// TOAST SYSTEM
// ========================
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    const icons = { info: '\u2139\uFE0F', warning: '\u26A0\uFE0F', error: '\u274C', success: '\u2705' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '') + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ========================
// TICKER SYSTEM
// ========================
function initTicker() {
    state.tickerVisible = persistent.tickerPref;
    if (!state.tickerVisible && elements.draftTicker) {
        elements.draftTicker.classList.add('ticker-hidden');
    }
}

function addTickerMessage(msg) {
    if (!elements.tickerContent || !state.tickerVisible) return;
    state.tickerMessages.push(msg);
    const span = document.createElement('span');
    span.className = 'ticker-message flash';
    span.textContent = msg;
    elements.tickerContent.appendChild(span);
    // Keep max 8 messages
    while (elements.tickerContent.children.length > 8) {
        elements.tickerContent.removeChild(elements.tickerContent.firstChild);
    }
}

function hideTicker() {
    if (elements.draftTicker) elements.draftTicker.classList.add('ticker-hidden');
    state.tickerVisible = false;
    persistent.tickerPref = false;
    savePersistent();
}

// ========================
// RENDERING
// ========================

function getAvailableOptions() {
    const mode = CHALLENGE_MODES[state.challengeMode];
    if (!mode || !mode.hiddenTags || mode.hiddenTags.length === 0) return OPTIONS;
    return OPTIONS.filter(opt => !opt.tags.some(tag => mode.hiddenTags.includes(tag)));
}

function renderOptions() {
    const available = getAvailableOptions();
    elements.optionsGrid.innerHTML = available.map(option => createOptionCard(option)).join('');

    // Attach click handlers and keyboard
    document.querySelectorAll('.option-card').forEach(card => {
        const optionId = parseInt(card.dataset.id);

        card.addEventListener('click', (e) => {
            if (card.classList.contains('rival-taken')) return;
            // Mobile info button
            if (e.target.closest('.card-info-btn')) {
                const overlay = card.querySelector('.profile-overlay');
                if (overlay) overlay.classList.toggle('mobile-visible');
                return;
            }
            toggleOption(optionId);
        });

        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!card.classList.contains('rival-taken')) toggleOption(optionId);
            }
        });
    });
}

function createOptionCard(option) {
    const isSelected = state.selectedOptions.includes(option.id);
    const isRivalTaken = state.rivalPicks.includes(option.id);
    const wouldExceedBudget = !isSelected && !isRivalTaken && (state.totalCost + option.cost > state.activeBudgetLimit);

    let classes = 'option-card';
    if (isSelected) classes += ' selected';
    if (wouldExceedBudget) classes += ' disabled';
    if (isRivalTaken) classes += ' rival-taken';

    let profileHTML = '';
    if (option.profile) {
        profileHTML = '<div class="profile-overlay">' +
            '<div class="profile-background">' + option.profile.background + '</div>' +
            '<div class="profile-personality">' + option.profile.personality + '</div>' +
            '<div class="profile-quote">' + option.profile.quote + '</div>' +
            '</div>' +
            '<button class="card-info-btn" aria-label="Show profile">i</button>';
    } else if (option.spec) {
        profileHTML = '<div class="profile-overlay">' +
            '<div class="profile-spec">' + option.spec + '</div>' +
            '</div>' +
            '<button class="card-info-btn" aria-label="Show specs">i</button>';
    }

    let rivalHTML = '';
    if (isRivalTaken) {
        rivalHTML = '<div class="rival-overlay"><span class="rival-overlay-text">Taken by ' + state.rivalName + '</span></div>';
    }

    return '<div class="' + classes + '" data-id="' + option.id + '" ' +
        'tabindex="0" role="button" aria-pressed="' + isSelected + '">' +
        rivalHTML +
        '<div class="selected-badge">\u2713</div>' +
        '<div class="option-icon">' + option.icon + '</div>' +
        '<div class="option-header">' +
            '<h3 class="option-name">' + option.name + '</h3>' +
            '<span class="option-cost">$' + option.cost.toFixed(1) + 'M</span>' +
        '</div>' +
        '<p class="option-description">' + option.description + '</p>' +
        '<div class="option-stats">' +
            '<div class="stat"><span class="stat-label">Impact</span><span class="stat-value">' + option.impact.toFixed(1) + '</span></div>' +
            '<div class="stat"><span class="stat-label">Type</span><span class="stat-value">' + (option.category === 'hire' ? '\u{1F464} Hire' : '\u{1F527} Tool') + '</span></div>' +
        '</div>' +
        profileHTML +
    '</div>';
}

// ========================
// CORE GAME LOGIC
// ========================

function toggleOption(optionId) {
    const option = OPTIONS.find(opt => opt.id === optionId);
    if (!option) return;
    if (state.rivalPicks.includes(optionId)) return;

    const isSelected = state.selectedOptions.includes(optionId);

    if (isSelected) {
        // Deselect
        state.selectedOptions = state.selectedOptions.filter(id => id !== optionId);
        state.totalCost -= option.cost;
        // Mark as removed in timeline
        const entry = state.draftHistory.find(h => h.id === optionId && !h.removed);
        if (entry) entry.removed = true;
    } else {
        // Check budget
        if (state.totalCost + option.cost > state.activeBudgetLimit) {
            const remaining = (state.activeBudgetLimit - state.totalCost).toFixed(1);
            showToast('Over budget \u2014 ' + option.name + ' costs $' + option.cost.toFixed(1) + 'M but you only have $' + remaining + 'M left.', 'warning');
            return;
        }
        // Select
        state.selectedOptions.push(optionId);
        state.totalCost += option.cost;
        state.pickCounter++;
        state.draftHistory.push({ id: optionId, pick: state.pickCounter, removed: false, isRival: false });

        // Ticker: first pick
        if (state.selectedOptions.length === 1) {
            const buildType = option.category === 'hire' ? 'people' : 'technology';
            addTickerMessage(TICKER_MESSAGES.firstPick[0].replace('{itemName}', option.name));
            addTickerMessage(TICKER_MESSAGES.firstPick[1].replace('{buildType}', buildType));
        }

        // Low budget warning ticker
        const remaining = state.activeBudgetLimit - state.totalCost;
        if (remaining < 3.0 && remaining > 0) {
            addTickerMessage(TICKER_MESSAGES.lowBudget[0].replace('${remaining}', remaining.toFixed(1)));
        }

        // Rival GM makes a pick
        if (state.rivalEnabled) {
            rivalMakePick();
        }
    }

    // Stale score handling
    if (state.hasEvaluated) {
        state.hasEvaluated = false;
        elements.scoreSection.classList.add('hidden');
        elements.staleScoreNotice.classList.remove('hidden');
        closeWhatIf();
    }

    const prevSynergies = state.activeSynergies.map(s => s.name);
    const prevAntiSynergies = state.activeAntiSynergies.map(s => s.name);
    const prevSecrets = state.secretCombos.map(s => s.name);

    checkSynergies();

    // Detect new synergies for ticker and first-synergy note
    const newSynergies = state.activeSynergies.filter(s => !prevSynergies.includes(s.name));
    const newAntiSynergies = state.activeAntiSynergies.filter(s => !prevAntiSynergies.includes(s.name));
    const newSecrets = state.secretCombos.filter(s => !prevSecrets.includes(s.name));

    if (newSynergies.length > 0 && !state.firstSynergyDiscovered) {
        state.firstSynergyDiscovered = true;
    }

    newSynergies.forEach(s => {
        addTickerMessage(TICKER_MESSAGES.synergyFound[0].replace('{synergyName}', s.name));
    });
    newAntiSynergies.forEach(s => {
        addTickerMessage(TICKER_MESSAGES.antiSynergyFound[0].replace('{antiName}', s.name));
    });
    newSecrets.forEach(s => {
        // Track discovery
        if (!persistent.discoveredCombos.includes(s.name)) {
            persistent.discoveredCombos.push(s.name);
            savePersistent();
            renderDiscoveryTracker();
        }
        addTickerMessage(TICKER_MESSAGES.secretCombo[0].replace('{comboName}', s.name));
    });

    updateUI();
    renderTimeline();
    saveState();
}

/** Rival GM picks an item */
function rivalMakePick() {
    const taken = [...state.selectedOptions, ...state.rivalPicks];
    const available = getAvailableOptions().filter(opt => !taken.includes(opt.id));
    if (available.length === 0) return;

    // Sort by impact/cost ratio
    const sorted = available.slice().sort((a, b) => (b.impact / b.cost) - (a.impact / a.cost));
    // 70% best, 30% second best
    let pick;
    if (sorted.length >= 2 && Math.random() > 0.7) {
        pick = sorted[1];
    } else {
        pick = sorted[0];
    }

    state.rivalPicks.push(pick.id);
    state.pickCounter++;
    state.draftHistory.push({ id: pick.id, pick: state.pickCounter, removed: false, isRival: true });

    showToast(state.rivalName + ' drafts ' + pick.name + '.', 'info', 3000);
    addTickerMessage(TICKER_MESSAGES.rivalPick[0].replace('{rivalName}', state.rivalName).replace('{itemName}', pick.name));
}

/** Check synergies, anti-synergies, secret combos */
function checkSynergies() {
    state.activeSynergies = [];
    state.activeAntiSynergies = [];
    state.secretCombos = [];

    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));

    SYNERGIES.forEach(synergy => {
        if (synergy.minPeople) {
            const hasCultureLead = state.selectedOptions.includes(9);
            const peopleCount = selectedData.filter(opt => opt.category === 'hire').length;
            if (hasCultureLead && peopleCount >= synergy.minPeople) {
                state.activeSynergies.push(synergy);
            }
        } else {
            if (synergy.ids.every(id => state.selectedOptions.includes(id))) {
                state.activeSynergies.push(synergy);
            }
        }
    });

    ANTI_SYNERGIES.forEach(anti => {
        if (anti.tags) {
            const tagCount = selectedData.filter(opt => opt.tags.some(tag => anti.tags.includes(tag))).length;
            if (tagCount >= anti.minCount) {
                state.activeAntiSynergies.push(anti);
            }
        } else if (anti.ids) {
            if (anti.ids.every(id => state.selectedOptions.includes(id))) {
                state.activeAntiSynergies.push(anti);
            }
        }
    });

    SECRET_COMBOS.forEach(combo => {
        if (combo.ids.every(id => state.selectedOptions.includes(id))) {
            state.secretCombos.push(combo);
        }
    });
}

// ========================
// UI UPDATES
// ========================

function updateUI() {
    updateBudgetDisplay();
    updateSelectedList();
    updateSynergyDisplay();
    renderOptions();
}

function updateBudgetDisplay() {
    const remaining = state.activeBudgetLimit - state.totalCost;
    const percentage = (state.totalCost / state.activeBudgetLimit) * 100;

    elements.remainingBudget.textContent = '$' + remaining.toFixed(1) + 'M';
    elements.totalCost.textContent = '$' + state.totalCost.toFixed(1) + 'M';
    elements.budgetBar.style.width = percentage + '%';

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

function updateSelectedList() {
    elements.selectedCount.textContent = '(' + state.selectedOptions.length + ')';

    if (state.selectedOptions.length === 0) {
        elements.selectedItems.innerHTML = '<p class="empty-state">Click a card to start building your department.</p>';
        return;
    }

    const items = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));
    elements.selectedItems.innerHTML = items.map(option =>
        '<div class="selected-item">' +
            '<span class="selected-item-icon">' + option.icon + '</span>' +
            '<span class="selected-item-name">' + option.name + '</span>' +
            '<span class="selected-item-cost">$' + option.cost.toFixed(1) + 'M</span>' +
            '<button class="remove-item" onclick="toggleOption(' + option.id + ')" title="Remove" aria-label="Remove ' + option.name + '">\u00D7</button>' +
        '</div>'
    ).join('');
}

function updateSynergyDisplay() {
    const total = state.activeSynergies.length + state.activeAntiSynergies.length + state.secretCombos.length;

    if (state.selectedOptions.length === 0) {
        elements.synergyList.innerHTML = '<p class="empty-state">Select more items to see how they interact.</p>';
        return;
    }

    if (total === 0) {
        if (state.selectedOptions.length === 1) {
            elements.synergyList.innerHTML = '<p class="empty-state">Select more items to see how they interact.</p>';
        } else {
            elements.synergyList.innerHTML = '<p class="empty-state">No bonuses or conflicts yet. Keep building.</p>';
        }
        return;
    }

    let html = '';
    const isNewSecret = (name) => !persistent.discoveredCombos.includes(name) ||
        persistent.discoveredCombos.indexOf(name) === persistent.discoveredCombos.length; // always show reveal

    // Secret combos
    state.secretCombos.forEach(combo => {
        html += '<div class="synergy-item secret-combo secret-reveal">' +
            '<div class="synergy-header">' +
                '<span class="synergy-name">' + combo.name + '</span>' +
                '<span class="synergy-bonus">+' + combo.bonus.toFixed(1) + '</span>' +
            '</div>' +
            '<p class="synergy-reason">' + combo.message + '</p>' +
        '</div>';
    });

    // Regular synergies
    state.activeSynergies.forEach((synergy, i) => {
        let extra = '';
        if (i === 0 && state.firstSynergyDiscovered && state.activeSynergies.length <= 2) {
            extra = '<div class="first-synergy-note">(Synergies are where the real value is \u2014 keep looking for more!)</div>';
        }
        html += '<div class="synergy-item positive">' +
            '<div class="synergy-header">' +
                '<span class="synergy-name">\u2728 ' + synergy.name + '</span>' +
                '<span class="synergy-bonus">+' + synergy.bonus.toFixed(1) + '</span>' +
            '</div>' +
            '<p class="synergy-reason">' + synergy.reason + '</p>' +
            extra +
        '</div>';
    });

    // Anti-synergies with action hints
    state.activeAntiSynergies.forEach(anti => {
        let hintText = '';
        if (anti.ids && anti.ids.length > 0) {
            const lastAdded = state.selectedOptions.filter(id => anti.ids.includes(id)).pop();
            const item = OPTIONS.find(opt => opt.id === lastAdded);
            if (item) {
                hintText = '<div class="synergy-hint">(Consider: would removing ' + item.name + ' open up a better path?)</div>';
            }
        } else if (anti.tags) {
            // Find last item with matching tag
            const matchingItems = state.selectedOptions.filter(id => {
                const opt = OPTIONS.find(o => o.id === id);
                return opt && opt.tags.some(t => anti.tags.includes(t));
            });
            if (matchingItems.length > 0) {
                const lastItem = OPTIONS.find(o => o.id === matchingItems[matchingItems.length - 1]);
                if (lastItem) {
                    hintText = '<div class="synergy-hint">(Consider: would removing ' + lastItem.name + ' open up a better path?)</div>';
                }
            }
        }

        html += '<div class="synergy-item negative">' +
            '<div class="synergy-header">' +
                '<span class="synergy-name">\u26A0\uFE0F ' + anti.name + '</span>' +
                '<span class="synergy-bonus">' + anti.penalty.toFixed(1) + '</span>' +
            '</div>' +
            '<p class="synergy-reason">' + anti.reason + '</p>' +
            hintText +
        '</div>';
    });

    elements.synergyList.innerHTML = html;
}

// ========================
// CLEAR ALL (Two-step)
// ========================

function handleClearAll() {
    if (state.selectedOptions.length === 0) return;

    if (state.clearConfirmPending) {
        // Second click: clear
        clearAllSelections();
        resetClearButton();
    } else {
        // First click: confirm
        state.clearConfirmPending = true;
        elements.clearButton.textContent = 'Click again to confirm';
        elements.clearButton.classList.add('confirm-clear');
        state.clearConfirmTimer = setTimeout(resetClearButton, 3000);
    }
}

function resetClearButton() {
    state.clearConfirmPending = false;
    clearTimeout(state.clearConfirmTimer);
    elements.clearButton.textContent = 'Clear All';
    elements.clearButton.classList.remove('confirm-clear');
}

function clearAllSelections() {
    state.selectedOptions = [];
    state.totalCost = 0;
    state.activeSynergies = [];
    state.activeAntiSynergies = [];
    state.secretCombos = [];
    state.hasEvaluated = false;
    state.draftHistory = [];
    state.pickCounter = 0;
    state.rivalPicks = [];
    state.firstSynergyDiscovered = false;
    elements.scoreSection.classList.add('hidden');
    elements.staleScoreNotice.classList.add('hidden');
    closeWhatIf();
    renderTimeline();
    updateUI();
    saveState();
}

// ========================
// EVALUATE BUILD
// ========================

function evaluateBuild() {
    if (state.selectedOptions.length === 0) {
        showToast('Select at least one hire and one tool before evaluating.', 'info');
        return;
    }

    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));
    const peopleCount = selectedData.filter(opt => opt.category === 'hire').length;
    const toolCount = selectedData.filter(opt => opt.category === 'tool').length;

    // Full Roster check
    const mode = CHALLENGE_MODES[state.challengeMode];
    if (mode.exactItems && state.selectedOptions.length !== mode.exactItems) {
        showFailureModal(true, 'You need exactly ' + mode.exactItems + ' items. You have ' + state.selectedOptions.length + '.');
        return;
    }

    if (peopleCount < REQUIREMENTS.minPeople || toolCount < REQUIREMENTS.minTools) {
        let msg = '';
        if (peopleCount < REQUIREMENTS.minPeople && toolCount < REQUIREMENTS.minTools) {
            msg = 'You need at least 2 hires and 1 tool. You have ' + peopleCount + ' hires and ' + toolCount + ' tools.';
        } else if (peopleCount < REQUIREMENTS.minPeople) {
            msg = 'You need at least 2 hires. You have ' + peopleCount + '.';
        } else {
            msg = 'You need at least 1 tool. You have none.';
        }
        showFailureModal(true, msg);
        return;
    }

    calculateScores();
    displayScores();
    state.hasEvaluated = true;
    elements.staleScoreNotice.classList.add('hidden');

    if (state.scores.finalScore >= CONFIG.SUCCESS_THRESHOLD) {
        addTickerMessage(TICKER_MESSAGES.evalPass[0].replace('{score}', state.scores.finalScore.toFixed(1)));
        showSuccessModal();
    } else {
        addTickerMessage(TICKER_MESSAGES.evalFail[0]);
        showFailureModal(false);
    }
}

function calculateScores() {
    const selectedData = state.selectedOptions.map(id => OPTIONS.find(opt => opt.id === id));
    state.scores.baseImpact = selectedData.reduce((sum, opt) => sum + opt.impact, 0);
    state.scores.synergyBonus = state.activeSynergies.reduce((sum, s) => sum + s.bonus, 0);
    state.scores.secretComboBonus = state.secretCombos.reduce((sum, c) => sum + c.bonus, 0);
    state.scores.antiSynergyPenalty = state.activeAntiSynergies.reduce((sum, a) => sum + a.penalty, 0);
    state.scores.finalScore = state.scores.baseImpact + state.scores.synergyBonus + state.scores.secretComboBonus + state.scores.antiSynergyPenalty;
}

function displayScores() {
    elements.scoreSection.classList.remove('hidden');
    const totalSynergy = state.scores.synergyBonus + state.scores.secretComboBonus;
    elements.baseImpact.textContent = state.scores.baseImpact.toFixed(1);
    elements.synergyBonus.textContent = '+' + totalSynergy.toFixed(1);
    elements.antiSynergy.textContent = state.scores.antiSynergyPenalty.toFixed(1);
    elements.finalScore.textContent = state.scores.finalScore.toFixed(1);

    elements.finalScore.parentElement.classList.add('pulse');
    setTimeout(() => elements.finalScore.parentElement.classList.remove('pulse'), 500);
}

// ========================
// SUCCESS MODAL
// ========================

function showSuccessModal() {
    const score = state.scores.finalScore;
    elements.claimCode.textContent = CONFIG.CLAIM_CODE;

    // Build rating
    const rating = BUILD_RATINGS.find(r => score >= r.min) || BUILD_RATINGS[BUILD_RATINGS.length - 1];
    elements.ratingTier.textContent = rating.tier + ' \u2014 "' + rating.label + '"';
    elements.ratingTier.style.background = rating.color;
    elements.ratingTier.style.color = rating.tier === 'Gold' || rating.tier === 'Bronze' ? '#1a1a1a' : 'white';
    elements.ratingLabel.textContent = 'Your Build Rating';

    // Score counter animation
    animateScore(score, rating.tier === 'Platinum' ? 2500 : 1500);

    // Personal best
    if (score > persistent.bestScore) {
        persistent.bestScore = score;
        persistent.bestRating = rating.tier;
        elements.personalBest.classList.remove('hidden');
    } else {
        elements.personalBest.classList.add('hidden');
    }

    // Why This Works
    const explanation = getBuildExplanation();
    elements.whyExplanation.textContent = explanation;

    // Budget efficiency
    const remaining = state.activeBudgetLimit - state.totalCost;
    if (remaining >= 3.0) {
        elements.efficiencyMessage.textContent = 'Efficiency Bonus: You built a winning team with $' + remaining.toFixed(1) + 'M to spare. Smart GMs build lean analytics departments \u2014 that surplus goes toward player contracts and facility upgrades.';
        elements.efficiencySection.classList.remove('hidden');
    } else {
        elements.efficiencySection.classList.add('hidden');
    }

    // Track winning build
    const buildKey = state.selectedOptions.slice().sort((a, b) => a - b).join(',');
    if (!persistent.winningBuilds.includes(buildKey)) {
        persistent.winningBuilds.push(buildKey);
    }
    persistent.hasWon = true;

    // Track challenge completion
    if (state.challengeMode !== 'standard' && !persistent.challengesCompleted.includes(state.challengeMode)) {
        persistent.challengesCompleted.push(state.challengeMode);
    }

    savePersistent();

    // Build counter
    elements.buildCounter.textContent = 'Winning builds discovered: ' + persistent.winningBuilds.length + ' of 6+';

    // Next tier hint
    if (rating.tier === 'Bronze') {
        elements.nextTierHint.textContent = 'Can you reach Silver? Look for more synergies.';
    } else if (rating.tier === 'Silver') {
        elements.nextTierHint.textContent = 'Can you reach Gold? Secret combos are the key.';
    } else if (rating.tier === 'Gold') {
        elements.nextTierHint.textContent = 'Can you reach Platinum? The best build scores above 10.0.';
    } else {
        elements.nextTierHint.textContent = 'You found the best possible build. Legendary!';
    }

    // Challenge prompt
    if (state.challengeMode === 'standard') {
        elements.challengePrompt.classList.remove('hidden');
    } else {
        elements.challengePrompt.classList.add('hidden');
    }

    // Celebrations
    spawnConfetti(rating.tier);
    if (rating.tier === 'Gold' || rating.tier === 'Platinum') {
        document.querySelector('#success-modal .modal-content').classList.add('gold-pulse');
    }
    if (rating.tier === 'Platinum') {
        setTimeout(() => {
            document.querySelector('#success-modal .modal-content').classList.add('screen-shake');
            setTimeout(() => document.querySelector('#success-modal .modal-content').classList.remove('screen-shake'), 200);
        }, 2500);
    }

    elements.successModal.classList.remove('hidden');
    trapFocus(elements.successModal);
}

function getBuildExplanation() {
    const sortedIds = state.selectedOptions.slice().sort((a, b) => a - b).join(',');
    // Check each secret combo key
    for (const key of Object.keys(BUILD_EXPLANATIONS)) {
        if (key === 'default') continue;
        const comboIds = key.split(',').map(Number).sort((a, b) => a - b).join(',');
        // Check if the player's build contains this combo
        const comboArr = key.split(',').map(Number);
        if (comboArr.every(id => state.selectedOptions.includes(id))) {
            return BUILD_EXPLANATIONS[key];
        }
    }
    return BUILD_EXPLANATIONS['default'];
}

function animateScore(target, duration) {
    const el = elements.successScore;
    if (!el) return;
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = (target * progress).toFixed(1);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(1);
    }
    requestAnimationFrame(step);
}

function spawnConfetti(tier) {
    const container = elements.confettiContainer;
    if (!container) return;
    container.innerHTML = '';

    let count = 0;
    if (tier === 'Silver') count = 20;
    else if (tier === 'Gold') count = 50;
    else if (tier === 'Platinum') count = 100;

    const colors = ['#f4b223', '#1e3a5f', '#1a8a4a', '#e74c3c', '#3498db'];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (2 + Math.random() * 2) + 's';
        particle.style.animationDelay = (Math.random() * 1) + 's';
        const size = 6 + Math.random() * 6;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        container.appendChild(particle);
    }

    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

function closeSuccessModal() {
    elements.successModal.classList.add('hidden');
    const mc = document.querySelector('#success-modal .modal-content');
    if (mc) mc.classList.remove('gold-pulse', 'screen-shake');
    elements.evaluateButton.focus();
}

// ========================
// FAILURE MODAL
// ========================

function showFailureModal(isRequirementFail, requirementMsg) {
    const score = state.scores.finalScore;

    // Adaptive headline
    let headline, subtitle;
    if (isRequirementFail) {
        headline = 'Missing Requirements';
        subtitle = requirementMsg || REQUIREMENTS.requiredMessage;
    } else if (score >= 6.5) {
        headline = 'So Close!';
        subtitle = "Your front office build doesn't meet the performance standard yet.";
    } else if (score >= 5.0) {
        headline = 'Getting There';
        subtitle = "Your front office build doesn't meet the performance standard yet.";
    } else {
        headline = 'Early Days';
        subtitle = "Your front office build doesn't meet the performance standard yet.";
    }

    elements.failureTitle.textContent = headline;
    elements.failureSubtitle.textContent = subtitle;

    // Proximity bar
    if (!isRequirementFail && score > 0) {
        elements.proximitySection.classList.remove('hidden');
        const pct = Math.min((score / 7.0) * 100, 100);
        elements.proximityBar.style.width = pct + '%';
        elements.proximityScoreLabel.textContent = score.toFixed(1);
        elements.proximityScoreLabel.style.left = Math.min(pct - 2, 90) + '%';
    } else {
        elements.proximitySection.classList.add('hidden');
    }

    // Near-miss message
    if (!isRequirementFail) {
        const gap = (7.0 - score).toFixed(1);
        if (score >= 6.5) {
            elements.nearMissMessage.innerHTML = 'You are <strong>' + gap + ' points</strong> away. That\'s less than one good synergy.';
            elements.nearMissMessage.classList.remove('hidden');
        } else if (score >= 6.0) {
            elements.nearMissMessage.innerHTML = 'You are <strong>' + gap + ' points</strong> away. A secret combo could close that gap.';
            elements.nearMissMessage.classList.remove('hidden');
        } else {
            elements.nearMissMessage.classList.add('hidden');
        }
    } else {
        elements.nearMissMessage.classList.add('hidden');
    }

    // Dynamic hints
    const hints = generateHints(isRequirementFail, score);
    elements.hintList.innerHTML = hints.map(h => '<li>' + h + '</li>').join('');

    // Adaptive button text
    const btn = elements.closeFailureModal;
    if (isRequirementFail) {
        btn.textContent = 'Fix Requirements';
        btn.onclick = closeFailureModal;
    } else if (score >= 6.5) {
        btn.textContent = 'Almost \u2014 Try One Change';
        btn.onclick = closeFailureModal;
    } else if (score >= 5.0) {
        btn.textContent = 'Adjust Your Build';
        btn.onclick = closeFailureModal;
    } else {
        btn.textContent = 'Start Fresh';
        btn.onclick = () => { closeFailureModal(); clearAllSelections(); };
    }

    elements.failureModal.classList.remove('hidden');
    trapFocus(elements.failureModal);
}

function generateHints(isRequirementFail, score) {
    if (isRequirementFail) {
        return [
            'You need at least 2 hires and 1 tool to form a complete team.',
            'Make sure you have a mix of people and technology.'
        ];
    }

    const hints = [];
    const maxHints = 2;

    // Priority-ordered
    if (state.secretCombos.length === 0) {
        hints.push('Some combinations of 3 items unlock powerful hidden bonuses. Think about which roles naturally complement each other.');
    }
    if (hints.length < maxHints && state.activeAntiSynergies.length > 0) {
        const anti = state.activeAntiSynergies[0];
        hints.push('Your ' + anti.name + ' conflict is costing you ' + Math.abs(anti.penalty).toFixed(1) + ' points. Consider whether both items are worth keeping.');
    }
    if (hints.length < maxHints && state.scores.baseImpact < 4.0) {
        hints.push('Your base impact is ' + state.scores.baseImpact.toFixed(1) + '. Higher-impact hires create a stronger foundation, but watch your budget.');
    }
    if (hints.length < maxHints && state.activeSynergies.length === 0) {
        hints.push('None of your items are creating bonus synergies. Try pairing items that serve related functions.');
    }
    const budgetUtil = state.totalCost / state.activeBudgetLimit;
    if (hints.length < maxHints && budgetUtil < 0.6) {
        const rem = (state.activeBudgetLimit - state.totalCost).toFixed(1);
        hints.push('You have $' + rem + 'M unspent. Unused budget is wasted opportunity.');
    }
    if (hints.length < maxHints && score >= 6.5) {
        const gap = (7.0 - score).toFixed(1);
        hints.push('You are only ' + gap + ' points away. A single synergy or one different pick could close that gap.');
    }
    // Wearables without people
    if (hints.length < maxHints && state.selectedOptions.includes(8) && !state.selectedOptions.includes(2) && !state.selectedOptions.includes(10)) {
        hints.push('Your Wearable Tracking System is collecting data, but who on your team is using it?');
    }
    if (hints.length < maxHints) {
        hints.push('Think about what each person or tool needs to be effective. A data scientist without infrastructure is limited.');
    }

    return hints.slice(0, maxHints);
}

function closeFailureModal() {
    elements.failureModal.classList.add('hidden');
    elements.evaluateButton.focus();
}

// ========================
// WHAT-IF SWAP TOOL
// ========================

function openWhatIf() {
    // Populate dropdowns
    const removeSelect = elements.swapRemove;
    const addSelect = elements.swapAdd;

    removeSelect.innerHTML = '<option value="">-- Select item to remove --</option>';
    state.selectedOptions.forEach(id => {
        const opt = OPTIONS.find(o => o.id === id);
        removeSelect.innerHTML += '<option value="' + id + '">' + opt.icon + ' ' + opt.name + '</option>';
    });

    addSelect.innerHTML = '<option value="">-- Select item to add --</option>';
    const available = getAvailableOptions().filter(o =>
        !state.selectedOptions.includes(o.id) && !state.rivalPicks.includes(o.id)
    );
    available.forEach(opt => {
        addSelect.innerHTML += '<option value="' + opt.id + '">' + opt.icon + ' ' + opt.name + ' ($' + opt.cost.toFixed(1) + 'M)</option>';
    });

    elements.swapPreview.classList.add('hidden');
    elements.whatIfPanel.classList.remove('hidden');
}

function closeWhatIf() {
    if (elements.whatIfPanel) elements.whatIfPanel.classList.add('hidden');
}

function previewSwap() {
    const removeId = parseInt(elements.swapRemove.value);
    const addId = parseInt(elements.swapAdd.value);

    if (!removeId || !addId) {
        elements.swapPreview.classList.add('hidden');
        return;
    }

    const removeOpt = OPTIONS.find(o => o.id === removeId);
    const addOpt = OPTIONS.find(o => o.id === addId);

    // Budget check
    const newCost = state.totalCost - removeOpt.cost + addOpt.cost;
    if (newCost > state.activeBudgetLimit) {
        elements.swapDelta.textContent = 'Over budget!';
        elements.swapDelta.className = 'swap-delta negative';
        elements.swapDetails.innerHTML = '<div class="swap-detail-item swap-lost">This swap would cost $' + (addOpt.cost - removeOpt.cost).toFixed(1) + 'M more than you can afford.</div>';
        elements.swapPreview.classList.remove('hidden');
        return;
    }

    // Simulate
    const tempSelected = state.selectedOptions.filter(id => id !== removeId).concat([addId]);
    const tempData = tempSelected.map(id => OPTIONS.find(o => o.id === id));

    // Calculate temp synergies
    let tempSynergyBonus = 0;
    const tempActiveSynergies = [];
    SYNERGIES.forEach(s => {
        if (s.minPeople) {
            if (tempSelected.includes(9) && tempData.filter(o => o.category === 'hire').length >= s.minPeople) {
                tempSynergyBonus += s.bonus;
                tempActiveSynergies.push(s.name);
            }
        } else if (s.ids.every(id => tempSelected.includes(id))) {
            tempSynergyBonus += s.bonus;
            tempActiveSynergies.push(s.name);
        }
    });

    let tempAntiPenalty = 0;
    ANTI_SYNERGIES.forEach(a => {
        if (a.tags) {
            if (tempData.filter(o => o.tags.some(t => a.tags.includes(t))).length >= a.minCount) tempAntiPenalty += a.penalty;
        } else if (a.ids && a.ids.every(id => tempSelected.includes(id))) {
            tempAntiPenalty += a.penalty;
        }
    });

    let tempSecretBonus = 0;
    SECRET_COMBOS.forEach(c => {
        if (c.ids.every(id => tempSelected.includes(id))) tempSecretBonus += c.bonus;
    });

    const tempBase = tempData.reduce((s, o) => s + o.impact, 0);
    const newScore = tempBase + tempSynergyBonus + tempSecretBonus + tempAntiPenalty;
    const delta = newScore - state.scores.finalScore;

    elements.swapDelta.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(1) + ' points';
    elements.swapDelta.className = 'swap-delta ' + (delta >= 0 ? 'positive' : 'negative');

    // Details
    let details = '';
    const currentSynergyNames = state.activeSynergies.map(s => s.name);
    const gained = tempActiveSynergies.filter(n => !currentSynergyNames.includes(n));
    const lost = currentSynergyNames.filter(n => !tempActiveSynergies.includes(n));
    gained.forEach(n => { details += '<div class="swap-detail-item swap-added">+ ' + n + '</div>'; });
    lost.forEach(n => { details += '<div class="swap-detail-item swap-lost">- ' + n + '</div>'; });
    if (newScore >= 7.0 && state.scores.finalScore < 7.0) {
        details += '<div class="swap-detail-item swap-added" style="font-weight:700">This swap would make you pass!</div>';
    }

    elements.swapDetails.innerHTML = details || '<div class="swap-detail-item">No synergy changes.</div>';
    elements.swapPreview.classList.remove('hidden');
}

function applySwap() {
    const removeId = parseInt(elements.swapRemove.value);
    const addId = parseInt(elements.swapAdd.value);
    if (!removeId || !addId) return;

    toggleOption(removeId); // remove
    toggleOption(addId);    // add
    closeWhatIf();
}

// ========================
// TIMELINE
// ========================

function renderTimeline() {
    const el = elements.draftTimeline;
    if (!el) return;

    if (state.draftHistory.length === 0) {
        el.innerHTML = '<span class="timeline-empty">Your draft picks will appear here.</span>';
        return;
    }

    el.innerHTML = state.draftHistory.map(entry => {
        const opt = OPTIONS.find(o => o.id === entry.id);
        let classes = 'timeline-node';
        if (entry.removed) classes += ' timeline-removed';
        if (entry.isRival) classes += ' rival-pick';

        return '<div class="' + classes + '">' +
            '<div class="timeline-icon">' + opt.icon + '</div>' +
            '<div class="timeline-label">' + (entry.isRival ? state.rivalName : opt.name) + '</div>' +
            '<div class="timeline-pick-number">#' + entry.pick + '</div>' +
        '</div>';
    }).join('');
}

// ========================
// DISCOVERY TRACKER
// ========================

function renderDiscoveryTracker() {
    const el = elements.discoveryList;
    if (!el) return;

    const found = persistent.discoveredCombos;
    elements.combosFoundCount.textContent = found.length;

    el.innerHTML = SECRET_COMBOS.map(combo => {
        const isFound = found.includes(combo.name);
        return '<div class="discovery-item ' + (isFound ? 'found' : 'locked') + '">' +
            '<span class="discovery-icon">' + (isFound ? '\u{1F3C6}' : '\u{1F512}') + '</span>' +
            '<span>' + (isFound ? combo.name.replace('\u{1F3C6} ', '') : '???') + '</span>' +
        '</div>';
    }).join('');
}

// ========================
// CHALLENGE MODES
// ========================

function renderChallengeModes() {
    if (!persistent.hasWon) return;

    elements.challengeModesSection.classList.remove('hidden');
    const grid = elements.challengeGrid;

    grid.innerHTML = Object.entries(CHALLENGE_MODES)
        .filter(([key]) => key !== 'standard')
        .map(([key, mode]) => {
            const completed = persistent.challengesCompleted.includes(key);
            return '<div class="challenge-card' + (completed ? ' completed' : '') + '" data-mode="' + key + '" tabindex="0" role="button">' +
                '<div class="challenge-icon">' + mode.icon + '</div>' +
                '<div class="challenge-name">' + mode.name + '</div>' +
                '<div class="challenge-desc">' + mode.description + '</div>' +
            '</div>';
        }).join('');

    // Click handlers
    grid.querySelectorAll('.challenge-card').forEach(card => {
        card.addEventListener('click', () => {
            grid.querySelectorAll('.challenge-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// ========================
// COLLAPSIBLES
// ========================

function toggleCollapsible(toggleKey, contentKey) {
    const toggle = elements[toggleKey];
    const content = elements[contentKey];
    const expanded = toggle.getAttribute('aria-expanded') === 'true';

    toggle.setAttribute('aria-expanded', !expanded);
    content.classList.toggle('hidden');
    const icon = toggle.querySelector('.collapse-icon');
    if (icon) icon.textContent = expanded ? '+' : '\u2212';
}

// ========================
// COPY CLAIM CODE
// ========================

function copyClaimCode() {
    if (state.isCopying) return;
    state.isCopying = true;
    const code = elements.claimCode.textContent;

    navigator.clipboard.writeText(code).then(() => {
        elements.copyButton.innerHTML = '\u2713';
        elements.copyButton.style.background = 'var(--success-green)';
        setTimeout(() => {
            elements.copyButton.innerHTML = COPY_BUTTON_SVG;
            elements.copyButton.style.background = '';
            state.isCopying = false;
        }, 2000);
    }).catch(() => {
        showToast('Could not copy automatically. Please select and copy: ' + code, 'error', 6000);
        state.isCopying = false;
    });
}

// ========================
// FOCUS TRAP (Accessibility)
// ========================

function trapFocus(modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) focusable[0].focus();
}

// ========================
// PERSISTENCE
// ========================

function saveState() {
    try {
        localStorage.setItem('frontOfficeDraft', JSON.stringify({
            selectedOptions: state.selectedOptions,
            totalCost: state.totalCost,
            challengeMode: state.challengeMode,
            rivalEnabled: state.rivalEnabled,
            rivalName: state.rivalName,
            rivalPicks: state.rivalPicks,
            draftHistory: state.draftHistory,
            pickCounter: state.pickCounter
        }));
    } catch (e) { /* silently fail */ }
}

function loadSavedState() {
    try {
        const saved = localStorage.getItem('frontOfficeDraft');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.selectedOptions && data.selectedOptions.length > 0) {
                state.selectedOptions = data.selectedOptions || [];
                state.totalCost = data.totalCost || 0;
                state.challengeMode = data.challengeMode || 'standard';
                state.rivalEnabled = data.rivalEnabled || false;
                state.rivalName = data.rivalName || '';
                state.rivalPicks = data.rivalPicks || [];
                state.draftHistory = data.draftHistory || [];
                state.pickCounter = data.pickCounter || 0;
                state.activeBudgetLimit = CHALLENGE_MODES[state.challengeMode]
                    ? CHALLENGE_MODES[state.challengeMode].budgetLimit
                    : CONFIG.BUDGET_LIMIT;

                // Skip intro overlay — returning player
                elements.introOverlay.classList.remove('active');
                elements.introOverlay.classList.add('hidden');
                elements.app.classList.remove('hidden');

                if (state.rivalEnabled && state.rivalName) {
                    elements.rivalBadge.textContent = 'vs. ' + state.rivalName;
                    elements.rivalBadge.classList.remove('hidden');
                }

                if (state.challengeMode !== 'standard') {
                    const mode = CHALLENGE_MODES[state.challengeMode];
                    elements.challengeBadge.textContent = mode.icon + ' ' + mode.name;
                    elements.challengeBadge.classList.remove('hidden');
                }

                elements.budgetLimitDisplay.textContent = '$' + state.activeBudgetLimit.toFixed(1) + 'M';

                checkSynergies();
                updateUI();
                renderTimeline();
            }
        }
    } catch (e) { /* silently fail */ }
}

function savePersistent() {
    try {
        localStorage.setItem('frontOfficeDraftPersistent', JSON.stringify(persistent));
    } catch (e) { /* silently fail */ }
}

function loadPersistent() {
    try {
        const saved = localStorage.getItem('frontOfficeDraftPersistent');
        if (saved) {
            const data = JSON.parse(saved);
            persistent = { ...persistent, ...data };
        }
    } catch (e) { /* silently fail */ }
}

function saveGMNotes() {
    persistent.gmNotes = elements.gmNotes ? elements.gmNotes.value : '';
    savePersistent();
}

function loadGMNotes() {
    if (elements.gmNotes && persistent.gmNotes) {
        elements.gmNotes.value = persistent.gmNotes;
        if (elements.notesCount) elements.notesCount.textContent = persistent.gmNotes.length;
    }
}

function clearSavedState() {
    localStorage.removeItem('frontOfficeDraft');
    localStorage.removeItem('frontOfficeDraftPersistent');
}

// ========================
// INIT
// ========================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Debug export
if (typeof window !== 'undefined') {
    window.draftApp = {
        state, persistent, clearSavedState, calculateScores,
        OPTIONS, CONFIG, SYNERGIES, ANTI_SYNERGIES, SECRET_COMBOS
    };
}
