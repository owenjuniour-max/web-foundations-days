// ============================================================
// Day 5: Asynchronous User Directory (users.js)
// ============================================================

// Select required DOM elements
const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMsg = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store fetched users in memory for instant client-side filtering
let allUsers = [];

/**
 * Draws an array of users onto the page using createElement and textContent
 * @param {Array} list - Array of user objects
 */
function renderUsers(list) {
  // Clear previous list content
  while (usersList.firstChild) {
    usersList.removeChild(usersList.firstChild);
  }

  // If filtered list is empty, display the required message
  if (list.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-message";
    emptyItem.textContent = "No users match your filter.";
    usersList.appendChild(emptyItem);
    return;
  }

  // Render each user card with name, email, city, and company name
  list.forEach((user) => {
    const card = document.createElement("li");
    card.className = "user-card";

    // User Name
    const nameEl = document.createElement("h2");
    nameEl.className = "user-name";
    nameEl.textContent = user.name;

    // User Email
    const emailEl = document.createElement("p");
    emailEl.className = "user-info";
    emailEl.textContent = `Email: ${user.email}`;

    // User City (from user.address.city)
    const cityEl = document.createElement("p");
    cityEl.className = "user-info";
    const city = user.address && user.address.city ? user.address.city : "N/A";
    cityEl.textContent = `City: ${city}`;

    // Company Name (from user.company.name)
    const companyEl = document.createElement("p");
    companyEl.className = "user-info";
    const company = user.company && user.company.name ? user.company.name : "N/A";
    companyEl.textContent = `Company: ${company}`;

    // Assemble user card
    card.appendChild(nameEl);
    card.appendChild(emailEl);
    card.appendChild(cityEl);
    card.appendChild(companyEl);

    usersList.appendChild(card);
  });
}

/**
 * Asynchronously loads users from JSONPlaceholder API
 */
async function loadUsers() {
  // Update status and disable button while loading
  statusMsg.textContent = "Loading users...";
  statusMsg.className = "";
  loadBtn.disabled = true;

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");

    // Check HTTP status response.ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allUsers = data;

    // Display success message
    statusMsg.textContent = `Successfully loaded ${allUsers.length} users.`;
    statusMsg.className = "success";

    // Clear filter input on fresh load and render
    filterInput.value = "";
    renderUsers(allUsers);
  } catch (error) {
    // Display error message
    statusMsg.textContent = `Failed to load users: ${error.message}`;
    statusMsg.className = "error";

    // Clear list if fetch failed
    while (usersList.firstChild) {
      usersList.removeChild(usersList.firstChild);
    }
  } finally {
    // Always re-enable button when operation finishes
    loadBtn.disabled = false;
  }
}

/**
 * Filter users by name in real time without making new network requests
 */
function handleFilter() {
  const query = filterInput.value.trim().toLowerCase();
  const filtered = allUsers.filter((user) =>
    user.name.toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

// Event Listeners
loadBtn.addEventListener("click", loadUsers);
filterInput.addEventListener("input", handleFilter);
