/**
 * Login system — client-side validation & UX
 *
 * Features:
 *  - Email validation (regex) with clear messages
 *  - Password strength meter (4 levels) + live requirements checklist
 *  - Password show/hide toggle (button inside input)
 *  - Caps Lock warning
 *  - Validation on blur & submit only (never on initial render)
 *  - Errors clear as soon as input becomes valid
 *  - Sign in button disabled until form is valid
 *  - Simulated 1.5s API call with loading spinner
 *  - Mock credentials for testing (user@company.com / Password123!)
 *  - Success state and error banner
 *  - Remember me saves email to localStorage (never password)
 *  - Lockout: 30s after 5 failed attempts with countdown
 *  - Enter to submit; auto-focus first invalid field
 *  - Light/dark theme toggle (CSS variables + prefers-color-scheme)
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // Configuration
  // ------------------------------------------------------------------
  const MOCK_CREDENTIALS = {
    email: 'user@company.com',
    password: 'Password123!'
  };

  const FAKE_API_DELAY = 1500;      // simulated network latency (ms)
  const LOCKOUT_ATTEMPTS = 5;       // failed attempts before lockout
  const LOCKOUT_DURATION = 30000;   // lockout length (ms)

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ------------------------------------------------------------------
  // DOM references
  // ------------------------------------------------------------------
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const globalMessage = document.getElementById('globalMessage');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const emailHint = document.getElementById('emailHint');
  const capsLockWarning = document.getElementById('capsLockWarning');
  const strengthMeter = document.getElementById('strengthMeter');
  const strengthBar = strengthMeter.querySelector('.strength-bar');
  const strengthText = document.getElementById('strengthText');
  const rememberCheckbox = document.getElementById('remember');
  const successState = document.querySelector('.success-state');
  const lockoutBanner = document.getElementById('lockoutBanner');
  const lockoutCountdown = document.getElementById('lockoutCountdown');
  const themeToggle = document.getElementById('themeToggle');

  const checks = {
    length: document.getElementById('check-length'),
    uppercase: document.getElementById('check-uppercase'),
    lowercase: document.getElementById('check-lowercase'),
    number: document.getElementById('check-number'),
    symbol: document.getElementById('check-symbol')
  };

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  let failedAttempts = 0;
  let lockoutTimer = null;
  let lockoutTimeRemaining = 0;
  let isSubmitting = false;
  let emailTouched = false;
  let passwordTouched = false;

  // ------------------------------------------------------------------
  // Initialization
  // ------------------------------------------------------------------
  function init() {
    loadRememberedEmail();
    bindEvents();
    applyTheme();
    updateSubmitState();
  }

  function bindEvents() {
    emailInput.addEventListener('blur', () => {
      emailTouched = true;
      validateEmail();
    });
    emailInput.addEventListener('input', () => {
      if (emailTouched) validateEmail();
      updateSubmitState();
    });

    passwordInput.addEventListener('blur', () => {
      passwordTouched = true;
      validatePassword();
      updateStrengthMeter();
    });
    passwordInput.addEventListener('input', () => {
      if (passwordTouched) validatePassword();
      updateStrengthMeter();
      updateSubmitState();
    });
    passwordInput.addEventListener('keydown', handleCapsLock);

    toggleBtn.addEventListener('click', togglePasswordVisibility);
    themeToggle.addEventListener('click', toggleTheme);
    form.addEventListener('submit', handleSubmit);
  }

  // ------------------------------------------------------------------
  // Theme handling
  // ------------------------------------------------------------------
  function applyTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('manual-dark');
      themeToggle.setAttribute('aria-pressed', 'false');
    } else if (stored === 'dark') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.add('manual-dark');
      document.documentElement.classList.remove('light-theme');
      themeToggle.setAttribute('aria-pressed', 'true');
    } else if (!prefersDark) {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('manual-dark');
      themeToggle.setAttribute('aria-pressed', 'false');
    } else {
      document.documentElement.classList.remove('light-theme', 'manual-dark');
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-theme');
    document.documentElement.classList.toggle('manual-dark', !isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeToggle.setAttribute('aria-pressed', String(!isLight));
  }

  // ------------------------------------------------------------------
  // Validation helpers
  // ------------------------------------------------------------------
  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
      setFieldError(emailInput, emailError, 'Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setFieldError(emailInput, emailError, 'Enter a valid email like name@company.com.');
      return false;
    }

    clearFieldError(emailInput, emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;

    if (!value) {
      setFieldError(passwordInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 8) {
      setFieldError(passwordInput, passwordError, 'Password must be at least 8 characters.');
      return false;
    }

    clearFieldError(passwordInput, passwordError);
    return true;
  }

  function setFieldError(input, errorEl, message) {
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    if (emailHint && input === emailInput) {
      emailHint.style.opacity = '0';
    }
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
    errorEl.textContent = '';
    if (emailHint && input === emailInput) {
      emailHint.style.opacity = '1';
    }
  }

  // ------------------------------------------------------------------
  // Password strength & checklist
  // ------------------------------------------------------------------
  function scorePassword(password) {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    return Math.min(score, 100);
  }

  function strengthLevel(score) {
    if (score < 25) return { level: 1, label: 'Weak', cls: 'strength-text--weak', color: 'var(--error)' };
    if (score < 50) return { level: 2, label: 'Fair', cls: 'strength-text--fair', color: '#f97316' };
    if (score < 75) return { level: 3, label: 'Good', cls: 'strength-text--good', color: '#eab308' };
    return { level: 4, label: 'Strong', cls: 'strength-text--strong', color: 'var(--success)' };
  }

  function updateChecklist(password) {
    const rules = [
      { el: checks.length, met: password.length >= 8 },
      { el: checks.uppercase, met: /[A-Z]/.test(password) },
      { el: checks.lowercase, met: /[a-z]/.test(password) },
      { el: checks.number, met: /[0-9]/.test(password) },
      { el: checks.symbol, met: /[^A-Za-z0-9]/.test(password) }
    ];

    rules.forEach(({ el, met }) => {
      if (met) {
        el.classList.add('met');
      } else {
        el.classList.remove('met');
      }
    });
  }

  function updateStrengthMeter() {
    const password = passwordInput.value;

    if (!password) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = 'var(--error)';
      strengthBar.className = 'strength-bar';
      strengthText.textContent = 'Weak';
      strengthText.className = 'strength-text strength-text--weak';
      strengthMeter.setAttribute('aria-valuenow', '0');
      return;
    }

    const score = scorePassword(password);
    const level = strengthLevel(score);

    strengthBar.style.width = `${level.level * 25}%`;
    strengthBar.style.backgroundColor = level.color;
    strengthBar.className = `strength-bar level-${level.level}`;
    strengthText.textContent = level.label;
    strengthText.className = `strength-text ${level.cls}`;
    strengthMeter.setAttribute('aria-valuenow', String(score));

    updateChecklist(password);
  }

  // ------------------------------------------------------------------
  // Caps Lock warning
  // ------------------------------------------------------------------
  function handleCapsLock(event) {
    if (event.getModifierState && event.getModifierState('CapsLock')) {
      capsLockWarning.classList.remove('hidden');
    } else {
      capsLockWarning.classList.add('hidden');
    }
  }

  // ------------------------------------------------------------------
  // Password visibility toggle
  // ------------------------------------------------------------------
  function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(!isPassword));
    toggleBtn.setAttribute('aria-label', !isPassword ? 'Hide password' : 'Show password');
  }

  // ------------------------------------------------------------------
  // Submit state
  // ------------------------------------------------------------------
  function updateSubmitState() {
    const emailValid = emailTouched ? validateEmail() : true;
    const passwordValid = passwordTouched ? validatePassword() : true;
    submitBtn.disabled = !(emailValid && passwordValid) || isSubmitting || isLocked();
  }

  function isLocked() {
    return lockoutTimer !== null;
  }

  // ------------------------------------------------------------------
  // Remember me
  // ------------------------------------------------------------------
  function loadRememberedEmail() {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      emailInput.value = saved;
    }
  }

  function saveRememberedEmail() {
    if (rememberCheckbox.checked) {
      localStorage.setItem('remembered_email', emailInput.value.trim());
    } else {
      localStorage.removeItem('remembered_email');
    }
  }

  // ------------------------------------------------------------------
  // Global messages
  // ------------------------------------------------------------------
  function showGlobal(message, type) {
    globalMessage.textContent = message;
    globalMessage.className = `global-message global-message--${type}`;
    globalMessage.classList.remove('hidden');
  }

  function hideGlobal() {
    globalMessage.classList.add('hidden');
  }

  // ------------------------------------------------------------------
  // Lockout handling
  // ------------------------------------------------------------------
  function startLockout() {
    lockoutTimeRemaining = LOCKOUT_DURATION / 1000;
    updateLockoutDisplay();
    lockoutBanner.classList.remove('hidden');
    form.classList.add('locked');
    submitBtn.disabled = true;

    lockoutTimer = setInterval(() => {
      lockoutTimeRemaining -= 1;
      lockoutCountdown.textContent = Math.ceil(lockoutTimeRemaining);
      if (lockoutTimeRemaining <= 0) {
        clearInterval(lockoutTimer);
        lockoutTimer = null;
        failedAttempts = 0;
        lockoutBanner.classList.add('hidden');
        form.classList.remove('locked');
        updateSubmitState();
      }
    }, 1000);
  }

  function updateLockoutDisplay() {
    lockoutCountdown.textContent = Math.ceil(lockoutTimeRemaining);
  }

  // ------------------------------------------------------------------
  // Submit handler
  // ------------------------------------------------------------------
  async function handleSubmit(event) {
    event.preventDefault();
    hideGlobal();

    if (isLocked()) return;

    if (!validateEmail() || !validatePassword()) {
      submitBtn.disabled = true;
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 300);
      const firstInvalid = form.querySelector('[aria-invalid="true"]') || form.querySelector('.error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    isSubmitting = true;
    updateSubmitState();
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Signing in...';

    try {
      const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value
      };

      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, FAKE_API_DELAY));

      const isValid =
        payload.email.toLowerCase() === MOCK_CREDENTIALS.email.toLowerCase() &&
        payload.password === MOCK_CREDENTIALS.password;

      if (!isValid) {
        failedAttempts += 1;
        throw new Error(failedAttempts >= LOCKOUT_ATTEMPTS
          ? 'Too many failed attempts. Account locked for 30 seconds.'
          : 'Invalid email or password.');
      }

      // Success
      failedAttempts = 0;
      saveRememberedEmail();
      form.style.display = 'none';
      successState.classList.remove('hidden');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1200);
    } catch (error) {
      showGlobal(error.message || 'Unable to sign in. Please try again.', 'error');
      passwordInput.value = '';
      updateStrengthMeter();
      updateSubmitState();
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Sign in';
      passwordInput.focus();

      if (failedAttempts >= LOCKOUT_ATTEMPTS) {
        startLockout();
      }
    } finally {
      if (!isLocked()) {
        isSubmitting = false;
        updateSubmitState();
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Sign in';
      }
    }
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
