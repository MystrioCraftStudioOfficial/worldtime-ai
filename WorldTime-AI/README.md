# WorldTime AI — Updated Project

WorldTime AI is a responsive world-clock and time-zone website with three themes, country flags, a time converter, and a conversational AI area.

## Features included

1. **Three themes:** Light, Dark, and Cosmic. The selected theme is saved in the current browser.
2. **Creator credit:** The footer includes `© 2026 WorldTime AI` and `Designed & Developed by MystrioCraft Studio`.
3. **Country flags:** City cards and city selection options display small national flags.
4. **New Chat:** Starts a separate conversation while keeping existing chats in the browser's local storage.
5. **Reset Chat:** Clears only the current conversation after a confirmation prompt; other chats remain.
6. **General-purpose AI:** The backend prompt permits general questions, coding, learning, technology, everyday discussion, and time-zone topics.
7. **Conversation context:** The full recent message history from the selected chat is sent to the AI backend.
8. **World clocks:** Live local times and date labels for the selected cities; add and remove supported city cards.
9. **Time zone converter:** Convert a selected local date/time from one city to another city.
10. **Responsive layout:** Works on desktop and mobile widths.

## Quick preview with VS Code Live Server

1. Extract `WorldTime-AI.zip`.
2. Open the extracted `WorldTime-AI` folder in VS Code.
3. Install/use the **Live Server** extension if it is not already installed.
4. Right-click `index.html` and choose **Open with Live Server**.

Themes, clocks, city flags, time conversion, and chat organization work in this mode. If the optional AI backend is not running, the assistant falls back to a clearly labelled demo mode; a static HTML page cannot securely call the AI API with a private key.

## Enable full AI answers (optional)

Full free-form answers need the local backend and your own API key. The key is kept server-side and is never placed in browser JavaScript.

1. Install **Python 3.10 or newer**. On Windows, the `py` launcher should be available.
2. Copy `.env.example` and name the copy `.env`.
3. Open `.env` and replace `replace_with_your_api_key` with your own API key. Do not share it or upload `.env` to GitHub.
4. Double-click `start_worldtime_ai.bat`. The first run creates a Python virtual environment, installs the required packages, and opens `.env` for you if needed. Run the batch file again after adding the key.
5. The app opens at `http://127.0.0.1:5000`. When the page says **AI backend connected**, the assistant can provide full AI-generated answers.

The included backend uses the OpenAI Responses API. Usage may incur charges depending on your provider account and current pricing; an API key is not included in this project. Only use an API account you are authorized to use, and have a parent or guardian review billing before enabling paid API access if needed.

## Files

- `index.html` — page structure
- `style.css` — responsive styles and all three themes
- `script.js` — clocks, city flags, converter, theme persistence, chat history, new/reset chat, and demo mode
- `app.py` — optional server-side AI backend
- `requirements.txt` — backend dependencies
- `.env.example` — placeholder environment configuration
- `.gitignore` — excludes secrets and local Python files
- `start_worldtime_ai.bat` — Windows setup and launch helper

## Notes

- The site stores theme, selected cities, and chats in this browser's local storage. Clearing browser storage can delete that local data.
- City options come from a curated list. Adding a city changes the visible clock grid; it does not add arbitrary time zones automatically.
- Time conversion uses the browser's IANA time-zone data. Ambiguous or nonexistent wall-clock times during daylight-saving transitions may require checking the displayed result.
- The project does not include an API key, database, user accounts, or cloud chat synchronization.
