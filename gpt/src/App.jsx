import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2, Plus, Settings, MessageSquare, ChevronDown, Copy } from 'lucide-react'
import { marked } from 'marked'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from './lib/utils'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", type: "chat" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek: DeepSeek V3.2", type: "chat" },
  { id: "anthropic/claude-3-haiku", name: "Anthropic: Claude Haiku 4.5", type: "chat" },
  { id: "dall-e-3", name: "DALL·E 3", type: "image" }
]

const Markdown = ({ content, type }) => {
  if (type === 'image') {
    return (
      <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
        <img
          src={content}
          alt="Generated AI"
          className="w-full h-auto object-cover max-w-[512px] animate-in fade-in duration-500"
          loading="lazy"
        />
      </div>
    )
  }

  const tokens = marked.lexer(content)

  return tokens.map((token, index) => {
    if (token.type === 'code') {
      const codeString = token.text.replace(/\n$/, '')
      return (
        <div key={index} className="relative group/code my-4 not-prose">
          <div className="absolute right-2 top-2 z-10">
            <button
              onClick={(e) => {
                navigator.clipboard.writeText(codeString)
                const btn = e.currentTarget
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                setTimeout(() => {
                  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-500"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
                }, 2000)
              }}
              className="p-1.5 rounded-md bg-white border border-neutral-200 shadow-sm opacity-0 group-hover/code:opacity-100 transition-opacity hover:bg-neutral-50"
              title="Copy code"
            >
              <Copy size={14} className="text-neutral-500" />
            </button>
          </div>
          <SyntaxHighlighter
            style={oneLight}
            language={token.lang || 'javascript'}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              borderRadius: '0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      )
    }

    return (
      <div
        key={index}
        className="prose prose-neutral prose-sm max-w-none mb-4 last:mb-0"
        dangerouslySetInnerHTML={{ __html: marked.parse(token.raw) }}
      />
    )
  })
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      if (selectedModel.type === 'image') {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: input,
            n: 1,
            size: "1024x1024",
          })
        })

        const data = await response.json()
        if (data.data?.[0]?.url) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.data[0].url, type: 'image' }])
        } else {
          console.error("Invalid response from OpenAI:", data)
          const errorMessage = data.error?.message || "Failed to generate image"
          setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }])
        }
      } else {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Custom GPT",
          },
          body: JSON.stringify({
            model: selectedModel.id,
            messages: [...messages, userMessage],
          })
        })

        const data = await response.json()
        if (data.choices?.[0]?.message) {
          setMessages(prev => [...prev, data.choices[0].message])
        } else {
          console.error("Invalid response from OpenRouter:", data)
        }
      }
    } catch (error) {
      console.error("Error fetching API:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900 font-sans">
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden items-center">
        <header className="w-full h-14 border-b border-neutral-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="relative group">
            <button
              className="group flex items-center gap-1.5 px-3 py-1.5 hover:bg-neutral-100 rounded-lg transition-all text-sm font-semibold text-neutral-800"
            >
              {selectedModel.name}
              <ChevronDown size={14} className="text-neutral-400 group-hover:text-neutral-600" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                    selectedModel.id === model.id ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  {model.name}
                  {selectedModel.id === model.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Plus size={18} className="text-neutral-500" />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="w-full max-w-[800px] flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-800">How can I help you today?</h2>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-full mb-6",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-2.5 text-[15px] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-neutral-100 text-neutral-900"
                    : "bg-transparent text-neutral-900 px-0"
                )}>
                  <Markdown content={msg.content} type={msg.type} />
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full items-center py-2">
              <Loader2 size={18} className="animate-spin text-neutral-400" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-[800px] p-4 bg-white">
          <div className="relative flex items-end w-full bg-neutral-100 rounded-2xl p-2 px-3 border border-transparent focus-within:border-neutral-200 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={`Message ${selectedModel.name.split(':').pop().trim()}...`}
              className="flex-1 bg-transparent border-none focus:outline-none transition-all resize-none max-h-40 py-2 text-[15px] text-neutral-800 placeholder:text-neutral-500"
              rows={1}
              style={{ height: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="mb-1 p-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all pointer-events-auto cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 text-center mt-3">
            {selectedModel.name.split(':').pop().trim()} can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
