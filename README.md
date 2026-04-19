# Explain Like I'm a Stack 🧠

A mini web app that explains any technical concept tailored to your role — React Dev, Data Scientist, DevOps Engineer, and more. Powered by Gemini / Groq with real-time streaming responses.

---

## Demo

Type a concept → Pick your persona → Get an explanation in your language.

> "How does DNS work?" explained to a **React Dev**:
> *"Think of DNS like a giant `useContext` that maps domain names to IP addresses. Your browser calls `resolve('google.com')` and the DNS server returns the IP — like a global store lookup..."*

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React + Vite | Frontend framework & dev server |
| Gemini / Groq API | Streaming AI responses (free tier) |
| Vanilla CSS | Dark glassmorphism design system |
| Google Fonts | Inter + JetBrains Mono typography |

---

## Project Structure

```
explain_like_im_a_stack/
├── public/
├── src/
│   ├── api/
│   │   └── anthropic.js       ← Multi-provider streaming API helper
│   ├── components/
│   │   ├── ApiKeyModal.jsx    ← API key entry modal
│   │   ├── ConceptInput.jsx   ← Styled concept input
│   │   ├── PersonaGrid.jsx   ← 2×2 persona card grid
│   │   └── ResponseViewer.jsx ← Streaming response display
│   ├── App.jsx                ← Main app component
│   ├── App.css                ← App-level styles
│   ├── index.css              ← Design system & global styles
│   └── main.jsx               ← Vite entry point
├── index.html                 ← SEO-ready HTML shell
├── vite.config.js
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/chaitrali-code/Explain-Like-I-m-a-Stack.git
cd Explain-Like-I-m-a-Stack
npm install
```

### 2. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 3. Add your API key

Click the ⚙️ gear icon in the bottom-right corner and enter your API key.

**Recommended: Groq (free & fast)**
- Get a free key at [console.groq.com/keys](https://console.groq.com/keys)
- 30 requests/min, 14,400 requests/day — no billing required

**Alternative: Gemini (free tier)**
- Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- 15 requests/min, 1M tokens/day

> Your key is stored in your browser's `localStorage` — you only enter it once. It's never sent anywhere except the AI provider's API.

---

## How It Works

```
User types concept
      ↓
User picks a persona
      ↓
App builds a tailored prompt:
  "Explain X to someone who thinks in components and state"
      ↓
Sent to Groq/Gemini via streaming API
      ↓
Response streams token-by-token into the UI
```

The app constructs a persona-specific system prompt and streams the response in real-time with a blinking cursor effect.

---

## Personas

| Persona | How the AI frames the explanation |
|---|---|
| React Dev | Components, props, state, hooks, virtual DOM |
| Data Scientist | Dataframes, pipelines, models, features |
| DevOps Engineer | Containers, CI/CD, infra, load balancers |
| UI/UX Designer | User flows, wireframes, design systems |

---

## Features

- ✨ Real-time streaming response (no waiting for full reply)
- 🎭 4 persona cards with active selection state & color themes
- ⌨️ Enter key support to submit
- 🔄 Auto-retry & model fallback on rate limits
- 📋 Copy response to clipboard
- 🌙 Dark glassmorphism UI with animated background orbs
- 📱 Fully responsive design
- 🔑 API key stored locally (enter once, works forever)
- ♿ Accessible — ARIA roles, keyboard navigation, live regions

---

## Possible Extensions

- Support custom personas (let user type their own role)
- Show response word count / reading time
- Save past explanations to `localStorage`
- Add a "Try another persona" button to re-explain instantly
- Add more providers (OpenAI, Claude, etc.)

---

## .gitignore

```
node_modules/
dist/
.env
.env.local
```

---

## License

MIT — free to use, modify, and share.
