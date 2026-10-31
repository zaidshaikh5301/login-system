(function () {
  'use strict';

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const API_LOGIN_URL = '/api/login';

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const globalMessage = document.getElementById('globalMessage');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const strengthMeter = document.getElementById('strengthMeter');
  const strengthBar = strengthMeter.querySelector('.strength-bar');
  const strengthText = document.getElementById('strengthText');
  const rememberCheckbox = document.getElementById('remember');

  let validationTimeout;
  let isSubmitting = false;

  function showGlobal(message, type) {
    globalMessage.textContent = message;
    globalMessage.className = `global-message global-message--${type}`;
    globalMessage.classList.remove('hidden');
  }

  function hideGlobal() {
    globalMessage.classList.add('hidden');
  }

  function setFieldError(input, errorEl, message) {
    input.classList.toggle('error', !!message);
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }

  function clearFieldError(input, errorEl) {
    setFieldError(input, errorEl, '');
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      setFieldError(emailInput, emailError, 'Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    clearFieldError(emailInput, emailError);
    return true;
  }

  function scorePassword(password) {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    return Math.min(score, 100);
  }

  function strengthLabel(score) {
    if (score < 40) return { label: 'Weak', class: 'strength-text--weak', color: 'var(--color-weak)' };
    if (score < 70) return { label: 'Medium', class: 'strength-text--medium', color: 'var(--color-medium)' };
    return { label: 'Strong', class: 'strength-text--strong', color: 'var(--color-strong)' };
  }

  function updateStrengthMeter() {
    const password = passwordInput.value;
    if (!password) {
      strengthBar.style.width = '0%';
      strengthBar.style.backgroundColor = 'var(--color-weak)';
      strengthText.textContent = 'Weak';
      strengthText.className = 'strength-text strength-text--weak';
      strengthMeter.setAttribute('aria-valuenow', '0');
      return;
    }

    const score = scorePassword(password);
    const info = strengthLabel(score);
    strengthBar.style.width = `${score}%`;
    strengthBar.style.backgroundColor = info.color;
    strengthText.textContent = info.label;
    strengthText.className = `strength-text ${info.class}`;
    strengthMeter.setAttribute('aria-valuenow', String(score));
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

  function updateSubmitState() {
    const emailValid = validateEmail();
    const passwordValid = validatePassword();
    submitBtn.disabled = !(emailValid && passwordValid) || isSubmitting;
  }

  function debounce(fn, delay) {
    return function (...args) {
      clearTimeout(validationTimeout);
      validationTimeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(!isPassword));
    toggleBtn.setAttribute('aria-label', !isPassword ? 'Hide password' : 'Show password');
  }

  function handleInput() {
    hideGlobal();
    clearFieldError(this, this.dataset.email ? emailError : passwordError);
    updateSubmitState();
    if (this === passwordInput) updateStrengthMeter();
  }

  function handleBlur() {
    if (this === emailInput) validateEmail();
    if (this === passwordInput) validatePassword();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    hideGlobal();

    if (!validateEmail() || !validatePassword()) {
      submitBtn.disabled = true;
      const firstInvalid = form.querySelector('.error') || form.querySelector('input:invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    isSubmitting = true;
    updateSubmitState();
    submitBtn.classList.add('loading');
    submitBtn.textContent = '';

    try {
      const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value,
        remember: rememberCheckbox.checked
      };

      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      if (data.token) {
        const storage = rememberCheckbox.checked ? localStorage : sessionStorage;
        storage.setItem('auth_token', data.token);
        if (data.user) storage.setItem('auth_user', JSON.stringify(data.user));
      }

      showGlobal('Signing in...', 'success');
      setTimeout(() => {
        window.location.href = data.redirect || '/dashboard';
      }, 600);
    } catch (error) {
      showGlobal(error.message || 'Unable to sign in. Please try again.', 'error');
      isSubmitting = false;
      updateSubmitState();
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Sign in';
      passwordInput.value = '';
      updateStrengthMeter();
      passwordInput.focus();
    } finally {
      if (!submitBtn.classList.contains('loading')) {
        isSubmitting = false;
      }
    }
  }

  function init() {
    emailInput.addEventListener('input', debounce(handleInput, 150));
    passwordInput.addEventListener('input', debounce(handleInput, 150));
    emailInput.addEventListener('blur', handleBlur);
    passwordInput.addEventListener('blur', handleBlur);
    toggleBtn.addEventListener('click', togglePasswordVisibility);
    form.addEventListener('submit', handleSubmit);

    updateSubmitState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
