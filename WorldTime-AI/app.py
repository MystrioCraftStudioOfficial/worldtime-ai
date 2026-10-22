"""Optional WorldTime AI backend. The website's clocks/themes also work without this server."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder=None)
API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
API_KEY_CONFIGURED = bool(API_KEY) and not API_KEY.lower().startswith("replace_")
MODEL = os.getenv("OPENAI_MODEL", "gpt-6-luna").strip() or "gpt-6-luna"
RESPONSES_URL = "https://api.openai.com/v1/responses"
INSTRUCTIONS = (
    "You are WorldTime AI Assistant, a friendly and helpful general-purpose assistant inside a world-time website. "
    "Answer questions about world clocks, time zones, coding, learning, technology, writing, and everyday topics. "
    "Do not restrict yourself to time-related questions. Use prior messages in the current conversation to maintain context. "
    "If the user tells you their name, remember it within this conversation. Be clear, respectful, and concise. "
    "Do not claim to have live information unless it is supplied in the prompt or you can derive it reliably. "
    "If asked for the current time in a city, explain that exact live-time data should be checked with the site's world clocks."
)


@app.after_request
def add_cors_headers(response):
    # Allows the browser Live Server (usually port 5500) to contact this local backend.
    if request.path.startswith("/api/"):
        origin = request.headers.get("Origin", "")
        origin_host = (urlparse(origin).hostname or "").lower()
        # Permit only loopback origins (VS Code Live Server or this local app).
        if origin_host in {"localhost", "127.0.0.1", "::1"}:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:filename>")
def static_files(filename: str):
    if filename.startswith("api/") or filename == ".env" or filename.startswith("."):
        return jsonify({"error": "Not found."}), 404
    return send_from_directory(BASE_DIR, filename)


@app.route("/api/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return ("", 204)
    return jsonify({"ok": True, "configured": API_KEY_CONFIGURED, "model": MODEL if API_KEY_CONFIGURED else None})


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return ("", 204)
    if not API_KEY_CONFIGURED:
        return jsonify({"error": "AI backend is running, but OPENAI_API_KEY is not set. Copy .env.example to .env and add your API key there."}), 503

    payload: dict[str, Any] = request.get_json(silent=True) or {}
    incoming = payload.get("messages", [])
    if not isinstance(incoming, list):
        return jsonify({"error": "Messages must be a list."}), 400

    clean_messages = []
    for item in incoming[-24:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if role not in ("user", "assistant") or not isinstance(content, str):
            continue
        content = content.strip()
        if content:
            clean_messages.append({"role": role, "content": content[:6000]})

    if not clean_messages or clean_messages[-1]["role"] != "user":
        return jsonify({"error": "Send a user message to start the conversation."}), 400

    try:
        response = requests.post(
            RESPONSES_URL,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json={"model": MODEL, "instructions": INSTRUCTIONS, "input": clean_messages, "max_output_tokens": 900},
            timeout=45,
        )
    except requests.RequestException:
        app.logger.exception("Could not reach the AI provider")
        return jsonify({"error": "Could not reach the AI service. Check your internet connection and try again."}), 502

    if not response.ok:
        # Keep provider diagnostics in the server log; send a safe, actionable message to the browser.
        app.logger.warning("AI provider request failed with status %s: %s", response.status_code, response.text[:1000])
        if response.status_code in (401, 403):
            return jsonify({"error": "The AI provider rejected the API key. Check OPENAI_API_KEY in your .env file."}), 503
        if response.status_code == 429:
            return jsonify({"error": "The AI service is rate-limited or your account has no available quota. Check your provider account and try again later."}), 503
        return jsonify({"error": f"The AI service returned an error (HTTP {response.status_code}). Check the server terminal for details."}), 502

    try:
        data = response.json()
        fragments = []
        for output_item in data.get("output", []):
            if output_item.get("type") != "message":
                continue
            for content_item in output_item.get("content", []):
                if content_item.get("type") == "output_text" and isinstance(content_item.get("text"), str):
                    fragments.append(content_item["text"])
        reply = "\n".join(part for part in fragments if part).strip()
    except (ValueError, TypeError, AttributeError):
        app.logger.exception("Could not parse AI provider response")
        return jsonify({"error": "The AI service returned an unreadable response."}), 502

    if not reply:
        return jsonify({"error": "The AI service did not return a text answer. Please try again."}), 502
    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
