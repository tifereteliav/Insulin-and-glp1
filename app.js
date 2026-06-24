// Game State and Logic for Rybelsus & Insulin Clinical Challenge

document.addEventListener('DOMContentLoaded', () => {
    // Game State
    const state = {
        rybelsusCorrect: false,
        pregnancyCorrect: false,
        cvaCorrect: false,
        thyroidCorrect: false
    };

    // DOM Elements
    const screens = {
        auth: document.getElementById('screen-auth'),
        intro: document.getElementById('screen-intro'),
        rybelsus: document.getElementById('screen-challenge-rybelsus'),
        pregnancy: document.getElementById('screen-case-pregnancy'),
        cva: document.getElementById('screen-case-cva'),
        thyroid: document.getElementById('screen-case-thyroid'),
        results: document.getElementById('screen-results')
    };

    // Auth screen inputs
    const passcodeInput = document.getElementById('passcode-input');
    const authError = document.getElementById('auth-error');
    const btnAuth = document.getElementById('btn-auth');

    // Intro button
    const btnStart = document.getElementById('btn-start');

    // Rybelsus inputs & value readouts
    const inputFasting = document.getElementById('input-fasting');
    const fastingValDisplay = document.getElementById('fasting-val');
    const inputWait = document.getElementById('input-wait');
    const waitValDisplay = document.getElementById('wait-val');
    const btnSubmitRybelsus = document.getElementById('btn-submit-rybelsus');

    // Case buttons
    const btnSubmitPregnancy = document.getElementById('btn-submit-pregnancy');
    const btnSubmitCva = document.getElementById('btn-submit-cva');
    const btnSubmitThyroid = document.getElementById('btn-submit-thyroid');

    // Results elements
    const resultCode = document.getElementById('result-code');
    const btnReset = document.getElementById('btn-reset');

    // --- Helper Functions ---
    
    // Smooth screen switching
    function showScreen(screenToShow) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        // Show selected screen
        screenToShow.classList.add('active');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Dynamic slider label updates
    function updateFastingVal() {
        const val = parseInt(inputFasting.value, 10);
        fastingValDisplay.textContent = val === 0 ? "ללא צום" : `${val} שעות`;
        
        // Visual cue (optional glowing highlight on correct ranges, but keeping it silent for scores)
        if (val >= 6) {
            fastingValDisplay.style.borderColor = 'rgba(0, 242, 254, 0.5)';
        } else {
            fastingValDisplay.style.borderColor = '';
        }
    }

    function updateWaitVal() {
        const val = parseInt(inputWait.value, 10);
        waitValDisplay.textContent = val === 0 ? "מיד" : `${val} דקות`;
        
        if (val >= 30) {
            waitValDisplay.style.borderColor = 'rgba(0, 242, 254, 0.5)';
        } else {
            waitValDisplay.style.borderColor = '';
        }
    }

    // --- Event Listeners ---

    // Auth validation
    function verifyPasscode() {
        const codeEntered = passcodeInput.value.trim();
        if (codeEntered === 'Insulin2026') {
            authError.classList.add('hidden');
            showScreen(screens.intro);
        } else {
            authError.classList.remove('hidden');
            // Shake animation on error
            passcodeInput.style.borderColor = 'var(--red-glow)';
            passcodeInput.classList.add('shake');
            setTimeout(() => {
                passcodeInput.classList.remove('shake');
            }, 500);
        }
    }

    btnAuth.addEventListener('click', verifyPasscode);
    passcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPasscode();
        }
    });
    
    // Clear red border on input focus
    passcodeInput.addEventListener('input', () => {
        passcodeInput.style.borderColor = '';
        authError.classList.add('hidden');
    });

    // Intro Screen -> Rybelsus Screen
    btnStart.addEventListener('click', () => {
        showScreen(screens.rybelsus);
    });

    // Sliders input listeners
    inputFasting.addEventListener('input', updateFastingVal);
    inputWait.addEventListener('input', updateWaitVal);

    // Rybelsus Simulation Submit
    btnSubmitRybelsus.addEventListener('click', () => {
        const fastingHrs = parseInt(inputFasting.value, 10);
        const waitMins = parseInt(inputWait.value, 10);
        
        // Find selected water radio option
        const selectedWater = document.querySelector('input[name="water-select"]:checked');
        const waterValue = selectedWater ? selectedWater.value : '';

        // Validate
        // Correct guidelines: 6 hours of fasting (6+), third of a glass water ("third"), and at least 30 min wait (30+)
        const isFastingCorrect = fastingHrs >= 6;
        const isWaterCorrect = waterValue === 'third';
        const isWaitCorrect = waitMins >= 30;

        state.rybelsusCorrect = isFastingCorrect && isWaterCorrect && isWaitCorrect;

        // Proceed to next stage (pregnancy case)
        showScreen(screens.pregnancy);
    });

    // Case 1: Pregnancy Submit
    btnSubmitPregnancy.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="case-pregnancy-choice"]:checked');
        if (!selectedOption) {
            alert('אנא בחר אחת מהאפשרויות על מנת להמשיך');
            return;
        }

        // Pregnancy correct choice is 'insulin' (Basal insulin is standard of care)
        state.pregnancyCorrect = (selectedOption.value === 'insulin');

        // Proceed to CVA case
        showScreen(screens.cva);
    });

    // Case 2: Post-CVA & Obesity Submit
    btnSubmitCva.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="case-cva-choice"]:checked');
        if (!selectedOption) {
            alert('אנא בחר אחת מהאפשרויות על מנת להמשיך');
            return;
        }

        // CVA correct choice is 'glp1' (Semaglutide/Ozempic has proven cardiprotective benefits)
        state.cvaCorrect = (selectedOption.value === 'glp1');

        // Proceed to thyroid case
        showScreen(screens.thyroid);
    });

    // Case 3: Medullary Thyroid Carcinoma Family History Submit
    btnSubmitThyroid.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="case-thyroid-choice"]:checked');
        if (!selectedOption) {
            alert('אנא בחר אחת מהאפשרויות על מנת להמשיך');
            return;
        }

        // MTC correct choice is 'insulin' (GLP-1 is contraindicated in MTC)
        state.thyroidCorrect = (selectedOption.value === 'insulin');

        // Calculate and show results
        compileResults();
    });

    // Compile results and calculate final passcode
    function compileResults() {
        const allCorrect = state.rybelsusCorrect && 
                           state.pregnancyCorrect && 
                           state.cvaCorrect && 
                           state.thyroidCorrect;

        if (allCorrect) {
            resultCode.textContent = 'Insulin2026';
            resultCode.style.color = 'var(--gold-glow)';
            resultCode.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        } else {
            resultCode.textContent = 'GLP1';
            resultCode.style.color = 'var(--teal-glow)';
            resultCode.style.textShadow = '0 0 20px rgba(0, 242, 254, 0.8)';
        }

        showScreen(screens.results);
    }

    // Reset game state and return to auth
    btnReset.addEventListener('click', () => {
        // Reset state values
        state.rybelsusCorrect = false;
        state.pregnancyCorrect = false;
        state.cvaCorrect = false;
        state.thyroidCorrect = false;

        // Reset Auth inputs
        passcodeInput.value = '';
        authError.classList.add('hidden');

        // Reset Rybelsus Sliders & Radios
        inputFasting.value = 0;
        inputWait.value = 0;
        updateFastingVal();
        updateWaitVal();
        
        const checkedWater = document.querySelector('input[name="water-select"]:checked');
        if (checkedWater) checkedWater.checked = false;

        // Reset Cases Radios
        const checkedPregnancy = document.querySelector('input[name="case-pregnancy-choice"]:checked');
        if (checkedPregnancy) checkedPregnancy.checked = false;

        const checkedCva = document.querySelector('input[name="case-cva-choice"]:checked');
        if (checkedCva) checkedCva.checked = false;

        const checkedThyroid = document.querySelector('input[name="case-thyroid-choice"]:checked');
        if (checkedThyroid) checkedThyroid.checked = false;

        // Back to authentication
        showScreen(screens.auth);
    });

    // Initialize values
    updateFastingVal();
    updateWaitVal();
});

// CSS shake animation injected dynamically for incorrect passcode attempts
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
}
.shake {
    animation: shake 0.4s ease-in-out;
}
`;
document.head.appendChild(styleSheet);
