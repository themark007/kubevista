# KubeVista — Visual Kubernetes Explorer & YAML Analyzer

A gamified, interactive Kubernetes YAML visualizer with a cyberpunk neon theme. Paste or load a K8s manifest and instantly see a live graph of your resources, relationships, validation errors, and AI-powered explanations.

![KubeVista Screenshot](./docs/screenshot.png)

## Features

- **Visual Graph** — Custom React Flow canvas with animated nodes for Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and Namespace containers
- **YAML Editor** — Monaco Editor (VS Code engine) with syntax highlighting
- **Relationship Detection** — Automatically maps Deployment→Pod, Service→Pod, Ingress→Service, Pod→ConfigMap/Secret edges
- **Validation** — Detects selector mismatches, port mismatches, dangling references
- **Network Flow Mode** — Dims non-network resources; highlights traffic paths
- **AI Explain** — Streams an LLM explanation of your manifest via OpenRouter
- **Cyberpunk Dark Theme** — Pure CSS custom properties, neon glow animations, no Tailwind

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Graph | @xyflow/react v12 (React Flow) |
| Editor | @monaco-editor/react |
| Layout | @dagrejs/dagre |
| Backend | Python FastAPI 0.115 |
| YAML Parser | PyYAML |
| AI | OpenRouter API (SSE streaming) |

---

## Local Development

### Prerequisites
- Node.js 20+, npm 10+
- Python 3.11+

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy env and add your OpenRouter key
cp .env.example .env
# Edit backend/.env → set OPENROUTER_API_KEY

uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
# .env.local already points to http://localhost:8000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment to Vercel (Two-step)

### Step 1 — Deploy Backend (v1)

1. Push this repo (the current state is deployment-ready).
2. In [Vercel](https://vercel.com), click **Add New Project** → Import `kubevista` → set **Root Directory** to `backend`.
3. Vercel auto-detects Python via `vercel.json`. No build command needed.
4. Add these **Environment Variables** in Vercel dashboard:

   | Key | Value |
   |-----|-------|
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` |
   | `CORS_ORIGINS` | `https://YOUR_FRONTEND_URL.vercel.app` *(leave blank for now, add after frontend deploy)* |

5. Deploy. Note the backend URL, e.g. `https://kubevista-api.vercel.app`.

### Step 2 — Deploy Frontend (v2)

1. Update `frontend/.env.production`:

   ```
   VITE_API_BASE=https://kubevista-api.vercel.app
   ```

   Replace with your actual backend URL from Step 1.

2. Go back to backend project on Vercel → Settings → Environment Variables → set `CORS_ORIGINS` to your frontend URL.

3. Commit and push:

   ```bash
   git add frontend/.env.production
   git commit -m "v2: set production backend URL"
   git push origin main
   ```

4. In Vercel, **Add New Project** → Import `kubevista` → set **Root Directory** to `frontend`.
5. Vercel will run `npm run build` and serve `dist/`. SPA routing is handled by `vercel.json`.
6. Deploy.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key from [openrouter.ai](https://openrouter.ai) |
| `CORS_ORIGINS` | No | Comma-separated extra origins, e.g. production frontend URL |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend URL. Defaults to `http://localhost:8000` in dev. Set in `.env.production` or Vercel dashboard for production. |

---

## Project Structure

```
kubevista/
├── backend/
│   ├── main.py              # FastAPI app, CORS, endpoints
│   ├── models.py            # Pydantic request/response models
│   ├── requirements.txt
│   ├── vercel.json          # Vercel Python deployment config
│   ├── .env                 # Local secrets (gitignored)
│   ├── .env.example         # Template
│   ├── parser/
│   │   ├── yaml_parser.py   # Multi-doc YAML → resource nodes
│   │   ├── relationship_engine.py  # Edge detection
│   │   └── validator.py     # Health checks / validation
│   └── ai/
│       ├── explain.py       # OpenRouter SSE streaming
│       └── prompts.py       # System prompt
├── frontend/
│   ├── vercel.json          # SPA rewrite rules
│   ├── .env.local           # Local dev (http://localhost:8000)
│   ├── .env.production      # Production backend URL ← update before v2 deploy
│   └── src/
│       ├── components/
│       │   ├── Layout/       # AppLayout, Toolbar
│       │   ├── YAMLEditor/   # Monaco editor wrapper
│       │   ├── Graph/        # React Flow canvas, custom nodes/edges, SVG icons
│       │   ├── DetailPanel/  # Node detail slide-in
│       │   ├── ErrorPanel/   # Validation error drawer
│       │   └── ExplainPanel/ # AI streaming modal
│       ├── context/          # AppContext (global state)
│       ├── hooks/            # useParseYAML, useExplainYAML, useKeyboardShortcuts
│       ├── utils/            # layoutEngine (dagre), transformResponse
│       ├── data/             # Sample K8s manifests
│       └── styles/           # variables.css, global.css, animations.css
└── README.md
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Visualize YAML |
| `Ctrl+E` | Open AI Explain |
| `Escape` | Close open panels |

---

## License

MIT
