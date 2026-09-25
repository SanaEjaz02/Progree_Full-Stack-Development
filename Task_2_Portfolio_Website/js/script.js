const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const copyEmailButton = document.querySelector('#copy-email');
const copyEmailLabel = document.querySelector('.copy-email-label');
const copyStatus = document.querySelector('#copy-status');
const emailAddress = 'hafizasanaawan@gmail.com';

function setMenuState(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  navigation.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-is-open', isOpen);
}

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      menuToggle.focus();
    }
  });
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    input.remove();
  }
  return copied;
}

async function copyEmail() {
  let copied = false;
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(emailAddress);
      copied = true;
    } catch {
      copied = false;
    }
  }
  if (!copied) {
    copied = fallbackCopy(emailAddress);
  }

  copyEmailLabel.textContent = copied ? 'Copied!' : 'Copy failed';
  copyStatus.textContent = copied ? 'Email address copied to clipboard.' : 'Unable to copy the email address.';
  window.setTimeout(() => {
    copyEmailLabel.textContent = emailAddress;
    copyStatus.textContent = '';
  }, 2000);
}

if (copyEmailButton && copyEmailLabel && copyStatus) {
  copyEmailButton.addEventListener('click', copyEmail);
}
