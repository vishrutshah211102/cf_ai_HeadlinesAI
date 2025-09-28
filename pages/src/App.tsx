import { useState } from 'react'
import './App.css'

interface Article {
  id: number;
  title: string;
  body: string; // This is the summary from the backend
  topicTags: string[];
  region: string;
  link?: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    }
    setLogs(prev => [newLog, ...prev].slice(0, 10)) // Keep last 10 logs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      addLog('error', 'Please enter a message')
      return
    }

    setLoading(true)
    addLog('info', `Sending request: "${message}"`)

    try {
      const response = await fetch(' https://worker.vishrutshah211102.workers.dev/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.trim() })
      })

      addLog('info', `Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        addLog('error', `Response error: ${JSON.stringify(errorData)}`)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Article[] = await response.json()
      addLog('info', `Raw response: ${JSON.stringify(data).substring(0, 200)}...`)
      setArticles(data)
      addLog('success', `Received ${data.length} articles`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLog('error', `Request failed: ${errorMessage}`)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    addLog('info', 'Logs cleared')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Headlines AI</h1>
        <p>Get AI-powered news summaries and insights</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your query about news or topics..."
              className="message-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading || !message.trim()}
            >
              {loading ? 'Processing...' : 'Get Headlines'}
            </button>
          </div>
        </form>

        <div className="content-grid">
          <section className="articles-section">
            <h2>Results ({articles.length})</h2>
            {loading && <div className="loading">Processing your request...</div>}
            
            {articles.length > 0 ? (
              <div className="articles-grid">
                {articles.map((article, index) => (
                  <article key={index} className="article-card">
                    <h3>{article.title}</h3>
                    <p className="summary">{article.body}</p>
                    <div className="region">Region: {article.region}</div>
                    {article.topicTags && article.topicTags.length > 0 && (
                      <div className="tags">
                        {article.topicTags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    {article.link && (
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-link">
                        Read More →
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : !loading && (
              <div className="no-results">
                No articles yet. Enter a query to get started!
              </div>
            )}
          </section>

          <aside className="logs-section">
            <div className="logs-header">
              <h2>Activity Log</h2>
              <button onClick={clearLogs} className="clear-logs-btn">Clear</button>
            </div>
            <div className="logs-container">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className={`log-entry log-${log.type}`}>
                    <span className="log-time">{log.timestamp}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="no-logs">No activity yet</div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
