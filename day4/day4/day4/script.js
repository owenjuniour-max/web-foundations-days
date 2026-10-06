// Select required DOM elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Storage keys
const DRAFT_KEY = "note_draft";
const THEME_KEY = "theme";

/**
 * Updates character count, word count, and counter warning classes
 */
function updateCounts() {
  const text = noteText.value;
  const chars = text.length;

  // Character counter: "N / 200 characters"
  charCount.textContent = `${chars} / 200 characters`;

  // Warning classes:
  // warning: orange text when over 180 characters
  // over: red, bold text when over 200 characters
  if (chars > 200) {
    charCount.classList.remove("warning");
    charCount.classList.add("over");
  } else if (chars > 180) {
    charCount.classList.add("warning");
    charCount.classList.remove("over");
  } else {
    charCount.classList.remove("warning");
    charCount.classList.remove("over");
  }

  // Word counter: "N words"
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  wordCount.textContent = `${words} words`;
}

/**
 * Saves current note draft to localStorage
 */
function saveDraft() {
  localStorage.setItem(DRAFT_KEY, noteText.value);
}

/**
 * Clears the textarea, resets counters, and removes draft from localStorage
 */
function clearAll() {
  noteText.value = "";
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
}

/**
 * Toggles dark mode, updates button label, and persists choice
 */
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

// Event Listeners

// 1. Input event on textarea: update counts and save draft
noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

// 2. Clear button click: clear everything
clearBtn.addEventListener("click", clearAll);

// 3. Escape key inside textarea: clear everything
noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// 4. Theme toggle button click
themeToggle.addEventListener("click", toggleTheme);

// Initialize on page load: restore draft, restore theme, update counts
window.addEventListener("DOMContentLoaded", () => {
  // Restore theme
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }

  // Restore draft
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  // Update counts
  updateCounts();
});
