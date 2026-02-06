import { useState, useEffect } from 'react'
import { Send, Bot, User, Terminal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, msg])
      setIsTyping(false)
    })

    socket.on('stream', (chunk) => {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }]
        }
        return [...prev, { role: 'assistant', content: chunk }]
      })
    })

    return () => {
      socket.off('message')
      socket.off('stream')
    }
  }, [])

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMsg])
    socket.emit('chat', input)
    setInput('')
    setIsTyping(true)
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
        <Bot className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold">Gemini Web</h1>
      </header>

      <main className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-900 border border-zinc-800'}`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                <span>{msg.role === 'user' ? 'You' : 'Gemini'}</span>
              </div>
              <ReactMarkdown className="prose prose-invert max-w-none">{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Gemini anything..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          onClick={sendMessage}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Send size={20} />
        </button>
      </footer>
    </div>
  )
}

export default App
