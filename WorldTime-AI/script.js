(() => {
  'use strict';

  const CITIES = [
    { id: 'new-delhi', name: 'New Delhi', country: 'India', flag: '🇮🇳', zone: 'Asia/Kolkata' },
    { id: 'mumbai', name: 'Mumbai', country: 'India', flag: '🇮🇳', zone: 'Asia/Kolkata' },
    { id: 'new-york', name: 'New York', country: 'United States', flag: '🇺🇸', zone: 'America/New_York' },
    { id: 'los-angeles', name: 'Los Angeles', country: 'United States', flag: '🇺🇸', zone: 'America/Los_Angeles' },
    { id: 'london', name: 'London', country: 'United Kingdom', flag: '🇬🇧', zone: 'Europe/London' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', zone: 'Asia/Tokyo' },
    { id: 'sydney', name: 'Sydney', country: 'Australia', flag: '🇦🇺', zone: 'Australia/Sydney' },
    { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', zone: 'Asia/Dubai' },
    { id: 'singapore', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', zone: 'Asia/Singapore' },
    { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', zone: 'Europe/Paris' },
    { id: 'toronto', name: 'Toronto', country: 'Canada', flag: '🇨🇦', zone: 'America/Toronto' },
    { id: 'berlin', name: 'Berlin', country: 'Germany', flag: '🇩🇪', zone: 'Europe/Berlin' },
    { id: 'seoul', name: 'Seoul', country: 'South Korea', flag: '🇰🇷', zone: 'Asia/Seoul' },
    { id: 'bangkok', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', zone: 'Asia/Bangkok' },
    { id: 'cairo', name: 'Cairo', country: 'Egypt', flag: '🇪🇬', zone: 'Africa/Cairo' },
    { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', flag: '🇿🇦', zone: 'Africa/Johannesburg' },
    { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', flag: '🇧🇷', zone: 'America/Sao_Paulo' },
    { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', flag: '🇲🇽', zone: 'America/Mexico_City' },
    { id: 'auckland', name: 'Auckland', country: 'New Zealand', flag: '🇳🇿', zone: 'Pacific/Auckland' },
    { id: 'honolulu', name: 'Honolulu', country: 'United States', flag: '🇺🇸', zone: 'Pacific/Honolulu' },
    { id: 'moscow', name: 'Moscow', country: 'Russia', flag: '🇷🇺', zone: 'Europe/Moscow' },
    { id: 'rome', name: 'Rome', country: 'Italy', flag: '🇮🇹', zone: 'Europe/Rome' },
    { id: 'beijing', name: 'Beijing', country: 'China', flag: '🇨🇳', zone: 'Asia/Shanghai' },
    { id: 'karachi', name: 'Karachi', country: 'Pakistan', flag: '🇵🇰', zone: 'Asia/Karachi' },
    { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', flag: '🇧🇩', zone: 'Asia/Dhaka' },
    { id: 'istanbul', name: 'Istanbul', country: 'Türkiye', flag: '🇹🇷', zone: 'Europe/Istanbul' },
    { id: 'nairobi', name: 'Nairobi', country: 'Kenya', flag: '🇰🇪', zone: 'Africa/Nairobi' },
    { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', flag: '🇮🇸', zone: 'Atlantic/Reykjavik' }
  ];

  const $ = (id) => document.getElementById(id);
  const storage = {
    get(key, fallback) {
      try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage may be disabled */ }
    }
  };

  let visibleCities = storage.get('worldtime-cities', ['new-delhi', 'tokyo', 'new-york', 'london', 'dubai', 'sydney']);
  if (!Array.isArray(visibleCities)) visibleCities = ['new-delhi', 'tokyo', 'new-york', 'london', 'dubai', 'sydney'];
  visibleCities = [...new Set(visibleCities.filter(id => CITIES.some(city => city.id === id)))];
  let toastTimer;
  let isSending = false;

  function toast(message) {
    const element = $('toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
  }

  function getCity(id) { return CITIES.find(city => city.id === id); }
  function getCurrentZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone'; }
    catch { return 'Local time zone'; }
  }

  function formatTime(date, zone, includeSeconds = false) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, hour: '2-digit', minute: '2-digit', ...(includeSeconds ? { second: '2-digit' } : {}), hourCycle: 'h23'
    }).format(date);
  }

  function formatDate(date, zone, options = {}) {
    return new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', ...options }).format(date);
  }

  function getZoneLabel(date, zone) {
    try {
      return new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || zone;
    } catch { return zone; }
  }

  function updateLocalTime() {
    const now = new Date();
    $('localTime').textContent = formatTime(now, getCurrentZone(), true);
    $('localDate').textContent = formatDate(now, getCurrentZone(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    $('localZone').textContent = getCurrentZone().replaceAll('_', ' ');
  }

  function renderCityOptions() {
    $('cityOptions').replaceChildren();
    const fragment = document.createDocumentFragment();
    CITIES.forEach(city => {
      const option = document.createElement('option');
      option.value = city.name;
      option.label = `${city.flag} ${city.country} · ${city.zone}`;
      fragment.append(option);
    });
    $('cityOptions').append(fragment);
  }

  function renderClockCards() {
    const grid = $('clockGrid');
    grid.replaceChildren();
    if (!visibleCities.length) {
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.textContent = 'No cities selected yet. Search above to add your first city.';
      grid.append(empty);
      return;
    }
    const now = new Date();
    visibleCities.forEach(id => {
      const city = getCity(id);
      if (!city) return;
      const card = document.createElement('article');
      card.className = 'clock-card';
      card.dataset.cityId = city.id;

      const top = document.createElement('div');
      top.className = 'clock-card-top';
      const flag = document.createElement('span');
      flag.className = 'country-flag'; flag.setAttribute('aria-label', `${city.country} flag`); flag.textContent = city.flag;
      const title = document.createElement('div'); title.className = 'clock-title';
      const name = document.createElement('h3'); name.textContent = city.name;
      const country = document.createElement('p'); country.textContent = city.country;
      title.append(name, country);
      const remove = document.createElement('button'); remove.className = 'remove-city'; remove.type = 'button'; remove.textContent = '×'; remove.title = `Remove ${city.name}`; remove.setAttribute('aria-label', `Remove ${city.name}`);
      remove.addEventListener('click', () => removeCity(city.id));
      top.append(flag, title, remove);

      const time = document.createElement('div'); time.className = 'clock-time'; time.dataset.clockTime = city.id; time.textContent = formatTime(now, city.zone, true);
      const bottom = document.createElement('div'); bottom.className = 'clock-bottom';
      const date = document.createElement('span'); date.dataset.clockDate = city.id; date.textContent = formatDate(now, city.zone, { weekday: 'short', month: 'short', day: 'numeric' });
      const offset = document.createElement('span'); offset.className = 'clock-offset'; offset.dataset.clockOffset = city.id; offset.textContent = getZoneLabel(now, city.zone);
      bottom.append(date, offset);
      card.append(top, time, bottom);
      grid.append(card);
    });
    storage.set('worldtime-cities', visibleCities);
  }

  function updateClockCards() {
    const now = new Date();
    document.querySelectorAll('[data-clock-time]').forEach(el => {
      const city = getCity(el.dataset.clockTime);
      if (city) el.textContent = formatTime(now, city.zone, true);
    });
    document.querySelectorAll('[data-clock-date]').forEach(el => {
      const city = getCity(el.dataset.clockDate);
      if (city) el.textContent = formatDate(now, city.zone, { weekday: 'short', month: 'short', day: 'numeric' });
    });
    document.querySelectorAll('[data-clock-offset]').forEach(el => {
      const city = getCity(el.dataset.clockOffset);
      if (city) el.textContent = getZoneLabel(now, city.zone);
    });
  }

  function addCity() {
    const query = $('citySearch').value.trim().toLocaleLowerCase();
    $('cityMessage').textContent = '';
    if (!query) { $('cityMessage').textContent = 'Type a city name first.'; return; }
    const city = CITIES.find(item => item.name.toLocaleLowerCase() === query || `${item.name} ${item.country}`.toLocaleLowerCase() === query || item.country.toLocaleLowerCase() === query);
    if (!city) {
      $('cityMessage').textContent = 'That city is not in the current list. Try Tokyo, London, New Delhi, Dubai, Paris, or another suggested city.';
      return;
    }
    if (visibleCities.includes(city.id)) {
      $('cityMessage').textContent = `${city.name} is already on your world clocks.`;
      return;
    }
    visibleCities.push(city.id);
    renderClockCards();
    updateClockCards();
    $('citySearch').value = '';
    $('cityMessage').textContent = `${city.flag} ${city.name} added to your clocks.`;
  }

  function removeCity(id) {
    visibleCities = visibleCities.filter(item => item !== id);
    renderClockCards();
    updateClockCards();
    const city = getCity(id);
    if (city) toast(`${city.name} removed from your clocks.`);
  }

  function populateZoneSelects() {
    ['fromCity', 'toCity'].forEach(selectId => {
      const select = $(selectId);
      select.replaceChildren();
      CITIES.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = `${city.flag} ${city.name} — ${city.country}`;
        select.append(option);
      });
    });
    $('fromCity').value = 'new-delhi';
    $('toCity').value = 'new-york';
    $('sourceDateTime').value = toLocalInputValue(new Date());
    convertTime();
  }

  function toLocalInputValue(date) {
    const pad = number => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function zonedLocalTimeToUtc(value, zone) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) throw new Error('Choose a valid date and time.');
    const [, year, month, day, hour, minute] = match.map(Number);
    const intendedUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    let guess = intendedUtc;
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });
    for (let i = 0; i < 4; i += 1) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map(part => [part.type, part.value]));
      const representedUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
      const difference = intendedUtc - representedUtc;
      guess += difference;
      if (difference === 0) break;
    }
    return new Date(guess);
  }

  function convertTime(event) {
    if (event) event.preventDefault();
    const from = getCity($('fromCity').value);
    const to = getCity($('toCity').value);
    const input = $('sourceDateTime').value;
    const panel = $('conversionResult');
    try {
      if (!from || !to || !input) throw new Error('Choose both cities and a date/time.');
      const instant = zonedLocalTimeToUtc(input, from.zone);
      const dateText = new Intl.DateTimeFormat('en-US', { timeZone: to.zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(instant);
      const timeText = formatTime(instant, to.zone, false);
      panel.replaceChildren();
      const label = document.createElement('span'); label.className = 'result-label'; label.textContent = `TIME IN ${to.name.toLocaleUpperCase()}`;
      const strong = document.createElement('strong'); strong.textContent = timeText;
      const date = document.createElement('small'); date.textContent = dateText;
      const zone = document.createElement('small'); zone.textContent = `${getZoneLabel(instant, to.zone)} · ${to.zone}`;
      panel.append(label, strong, date, zone);
    } catch (error) {
      panel.replaceChildren();
      const strong = document.createElement('strong'); strong.textContent = 'Unable to convert';
      const small = document.createElement('small'); small.textContent = error.message || 'Check the date, time, and selected cities.';
      panel.append(strong, small);
    }
  }

  function applyTheme(theme) {
    if (!['light', 'dark', 'cosmic'].includes(theme)) theme = 'cosmic';
    document.body.dataset.theme = theme;
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    storage.set('worldtime-theme', theme);
  }

  function createChat() {
    return { id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: 'New conversation', updatedAt: Date.now(), messages: [] };
  }

  let chats = storage.get('worldtime-chats', []);
  if (!Array.isArray(chats)) chats = [];
  chats = chats.filter(chat => chat && typeof chat.id === 'string' && Array.isArray(chat.messages));
  let currentChatId = storage.get('worldtime-current-chat', null);
  if (!chats.length) { const first = createChat(); chats.push(first); currentChatId = first.id; }
  if (!chats.some(chat => chat.id === currentChatId)) currentChatId = chats[0].id;

  function currentChat() { return chats.find(chat => chat.id === currentChatId) || chats[0]; }
  function saveChats() {
    chats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    storage.set('worldtime-chats', chats);
    storage.set('worldtime-current-chat', currentChatId);
  }

  function makeChatMessage(role, content, extraClass = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-message ${role}${extraClass ? ` ${extraClass}` : ''}`;
    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = role === 'user' ? 'You' : 'WorldTime AI';
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    wrapper.append(author, bubble);
    return wrapper;
  }

  function renderChatHistory() {
    const list = $('chatHistory');
    list.replaceChildren();
    $('historyCount').textContent = String(chats.length);
    const sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    if (!sorted.length) {
      const empty = document.createElement('div'); empty.className = 'history-empty'; empty.textContent = 'Your conversations will show here.'; list.append(empty); return;
    }
    sorted.forEach(chat => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = `history-item${chat.id === currentChatId ? ' active' : ''}`;
      button.setAttribute('aria-current', chat.id === currentChatId ? 'true' : 'false');
      const text = document.createElement('span'); text.textContent = chat.title || 'New conversation';
      button.append(text);
      button.addEventListener('click', () => {
        currentChatId = chat.id; saveChats(); renderChatHistory(); renderCurrentChat();
      });
      list.append(button);
    });
  }

  function renderCurrentChat() {
    const chat = currentChat();
    $('currentChatTitle').textContent = chat.title || 'New conversation';
    const messages = $('chatMessages'); messages.replaceChildren();
    if (!chat.messages.length) {
      const welcome = document.createElement('div'); welcome.className = 'welcome-chat';
      const orb = document.createElement('div'); orb.className = 'welcome-orb'; orb.textContent = '✦';
      const title = document.createElement('h3'); title.textContent = 'What can I help you with?';
      const para = document.createElement('p'); para.textContent = 'Ask me about world time, or start a completely different conversation.';
      const suggestions = document.createElement('div'); suggestions.className = 'suggestion-list';
      ['What time is it in Tokyo?', 'Help me learn JavaScript', 'What can you help me with?'].forEach(value => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'suggestion'; button.textContent = value;
        button.addEventListener('click', () => sendMessage(value)); suggestions.append(button);
      });
      welcome.append(orb, title, para, suggestions); messages.append(welcome);
    } else {
      chat.messages.forEach(message => {
        if (message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string') messages.append(makeChatMessage(message.role, message.content));
      });
      messages.scrollTop = messages.scrollHeight;
    }
    renderChatHistory();
  }

  function appendMessage(chat, role, content) {
    chat.messages.push({ role, content: String(content), timestamp: Date.now() });
    chat.updatedAt = Date.now();
    if (role === 'user' && (chat.title === 'New conversation' || !chat.title)) {
      const clean = content.replace(/\s+/g, ' ').trim();
      chat.title = clean.length > 32 ? `${clean.slice(0, 32)}…` : clean || 'New conversation';
    }
    saveChats();
  }

  function getLocalName(messages) {
    const patterns = [/(?:my name is|call me)\s+([a-z][a-z .'-]{0,40})/i, /mera naam\s+([\p{L}][\p{L} .'-]{0,40})(?:\s+hai)?/iu, /मेरा नाम\s+([\p{L}][\p{L} .'-]{0,40}?)(?:\s+है|[।,.!?]|$)/u];
    for (const message of [...messages].reverse()) {
      if (message.role !== 'user') continue;
      for (const pattern of patterns) {
        const match = message.content.match(pattern);
        if (match && match[1]) return match[1].trim().replace(/\s+hai$/i, '').replace(/\s+है$/u, '').trim();
      }
    }
    return null;
  }

  function demoReply(prompt, messages) {
    const text = prompt.toLocaleLowerCase();
    const name = getLocalName(messages.slice(0, -1));
    if (/(what is my name|what's my name|do you know my name|mera naam kya hai|मेरा नाम क्या है|मुझे क्या नाम बताया)/i.test(prompt)) {
      return name ? `You told me your name is ${name}. 😊` : 'You have not told me your name in this conversation yet. Tell me, and I will keep it in mind while this chat is open.';
    }
    const nameMatch = prompt.match(/(?:my name is|call me)\s+([a-z][a-z .'-]{0,40})/i) || prompt.match(/mera naam\s+([\p{L}][\p{L} .'-]{0,40})(?:\s+hai)?/iu) || prompt.match(/मेरा नाम\s+([\p{L}][\p{L} .'-]{0,40}?)(?:\s+है|[।,.!?]|$)/u);
    if (nameMatch && nameMatch[1]) return `Nice to meet you, ${nameMatch[1].trim().replace(/[.,!?]+$/, '')}! 😊 I'll keep that in context during this conversation.`;
    if (/(your name|who are you|तुम कौन|तुम्हारा नाम|aap kaun|tum kaun)/i.test(prompt)) return 'I am the WorldTime AI Assistant — your helper for world clocks, time zones, coding, learning, technology, and general questions.';
    if (/^(hi|hello|hey|namaste|नमस्ते|हेलो|हाय)[!. ]*$/i.test(prompt.trim())) return 'Hey there! 👋 What would you like to explore today? We can talk about world time, coding, learning, or something completely different.';
    if (/(what time|current time|time in|time zone|timezone|समय|कितने बजे|टाइम ज़ोन|टाइमजोन)/i.test(prompt)) {
      const city = CITIES.find(item => text.includes(item.name.toLocaleLowerCase()));
      const zone = city?.zone || getCurrentZone();
      const label = city ? `${city.flag} ${city.name}` : 'your local area';
      return `Right now, the time in ${label} is ${formatTime(new Date(), zone, true)} (${getZoneLabel(new Date(), zone)}).\n\nThis is a local demo response. Connect the optional AI backend to ask follow-up questions and get full AI-powered answers.`;
    }
    if (/(what can you do|help me|how can you help|क्या कर सकते|मदद कर सकते)/i.test(prompt)) return 'I can help with world clocks, time-zone conversion, coding concepts, study questions, technology, writing, brainstorming, and everyday questions. For full free-form AI answers, connect the optional backend using the setup steps in README.md.';
    if (/(thank you|thanks|धन्यवाद|शुक्रिया)/i.test(prompt)) return 'You’re welcome! 😊 What would you like to explore next?';
    return 'I can keep this chat organized and handle basic greetings, name-in-chat, and time questions in demo mode. To answer general questions properly, the full AI connection needs to be enabled: copy `.env.example` to `.env`, add your own API key, then run `start_worldtime_ai.bat`. See README.md for the steps.';
  }

  function setAIStatus(mode, text) {
    const status = $('aiStatus');
    status.className = `ai-status ${mode || ''}`.trim();
    status.replaceChildren();
    const dot = document.createElement('span'); dot.className = 'status-dot';
    const label = document.createElement('span'); label.textContent = text;
    status.append(dot, label);
  }

  async function checkBackend() {
    const endpoint = getBackendBase() + '/api/health';
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('Not available');
      const data = await response.json();
      if (data.configured) setAIStatus('connected', 'AI backend connected');
      else setAIStatus('error', 'Backend needs API key');
    } catch {
      setAIStatus('demo', 'AI demo mode');
    }
  }

  function getBackendBase() {
    if (location.port === '5000') return location.origin;
    return 'http://127.0.0.1:5000';
  }

  async function getAIReply(messages) {
    const response = await fetch(`${getBackendBase()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.slice(-24).map(message => ({ role: message.role, content: message.content })) })
    });
    let data = {};
    try { data = await response.json(); } catch { /* handled below */ }
    if (!response.ok) {
      const error = new Error(data.error || `AI service returned an error (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The AI service returned an empty reply.');
    setAIStatus('connected', 'AI backend connected');
    return data.reply.trim();
  }

  async function sendMessage(value) {
    const prompt = String(value ?? $('chatInput').value).trim();
    if (!prompt || isSending) return;
    isSending = true;
    $('chatInput').value = '';
    autoResizeInput();
    $('sendButton').disabled = true;
    const chat = currentChat();
    appendMessage(chat, 'user', prompt);
    renderCurrentChat();
    const messages = $('chatMessages');
    const pending = makeChatMessage('assistant', 'Thinking…', 'pending');
    pending.querySelector('.message-bubble').innerHTML = '<span class="typing-dots" aria-label="Thinking">•••</span>';
    messages.append(pending);
    messages.scrollTop = messages.scrollHeight;

    try {
      let reply;
      try {
        reply = await getAIReply(chat.messages);
      } catch (error) {
        if (error.status === 503 || error.status === 401 || error.status === 403 || error.status === 429) {
          setAIStatus('error', 'AI setup required');
          reply = error.message || 'The AI backend needs configuration. Check the README setup steps.';
        } else {
          setAIStatus('demo', 'AI demo mode');
          reply = demoReply(prompt, chat.messages);
        }
      }
      pending.remove();
      appendMessage(chat, 'assistant', reply);
      renderCurrentChat();
    } catch (error) {
      pending.remove();
      appendMessage(chat, 'assistant', `Sorry, something went wrong. ${error.message || 'Please try again.'}`);
      renderCurrentChat();
    } finally {
      isSending = false;
      $('sendButton').disabled = false;
      $('chatInput').focus();
    }
  }

  function autoResizeInput() {
    const input = $('chatInput');
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  function newChat() {
    const chat = createChat();
    chats.unshift(chat);
    currentChatId = chat.id;
    saveChats();
    renderCurrentChat();
    $('chatInput').focus();
    toast('New conversation started. Your previous chats are still saved.');
  }

  function resetChat() {
    const chat = currentChat();
    if (isSending) { toast('Wait for the current AI response before resetting this chat.'); return; }
    if (!window.confirm('Reset this conversation? Its messages will be cleared. Other chats will remain saved.')) return;
    chat.messages = [];
    chat.title = 'New conversation';
    chat.updatedAt = Date.now();
    saveChats();
    renderCurrentChat();
    toast('This conversation has been reset.');
  }

  // Theme selector and persistence
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => applyTheme(button.dataset.themeChoice)));
  applyTheme(storage.get('worldtime-theme', 'cosmic'));

  // World clock interactions
  renderCityOptions();
  renderClockCards();
  updateLocalTime();
  updateClockCards();
  $('addCityBtn').addEventListener('click', addCity);
  $('citySearch').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addCity(); } });
  setInterval(() => { updateLocalTime(); updateClockCards(); }, 1000);

  // Time zone converter
  populateZoneSelects();
  $('converterForm').addEventListener('submit', convertTime);
  $('fromCity').addEventListener('change', convertTime);
  $('toCity').addEventListener('change', convertTime);
  $('sourceDateTime').addEventListener('change', convertTime);
  $('swapCitiesBtn').addEventListener('click', () => {
    const from = $('fromCity').value;
    $('fromCity').value = $('toCity').value;
    $('toCity').value = from;
    convertTime();
  });

  // AI chat: each conversation persists separately in localStorage.
  $('newChatBtn').addEventListener('click', newChat);
  $('resetChatBtn').addEventListener('click', resetChat);
  $('chatForm').addEventListener('submit', event => { event.preventDefault(); sendMessage(); });
  $('chatInput').addEventListener('input', autoResizeInput);
  $('chatInput').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }
  });
  renderChatHistory();
  renderCurrentChat();
  checkBackend();
})();
