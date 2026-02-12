const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const BUSES_FILE = path.join(__dirname, "buses.json");

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Helper function to load buses data
function loadBuses() {
  try {
    const data = fs.readFileSync(BUSES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading buses data:", error.message);
    return [];
  }
}

// Helper function to sanitize input
function sanitizeInput(str) {
  if (!str || typeof str !== "string") return "";
  return str.trim().toLowerCase();
}

// Helper function to validate bus data structure
function isValidBus(bus) {
  return (
    bus &&
    typeof bus === "object" &&
    bus.busNo &&
    bus.from &&
    bus.to &&
    bus.via &&
    bus.time
  );
}

// 🔍 Search buses
app.get("/api/search", (req, res) => {
  try {
    const { from, to } = req.query;
    const buses = loadBuses();

    // Input validation
    const fromQuery = sanitizeInput(from);
    const toQuery = sanitizeInput(to);

    // If no search criteria provided, return empty array
    if (!fromQuery && !toQuery) {
      return res.json([]);
    }

    const results = buses
      .filter(bus => {
        if (!isValidBus(bus)) return false;

        const fromMatch = fromQuery
          ? sanitizeInput(bus.from).includes(fromQuery)
          : true;

        const toMatch = toQuery
          ? (
              sanitizeInput(bus.to).includes(toQuery) ||
              sanitizeInput(bus.via).includes(toQuery)
            )
          : true;

        return fromMatch && toMatch;
      })
      .map(bus => ({
        busNo: bus.busNo,
        from: bus.from,
        to: bus.to,
        via: bus.via,
        time: bus.time
      }));

    res.json({
      success: true,
      count: results.length,
      buses: results
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

// 💡 Suggestions (autocomplete)
app.get("/api/suggest", (req, res) => {
  try {
    const q = sanitizeInput(req.query.q);
    
    if (!q || q.length < 1) {
      return res.json([]);
    }

    const buses = loadBuses();
    const places = new Set();

    buses.forEach(bus => {
      if (isValidBus(bus)) {
      const fromVal = sanitizeInput(bus.from);
      const toVal = sanitizeInput(bus.to);
      const viaVal = sanitizeInput(bus.via);

      // Only suggest places that START with what the user typed
      if (fromVal.startsWith(q)) places.add(bus.from);
      if (toVal.startsWith(q)) places.add(bus.to);
      if (viaVal.startsWith(q)) places.add(bus.via);
      }
    });

    // Sort suggestions alphabetically
    const suggestions = Array.from(places).sort();
    
    res.json(suggestions);
  } catch (error) {
    console.error("Suggest error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const buses = loadBuses();
  res.json({
    status: "ok",
    busesCount: buses.length,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.listen(PORT, () => {
  console.log(`🚌 Server running at http://localhost:${PORT}`);
  console.log(`📊 Loaded ${loadBuses().length} bus routes`);
});
