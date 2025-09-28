# cf_ai_HeadlinesAI

An AI-powered news application built on Cloudflare infrastructure that delivers personalized news recommendations using machine learning and user preferences stored in browser memory.

## 🚀 Live Demo

**Try the application here:** [https://13dbd9f4.headlinesai.pages.dev/](https://13dbd9f4.headlinesai.pages.dev/)

## 📋 Project Overview

HeadlinesAI is an intelligent news recommendation system that learns from user interactions to provide personalized content. Built as a demonstration of AI capabilities on Cloudflare's platform, this project showcases modern serverless architecture with AI integration.

### ⚠️ Development Notice
This is a **development project** created quickly to demonstrate understanding of AI workflows and Cloudflare infrastructure. For production use, the system would benefit from:
- Fine-tuning the LLM models
- Enhanced dataset integration
- More sophisticated user profiling
- Advanced filtering algorithms

Results may vary as this uses a basic dataset, but the architecture can be easily fine-tuned for production scenarios.

## 🏗️ Architecture & Components

### 🤖 AI Integration
- **LLM**: Utilizes **Llama 3.3 on Cloudflare Workers AI** for intelligent content analysis and recommendations
- **Natural Language Processing**: Processes user queries and extracts intent and preferences
- **Content Summarization**: AI-powered news summarization and tagging

### ⚡ Cloudflare Infrastructure
- **Workers**: Serverless functions handling API requests and business logic
- **Workflows**: Orchestrates complex AI processing pipelines
- **Pages**: Frontend hosting for the React-based user interface
- **KV Storage**: Fast, global key-value storage for session data

### 💬 User Interface
- **Chat Interface**: Interactive chat-based news discovery
- **React Frontend**: Modern, responsive user interface
- **Real-time Communication**: Instant responses through Cloudflare Pages

### 🧠 Memory & Personalization
- **Browser Cookies**: Temporary user preference storage (development approach)
- **Session Management**: Tracks user interactions and preferences
- **Learning Algorithm**: Builds user profiles based on news consumption patterns

## 🎯 How It Works

### Learning from User Behavior
The system demonstrates intelligent learning through user interactions:

1. **Initial Query**: User asks "give me news about Donald Trump"
   - System stores: User interested in **politics**
   - Geographic preference: **North America**

2. **Follow-up Query**: User asks "show some news I might like"
   - System responds with: **Political news from North America region**

3. **Sports Interest**: User asks "show news about baseball"
   - System updates profile: User likes **baseball**
   - Geographic context: **North America**

4. **Personalized Recommendations**: User asks "show interesting news"
   - System suggests: **Sports news in North America** based on learned preferences

### Workflow Pipeline
```
User Input → AI Analysis → Content Filtering → Personalization → Response Generation
     ↓              ↓              ↓               ↓              ↓
  Chat UI    →  Workers AI  →   Workflows   →  KV Storage  →  React UI
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Cloudflare Workers, TypeScript
- **AI/ML**: Cloudflare Workers AI (Llama 3.3)
- **Orchestration**: Cloudflare Workflows
- **Storage**: Cloudflare KV
- **Hosting**: Cloudflare Pages
- **Build Tools**: Wrangler, ESLint

## 📂 Project Structure

```
HeadlinesAI/
├── pages/                 # React frontend application
│   ├── src/
│   │   ├── App.tsx       # Main application component
│   │   ├── components/   # UI components
│   │   └── assets/       # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Vite configuration
├── worker/                # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts      # Main worker entry point
│   │   ├── headlines_workflow.ts    # AI workflow orchestration
│   │   ├── headlines_service.ts     # Business logic
│   │   ├── llm_summarizer.ts       # AI summarization
│   │   ├── llm_tagger.ts          # Content tagging
│   │   └── cookie.ts              # Session management
│   ├── wrangler.jsonc    # Worker configuration
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Cloudflare account
- Wrangler CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/vishrutshah211102/cf_ai_HeadlinesAI.git
   cd cf_ai_HeadlinesAI
   ```

2. **Set up the Worker**
   ```bash
   cd worker
   npm install
   npm run dev
   ```

3. **Set up the Frontend**
   ```bash
   cd ../pages
   npm install
   npm run dev
   ```

4. **Configure Environment**
   - Set up Cloudflare KV namespace
   - Configure Workers AI access
   - Update `wrangler.jsonc` with your settings

### Deployment

1. **Deploy Worker**
   ```bash
   cd worker
   wrangler deploy
   ```

2. **Deploy Pages**
   ```bash
   cd pages
   npm run build
   # Deploy to Cloudflare Pages
   ```

## 🔧 Configuration

### Environment Variables
- `HEADLINES_KV`: KV namespace for session storage
- `AI`: Cloudflare Workers AI binding

### Wrangler Configuration
Update `worker/wrangler.jsonc` with your Cloudflare account details and bindings.

## 🎮 Usage Examples

### Basic News Query
```
User: "What's happening in tech today?"
AI: [Provides current tech news with summaries]
```

### Learning Preferences
```
User: "Show me sports news"
AI: [Delivers sports content, learns user likes sports]

User: "Give me interesting news"
AI: [Suggests more sports content based on learned preference]
```

### Regional Personalization
```
User: "Tell me about politics in America"
AI: [Learns geographic and topic preferences]

User: "What's new?"
AI: [Focuses on American political news]
```

## 🔮 Future Enhancements

- **Advanced ML Models**: Integration with specialized news classification models
- **Real-time Data**: Live news feed integration
- **Enhanced Memory**: Persistent user profiles across sessions
- **Multi-modal Input**: Voice and image-based queries
- **Social Features**: News sharing and community recommendations

## 📝 Assignment Compliance

This project fulfills all requirements for the Cloudflare AI assignment:
- ✅ **LLM Integration**: Uses Llama 3.3 on Workers AI
- ✅ **Workflow Coordination**: Implements Cloudflare Workflows
- ✅ **User Input**: Chat interface via Pages
- ✅ **Memory/State**: Browser cookie-based session storage
- ✅ **Repository Naming**: Prefixed with `cf_ai_`
- ✅ **Documentation**: Comprehensive README with running instructions
- ✅ **Deployment**: Live demo available

**Built with Cloudflare's AI infrastructure**