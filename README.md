# 🚌 Village Bus Timings Application

A modern, user-friendly web application for searching and finding village bus timings and routes. Built with Node.js, Express, and vanilla JavaScript.

## ✨ Features

- 🔍 **Smart Search**: Search buses by departure location, destination, or any stop along the route
- 💡 **Autocomplete Suggestions**: Real-time suggestions as you type
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast & Efficient**: Optimized search with debouncing and efficient data handling
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- ♿ **Accessible**: Built with accessibility in mind (keyboard navigation, ARIA labels)
- 🛡️ **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd "Bus Timing"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure you have a `buses.json` file in the root directory with your bus data. See [Data Format](#data-format) below.

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Development Mode

For development with auto-reload (requires `nodemon`):
```bash
npm run dev
```

## 📁 Project Structure

```
Bus Timing/
├── server.js          # Express server and API endpoints
├── buses.json         # Bus data (JSON format)
├── package.json       # Project dependencies and scripts
├── .env.example       # Environment variables example
├── .gitignore        # Git ignore rules
├── README.md         # This file
└── public/           # Frontend files
    ├── index.html    # Main HTML file
    ├── style.css     # Stylesheet
    └── script.js     # Client-side JavaScript
```

## 📊 Data Format

The `buses.json` file should contain an array of bus objects with the following structure:

```json
[
  {
    "busNo": "TN30-12",
    "from": "tholasampatty",
    "to": "salem",
    "via": "tharamangalam",
    "time": "07:30 AM"
  },
  {
    "busNo": "TN30-45",
    "from": "tholasampatty",
    "to": "salem",
    "via": "omalur",
    "time": "09:15 AM"
  }
]
```

### Field Descriptions

- `busNo`: Bus number/identifier (string)
- `from`: Departure location (string)
- `to`: Destination location (string)
- `via`: Route via/intermediate stops (string)
- `time`: Departure time (string, format: "HH:MM AM/PM")

## 🔌 API Endpoints

### `GET /api/search`

Search for buses matching the criteria.

**Query Parameters:**
- `from` (optional): Departure location
- `to` (optional): Destination or stop location

**Example:**
```
GET /api/search?from=tholasampatty&to=salem
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "buses": [
    {
      "busNo": "TN30-12",
      "from": "tholasampatty",
      "to": "salem",
      "via": "tharamangalam",
      "time": "07:30 AM"
    }
  ]
}
```

### `GET /api/suggest`

Get autocomplete suggestions for locations.

**Query Parameters:**
- `q`: Search query (minimum 1 character)

**Example:**
```
GET /api/suggest?q=thola
```

**Response:**
```json
["tholasampatty", "tharamangalam"]
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "busesCount": 2,
  "timestamp": "2026-02-09T10:30:00.000Z"
}
```

## 🎯 Usage

1. **Search by Departure**: Enter a location in the "From" field
2. **Search by Destination**: Enter a location in the "To / Via" field
3. **Combined Search**: Enter both fields for more specific results
4. **Autocomplete**: Use the suggestions that appear as you type
5. **Keyboard Navigation**: Use arrow keys to navigate suggestions, Enter to select, Escape to close

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```env
PORT=3000
BUSES_FILE=buses.json
```

### Port Configuration

The server defaults to port 3000. To change it:

1. Set the `PORT` environment variable:
   ```bash
   PORT=8080 npm start
   ```

2. Or modify `server.js` directly (not recommended for production)

## 🔒 Security Features

- Input sanitization and validation
- XSS protection (HTML escaping)
- Error handling without exposing sensitive information
- Safe JSON parsing with error handling

## 🎨 Customization

### Styling

Modify `public/style.css` to customize the appearance. The CSS uses CSS variables for easy theming:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #10b981;
  /* ... more variables */
}
```

### Adding Features

The code is well-structured and modular. Key areas to extend:

- **Server**: Add new endpoints in `server.js`
- **Frontend**: Enhance UI/UX in `public/script.js` and `public/style.css`
- **Data**: Update `buses.json` with new bus routes

## 📝 Best Practices Implemented

- ✅ Error handling and validation
- ✅ Input sanitization
- ✅ Responsive design
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Code organization and modularity
- ✅ Performance optimization (debouncing)
- ✅ Security best practices
- ✅ Clean, maintainable code

## 🐛 Troubleshooting

### Server won't start

- Check if port 3000 is already in use
- Verify Node.js version: `node --version` (should be >= 14.0.0)
- Ensure `buses.json` exists and is valid JSON

### No suggestions appearing

- Check browser console for errors
- Verify API endpoint is accessible: `http://localhost:3000/api/suggest?q=test`
- Ensure `buses.json` contains valid data

### Search returns no results

- Verify search terms match data in `buses.json`
- Check that the search is case-insensitive (it should be)
- Try searching with partial matches

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on the repository.

---

Made with ❤️ for village travelers
