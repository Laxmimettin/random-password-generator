// Initialize Lucide Icons
lucide.createIcons();

// Elements
const lengthSlider = document.getElementById("lengthSlider");
const lengthInput = document.getElementById("lengthInput");
const chkUpper = document.getElementById("chkUpper");
const chkLower = document.getElementById("chkLower");
const chkNumbers = document.getElementById("chkNumbers");
const chkSymbols = document.getElementById("chkSymbols");
const chkExcludeAmbiguous = document.getElementById("chkExcludeAmbiguous");

const passwordOutput = document.getElementById("passwordOutput");
const generateBtn = document.getElementById("generateBtn");
const refreshBtn = document.getElementById("refreshBtn");
const copyBtn = document.getElementById("copyBtn");
const copyText = document.getElementById("copyText");
const copyIcon = document.getElementById("copyIcon");
const toast = document.getElementById("toast");

const strengthStatus = document.getElementById("strengthStatus");
const entropyText = document.getElementById("entropyText");
const crackEstimate = document.getElementById("crackEstimate");
const seg1 = document.getElementById("seg-1");
const seg2 = document.getElementById("seg-2");
const seg3 = document.getElementById("seg-3");
const seg4 = document.getElementById("seg-4");
const presetChips = document.querySelectorAll(".chip");

// Character Sets
const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};
const AMBIGUOUS = /[0O1lI]/g;

// Cryptographically Secure Random Number Generator
function getSecureRandomInt(max) {
  const array = new Uint32Array(1);
  const maxSafe = 0xffffffff - (0xffffffff % max);
  let rand;
  do {
    window.crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= maxSafe);
  return rand % max;
}

// Generate Password Logic
function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  let availableSets = [];

  if (chkUpper.checked) availableSets.push(CHARS.upper);
  if (chkLower.checked) availableSets.push(CHARS.lower);
  if (chkNumbers.checked) availableSets.push(CHARS.numbers);
  if (chkSymbols.checked) availableSets.push(CHARS.symbols);

  // Fallback: If nothing is checked, recheck lowercase
  if (availableSets.length === 0) {
    chkLower.checked = true;
    availableSets.push(CHARS.lower);
  }

  // Handle ambiguous characters filter
  if (chkExcludeAmbiguous.checked) {
    availableSets = availableSets.map((set) => set.replace(AMBIGUOUS, ""));
  }

  let fullPool = availableSets.join("");
  let passwordChars = [];

  // Guarantee at least one character from each selected set
  availableSets.forEach((set) => {
    if (set.length > 0) {
      const char = set[getSecureRandomInt(set.length)];
      passwordChars.push(char);
    }
  });

  // Fill remainder of the password length
  while (passwordChars.length < length) {
    const char = fullPool[getSecureRandomInt(fullPool.length)];
    passwordChars.push(char);
  }

  // Fisher-Yates Shuffle
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  const finalPassword = passwordChars.join("");
  renderHighlightedPassword(finalPassword);
  evaluateStrength(finalPassword, fullPool.length);
}

// Syntax Highlighting for Password Screen
function renderHighlightedPassword(password) {
  passwordOutput.innerHTML = "";
  for (let char of password) {
    const span = document.createElement("span");
    span.textContent = char;

    if (CHARS.upper.includes(char)) {
      span.className = "char-upper";
    } else if (CHARS.lower.includes(char)) {
      span.className = "char-lower";
    } else if (CHARS.numbers.includes(char)) {
      span.className = "char-num";
    } else {
      span.className = "char-sym";
    }
    passwordOutput.appendChild(span);
  }
}

// Evaluate Entropy & Strength
function evaluateStrength(password, poolSize) {
  const len = password.length;
  // Shannon Entropy: E = L * log2(R)
  const entropy = poolSize > 0 ? Math.floor(len * Math.log2(poolSize)) : 0;
  entropyText.textContent = `Entropy: ${entropy} bits`;

  // Reset segments
  [seg1, seg2, seg3, seg4].forEach(
    (seg) => (seg.style.background = "rgba(255,255,255,0.1)"),
  );

  if (entropy < 36) {
    strengthStatus.textContent = "Very Weak";
    strengthStatus.style.color = "#ef4444";
    crackEstimate.textContent = "Crack time: < 1 second";
    seg1.style.background = "#ef4444";
  } else if (entropy < 60) {
    strengthStatus.textContent = "Moderate";
    strengthStatus.style.color = "#f59e0b";
    crackEstimate.textContent = "Crack time: few minutes/hours";
    seg1.style.background = "#f59e0b";
    seg2.style.background = "#f59e0b";
  } else if (entropy < 85) {
    strengthStatus.textContent = "Strong";
    strengthStatus.style.color = "#06b6d4";
    crackEstimate.textContent = "Crack time: centuries";
    seg1.style.background = "#06b6d4";
    seg2.style.background = "#06b6d4";
    seg3.style.background = "#06b6d4";
  } else {
    strengthStatus.textContent = "Very Strong";
    strengthStatus.style.color = "#10b981";
    crackEstimate.textContent = "Crack time: trillions of years";
    [seg1, seg2, seg3, seg4].forEach(
      (seg) => (seg.style.background = "#10b981"),
    );
  }
}

// Copy to Clipboard
async function copyPassword() {
  const password = passwordOutput.textContent;
  if (!password || password === "Click Generate") return;

  try {
    await navigator.clipboard.writeText(password);
    copyBtn.classList.add("copied");
    copyText.textContent = "Copied!";
    showToast();

    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyText.textContent = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy", err);
  }
}

function showToast() {
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2200);
}

// Synchronize Slider & Numeric Input
lengthSlider.addEventListener("input", (e) => {
  lengthInput.value = e.target.value;
  generatePassword();
});

lengthInput.addEventListener("input", (e) => {
  let val = parseInt(e.target.value, 10);
  if (isNaN(val)) val = 16;
  if (val > 64) val = 64;
  if (val < 6) val = 6;
  lengthSlider.value = val;
  generatePassword();
});

// Event Listeners for Checkboxes
[chkUpper, chkLower, chkNumbers, chkSymbols, chkExcludeAmbiguous].forEach(
  (el) => {
    el.addEventListener("change", () => {
      // Prevent unchecking everything
      if (
        !chkUpper.checked &&
        !chkLower.checked &&
        !chkNumbers.checked &&
        !chkSymbols.checked
      ) {
        el.checked = true;
      }
      generatePassword();
    });
  },
);

// Presets Logic
presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    presetChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    const mode = chip.dataset.preset;
    if (mode === "all") {
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = true;
      chkExcludeAmbiguous.checked = false;
      lengthSlider.value = 16;
    } else if (mode === "easy") {
      chkUpper.checked = true;
      chkLower.checked = true;
      chkNumbers.checked = true;
      chkSymbols.checked = false;
      chkExcludeAmbiguous.checked = true;
      lengthSlider.value = 14;
    } else if (mode === "pin") {
      chkUpper.checked = false;
      chkLower.checked = false;
      chkNumbers.checked = true;
      chkSymbols.checked = false;
      chkExcludeAmbiguous.checked = false;
      lengthSlider.value = 6;
    }
    lengthInput.value = lengthSlider.value;
    generatePassword();
  });
});

// Button Triggers
generateBtn.addEventListener("click", generatePassword);
refreshBtn.addEventListener("click", () => {
  refreshBtn.style.transform = "rotate(180deg)";
  refreshBtn.style.transition = "transform 0.3s ease";
  setTimeout(() => (refreshBtn.style.transform = "none"), 300);
  generatePassword();
});
copyBtn.addEventListener("click", copyPassword);

// Initialize with a default password on load
generatePassword();
