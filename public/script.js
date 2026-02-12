// Application State
const AppState = {
  selectedSuggestionIndex: {
    from: -1,
    to: -1
  },
  currentSuggestions: {
    from: [],
    to: []
  }
};

// DOM Elements
const elements = {
  from: document.getElementById("from"),
  to: document.getElementById("to"),
  fromSuggestions: document.getElementById("from-suggestions"),
  toSuggestions: document.getElementById("to-suggestions"),
  searchForm: document.getElementById("searchForm"),
  searchBtn: document.getElementById("searchBtn"),
  swapBtn: document.getElementById("swapBtn"),
  result: document.getElementById("result"),
  error: document.getElementById("error")
};

// 🔁 Debounce utility
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 🛠️ Utility Functions
function showError(message) {
  elements.error.textContent = message;
  elements.error.style.display = "block";
  setTimeout(() => {
    elements.error.style.display = "none";
  }, 5000);
}

function hideError() {
  elements.error.style.display = "none";
}

function setLoading(isLoading) {
  const btnText = elements.searchBtn.querySelector(".btn-text");
  const btnLoader = elements.searchBtn.querySelector(".btn-loader");
  
  if (isLoading) {
    elements.searchBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "inline-block";
  } else {
    elements.searchBtn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.style.display = "none";
  }
}

function hideSuggestions(box) {
  box.classList.remove("show");
  box.innerHTML = "";
}

function showSuggestions(box, suggestions) {
  if (suggestions.length === 0) {
    hideSuggestions(box);
    return;
  }

  box.innerHTML = "";
  suggestions.forEach((place, index) => {
    const item = document.createElement("div");
    item.textContent = place;
    item.setAttribute("role", "option");
    item.setAttribute("tabindex", "0");
    
    item.addEventListener("click", () => selectSuggestion(box, place));
    item.addEventListener("mouseenter", () => {
      box.querySelectorAll("div").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
    });
    
    box.appendChild(item);
  });
  
  box.classList.add("show");
}

function selectSuggestion(suggestionsBox, value) {
  if (suggestionsBox === elements.fromSuggestions) {
    elements.from.value = value;
    hideSuggestions(elements.fromSuggestions);
    elements.from.focus();
  } else {
    elements.to.value = value;
    hideSuggestions(elements.toSuggestions);
    elements.to.focus();
  }
  AppState.selectedSuggestionIndex.from = -1;
  AppState.selectedSuggestionIndex.to = -1;
}

// 🔍 Fetch Suggestions
async function fetchSuggestions(query, field) {
  if (!query || query.trim().length < 1) {
    if (field === "from") {
      hideSuggestions(elements.fromSuggestions);
    } else {
      hideSuggestions(elements.toSuggestions);
    }
    return;
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(`/api/suggest?q=${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const suggestions = await response.json();
    
    if (field === "from") {
      AppState.currentSuggestions.from = suggestions;
      showSuggestions(elements.fromSuggestions, suggestions);
    } else {
      AppState.currentSuggestions.to = suggestions;
      showSuggestions(elements.toSuggestions, suggestions);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    // Don't show error for suggestions, just fail silently
  }
}

const debouncedFromSuggestions = debounce((query) => {
  fetchSuggestions(query, "from");
}, 300);

const debouncedToSuggestions = debounce((query) => {
  fetchSuggestions(query, "to");
}, 300);

// 🚌 Search Buses
async function searchBuses(from, to) {
  hideError();
  setLoading(true);
  
  const resultDiv = elements.result;
  resultDiv.innerHTML = '<div class="loading">🔍 Searching buses...</div>';

  try {
    const params = new URLSearchParams();
    if (from && from.trim()) params.append("from", from.trim());
    if (to && to.trim()) params.append("to", to.trim());

    const response = await fetch(`/api/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || "Search failed");
    }

    displayResults(data.buses || [], data.count || 0);
  } catch (error) {
    console.error("Search error:", error);
    showError(`Failed to search buses: ${error.message}`);
    resultDiv.innerHTML = '<div class="no-results"><div class="no-results-icon">⚠️</div><p>Unable to search buses. Please try again.</p></div>';
  } finally {
    setLoading(false);
  }
}

// 📋 Display Results
function displayResults(buses, count) {
  const resultDiv = elements.result;
  
  if (buses.length === 0) {
    resultDiv.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🚫</div>
        <p>No buses found matching your search criteria.</p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
          Try adjusting your search terms.
        </p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="results-header">
      Found <strong>${count}</strong> bus${count !== 1 ? "es" : ""}
    </div>
  `;

  buses.forEach(bus => {
    html += `
      <div class="bus-card">
        <div class="bus-header">
          <span class="bus-number">${escapeHtml(bus.busNo)}</span>
          <span class="bus-time">${escapeHtml(bus.time)}</span>
        </div>
        <div class="bus-route">
          <div class="route-path">
            <span class="route-from">${escapeHtml(bus.from)}</span>
            <span class="route-arrow">→</span>
            <span class="route-to">${escapeHtml(bus.to)}</span>
          </div>
          <div class="bus-via">Via: ${escapeHtml(bus.via)}</div>
        </div>
      </div>
    `;
  });

  resultDiv.innerHTML = html;
}

// 🔒 Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 🎯 Event Handlers
function handleSearch(event) {
  event.preventDefault();
  hideSuggestions(elements.fromSuggestions);
  hideSuggestions(elements.toSuggestions);
  
  const from = elements.from.value.trim();
  const to = elements.to.value.trim();
  
  if (!from && !to) {
    showError("Please enter at least one location (From or To)");
    return;
  }
  
  searchBuses(from, to);
}

function handleSwap() {
  const currentFrom = elements.from.value;
  const currentTo = elements.to.value;

  elements.from.value = currentTo;
  elements.to.value = currentFrom;

  hideError();
  hideSuggestions(elements.fromSuggestions);
  hideSuggestions(elements.toSuggestions);
}

// Keyboard Navigation for Suggestions
function handleSuggestionKeyboard(e, suggestionsBox, field) {
  const suggestions = suggestionsBox.querySelectorAll("div");
  if (suggestions.length === 0) return;

  let currentIndex = field === "from" 
    ? AppState.selectedSuggestionIndex.from 
    : AppState.selectedSuggestionIndex.to;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    currentIndex = Math.min(currentIndex + 1, suggestions.length - 1);
    suggestions[currentIndex].scrollIntoView({ block: "nearest" });
    suggestions.forEach(el => el.classList.remove("selected"));
    suggestions[currentIndex].classList.add("selected");
    
    if (field === "from") {
      AppState.selectedSuggestionIndex.from = currentIndex;
    } else {
      AppState.selectedSuggestionIndex.to = currentIndex;
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    currentIndex = Math.max(currentIndex - 1, -1);
    suggestions.forEach(el => el.classList.remove("selected"));
    if (currentIndex >= 0) {
      suggestions[currentIndex].classList.add("selected");
      suggestions[currentIndex].scrollIntoView({ block: "nearest" });
    }
    
    if (field === "from") {
      AppState.selectedSuggestionIndex.from = currentIndex;
    } else {
      AppState.selectedSuggestionIndex.to = currentIndex;
    }
  } else if (e.key === "Enter" && currentIndex >= 0) {
    e.preventDefault();
    const selected = suggestions[currentIndex];
    if (selected) {
      selectSuggestion(suggestionsBox, selected.textContent);
    }
  } else if (e.key === "Escape") {
    hideSuggestions(suggestionsBox);
    if (field === "from") {
      AppState.selectedSuggestionIndex.from = -1;
    } else {
      AppState.selectedSuggestionIndex.to = -1;
    }
  }
}

// 📱 Initialize Event Listeners
function initialize() {
  // From input events
  elements.from.addEventListener("input", (e) => {
    hideError();
    debouncedFromSuggestions(e.target.value);
    AppState.selectedSuggestionIndex.from = -1;
  });

  elements.from.addEventListener("keydown", (e) => {
    if (elements.fromSuggestions.classList.contains("show")) {
      handleSuggestionKeyboard(e, elements.fromSuggestions, "from");
    }
  });

  elements.from.addEventListener("focus", () => {
    if (AppState.currentSuggestions.from.length > 0) {
      showSuggestions(elements.fromSuggestions, AppState.currentSuggestions.from);
    }
  });

  // To input events
  elements.to.addEventListener("input", (e) => {
    hideError();
    debouncedToSuggestions(e.target.value);
    AppState.selectedSuggestionIndex.to = -1;
  });

  elements.to.addEventListener("keydown", (e) => {
    if (elements.toSuggestions.classList.contains("show")) {
      handleSuggestionKeyboard(e, elements.toSuggestions, "to");
    }
  });

  elements.to.addEventListener("focus", () => {
    if (AppState.currentSuggestions.to.length > 0) {
      showSuggestions(elements.toSuggestions, AppState.currentSuggestions.to);
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!elements.from.contains(e.target) && !elements.fromSuggestions.contains(e.target)) {
      hideSuggestions(elements.fromSuggestions);
    }
    if (!elements.to.contains(e.target) && !elements.toSuggestions.contains(e.target)) {
      hideSuggestions(elements.toSuggestions);
    }
  });

  // Form submission
  elements.searchForm.addEventListener("submit", handleSearch);

  // Swap button
  if (elements.swapBtn) {
    elements.swapBtn.addEventListener("click", handleSwap);
  }
}

// 🚀 Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
