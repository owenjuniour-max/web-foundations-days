// ============================================================
// Web Foundations - Day 3 Assignment: Notes Toolkit
// ============================================================

// Starting Data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

/**
 * 1. searchNotes(word)
 * Returns an array of notes whose text contains word, ignoring upper and lower case.
 * Uses filter, toLowerCase, and includes.
 */
function searchNotes(word) {
  const query = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(query));
}

/**
 * 2. longestNote()
 * Returns the note object with the most characters, or null if there are no notes.
 * Handles the empty array first, then compares lengths.
 */
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

/**
 * 3. countByCategory()
 * Returns an object counting notes per category, such as { personal: 2, work: 1, study: 2 }.
 * Loops over the notes and increases a counter in an object.
 */
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

/**
 * 4. getSummary()
 * Returns a sentence such as "5 notes: 2 personal, 1 work, 2 study."
 * Uses countByCategory and a template literal.
 * Uses "note" for exactly one note and "notes" otherwise.
 */
function getSummary() {
  const total = notes.length;
  const word = total === 1 ? "note" : "notes";

  if (total === 0) {
    return `0 ${word}.`;
  }

  const counts = countByCategory();
  const breakdown = Object.entries(counts)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");

  return `${total} ${word}: ${breakdown}.`;
}

/**
 * 5. isDuplicate(text)
 * Returns true if a note with the same text already exists (ignoring case and extra spaces).
 * Uses some, comparing trimmed lower-case text.
 */
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanedText);
}

/**
 * 6. addNote(text, category)
 * Adds a note only if it is 1–200 characters, is not a duplicate and the category
 * is one of personal, work or study.
 * Returns true when added and false otherwise, logging the reason.
 */
function addNote(text, category) {
  const trimmedText = text ? text.trim() : "";
  const validCategories = ["personal", "work", "study"];

  // Check 1: Length between 1 and 200 characters
  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log("Cannot add note: Text length must be between 1 and 200 characters.");
    return false;
  }

  // Check 2: Must not be duplicate
  if (isDuplicate(trimmedText)) {
    console.log("Cannot add note: A note with this text already exists.");
    return false;
  }

  // Check 3: Category validation (personal, work, or study)
  const lowerCategory = category ? category.trim().toLowerCase() : "";
  if (!validCategories.includes(lowerCategory)) {
    console.log(`Cannot add note: Invalid category "${category}". Must be personal, work, or study.`);
    return false;
  }

  // Generate unique next ID and push new note
  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  const newNote = {
    id: nextId,
    text: trimmedText,
    category: lowerCategory,
  };

  notes.push(newNote);
  return true;
}

// ============================================================
// Function Tests (Normal Cases & Edge Cases with Expected Output)
// ============================================================

console.log("--- 1. Testing searchNotes() ---");
// Normal case: search for a word present in note text (case-insensitive)
console.log(searchNotes("day"));
// Expected output: [ { id: 2, text: 'Finish the Day 3 assignment', category: 'study' } ]

// Edge case: search with word that does not exist in any note
console.log(searchNotes("xylophone"));
// Expected output: []

console.log("\n--- 2. Testing longestNote() ---");
// Normal case: finds note object with the most characters
console.log(longestNote());
// Expected output: { id: 3, text: 'Email the project report to Grace', category: 'work' }

// Edge case: empty notes array returns null
const originalNotes = [...notes];
notes = [];
console.log(longestNote());
// Expected output: null
notes = originalNotes; // restore notes for remaining tests

console.log("\n--- 3. Testing countByCategory() ---");
// Normal case: counts notes per category
console.log(countByCategory());
// Expected output: { personal: 2, study: 2, work: 1 }

// Edge case: single note array
notes = [{ id: 1, text: "Read a chapter", category: "study" }];
console.log(countByCategory());
// Expected output: { study: 1 }
notes = originalNotes; // restore notes

console.log("\n--- 4. Testing getSummary() ---");
// Normal case: multiple notes formatted with plural 'notes'
console.log(getSummary());
// Expected output: "5 notes: 2 personal, 2 study, 1 work."

// Edge case: exactly 1 note formatted with singular 'note'
notes = [{ id: 10, text: "Solo task", category: "work" }];
console.log(getSummary());
// Expected output: "1 note: 1 work."
notes = originalNotes; // restore notes

console.log("\n--- 5. Testing isDuplicate() ---");
// Normal case: exact duplicate with extra spaces and different casing
console.log(isDuplicate("  BUY MILK AND BREAD   "));
// Expected output: true

// Edge case: new unique note that does not exist
console.log(isDuplicate("Submit assignment before 5pm"));
// Expected output: false

console.log("\n--- 6. Testing addNote() ---");
// Normal case: valid note added successfully
console.log(addNote("Prepare presentation slides", "work"));
// Expected output: true

// Edge case 1: duplicate note rejected with logged reason
console.log(addNote("Call mum", "personal"));
// Expected output: Cannot add note: A note with this text already exists.
// Expected output: false

// Edge case 2: invalid category rejected with logged reason
console.log(addNote("Buy concert tickets", "entertainment"));
// Expected output: Cannot add note: Invalid category "entertainment". Must be personal, work, or study.
// Expected output: false

// Edge case 3: empty text rejected with logged reason
console.log(addNote("   ", "study"));
// Expected output: Cannot add note: Text length must be between 1 and 200 characters.
// Expected output: false
