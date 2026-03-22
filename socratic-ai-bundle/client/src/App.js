import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.css';
import Auth from './Auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Icons
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const SocraticIcon = () => (
  <svg viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="17" stroke="var(--gold)" strokeWidth="1.5" />
    <text x="18" y="24" textAnchor="middle" fontSize="18" fill="var(--gold)" fontFamily="serif">Σ</text>
  </svg>
);

// Badge
const SocraticBadge = ({ type }) => {
  const labels = {
    question: { label: '↯ Inquiry', color: '#7c9cbf' },
    challenge: { label: '⚡ Challenge', color: '#bf7c7c' },
    clarification: { label: '◎ Clarify', color: '#7cbf9e' },
    synthesis: { label: '✦ Synthesis', color: '#bf9e7c' },
    direct: { label: '→ Direct', color: '#9e7cbf' },
  };
  const info = labels[type];
  if (!info) return null;
  return (
    <span className="socratic-badge" style={{ borderColor: info.color, color: info.color }}>
      {info.label}
    </span>
  );
};

// Message
const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      {!isUser && (
        <div className="avatar assistant-avatar">
          <SocraticIcon />
        </div>
      )}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        {!isUser && msg.socraticType && <SocraticBadge type={msg.socraticType} />}

        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="inline-code" {...props}>{children}</code>
              );
            },
            strong({ children }) {
              return <strong className="socratic-emphasis">{children}</strong>;
            }
          }}
        >
          {msg.content}
        </ReactMarkdown>

        <span className="timestamp">
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && <div className="avatar user-avatar">You</div>}
    </div>
  );
};

// Typing
const TypingIndicator = () => (
  <div className="message message-assistant">
    <div className="avatar assistant-avatar"><SocraticIcon /></div>
    <div className="bubble bubble-assistant typing-bubble">
      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
    </div>
  </div>
);

// MAIN APP
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    if (!token) {
      console.log('❌ No token available for fetchConversations');
      return;
    }
    
    try {
      console.log('🔄 Fetching conversations with token:', token.substring(0, 20) + '...');
      const res = await fetch(`${API_BASE}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        console.error('❌ 401 Unauthorized - Token invalid or expired');
        setError('Session expired. Please login again.');
        handleLogout();
        return;
      }
      
      if (!res.ok) {
        console.error('❌ Failed to fetch conversations:', res.status);
        throw new Error(`Failed to fetch conversations: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('✅ Conversations fetched:', Array.isArray(data) ? data.length : (Array.isArray(data.value) ? data.value.length : 0));
      setConversations(Array.isArray(data) ? data : (Array.isArray(data.value) ? data.value : []));
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);
    }
  }, [token]);

  // Load a specific conversation
  const loadConversation = useCallback(async (conversationId) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const conv = await res.json();
        setMessages(conv.messages || []);
        setActiveConvId(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [token]);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConvId(null);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId, e) => {
    e.stopPropagation();
    
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setConversations(prev => prev.filter(c => c._id !== conversationId));
        if (activeConvId === conversationId) {
          createNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }, [token, activeConvId, createNewConversation]);

  // Fetch conversations on auth and when active conversation changes
  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);

  // Update conversation list after each message (to refresh titles)
  const updateConversationList = useCallback(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);

  // Check for existing session on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setConversations([]);
    setActiveConvId(null);
    setMessages([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading || !token) {
      console.log('❌ Cannot send message:', { msg: !!msg, loading, hasToken: !!token });
      return;
    }

    setInput('');
    setError('');

    const tempUser = { 
      role: 'user', 
      content: msg, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, tempUser]);
    setLoading(true);

    try {
      console.log('🔄 Sending message with token:', token ? 'YES' : 'NO');
      
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: msg, 
          conversationId: activeConvId || ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('❌ Chat error:', data);
        if (res.status === 401) {
          setError('Authentication failed. Please login again.');
          handleLogout();
        } else {
          throw new Error(data.error || 'Failed to send message');
        }
        return;
      }
      
      if (!activeConvId) {
        setActiveConvId(data.conversationId);
      }
      
      setMessages(prev => [...prev, data.message]);
      
      updateConversationList();
    } catch (err) {
      console.error('❌ Send message error:', err);
      setError(err.message || 'Server error');
    }

    setLoading(false);
  }, [input, loading, activeConvId, token, updateConversationList]);

  // If not authenticated, show auth screen
  if (!user || !token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <SocraticIcon />
            <span>Socratic AI</span>
          </div>
          <button className="new-chat-btn" onClick={createNewConversation}>
            <PlusIcon />
            New chat
          </button>
        </div>
        
        <div className="conv-list">
          {conversations.length === 0 ? (
            <div className="no-convs">No conversations yet</div>
          ) : (
            conversations.map(c => (
              <div
                key={c._id}
                className={`conv-item ${activeConvId === c._id ? 'conv-active' : ''}`}
                onClick={() => loadConversation(c._id)}
              >
                <span className="conv-title">{c.title}</span>
                <button className="conv-delete" onClick={(e) => deleteConversation(c._id, e)}>
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </button>
          <div className="topbar-title">
            {activeConvId ? 
              conversations.find(c => c._id === activeConvId)?.title || 'Conversation' : 
              'New Conversation'
            }
          </div>
          <div className="topbar-badges">
            <div className="topbar-badge">Socratic</div>
          </div>
        </div>

        <div className="chat-area">
          {messages.length === 0 && !loading
            ? (
              <div className="welcome-empty">
                <div className="welcome-emblem">
                  <div className="emblem-ring" />
                  <div className="emblem-inner"><SocraticIcon /></div>
                </div>
                <h1 className="welcome-title">Socratic AI</h1>
                <p className="welcome-subtitle">
                  I don't just answer — I help you <em>think</em>.<br />
                  Through questions, we find wisdom together.
                </p>
              </div>
            )
            : (
              <div className="messages">
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {loading && <TypingIndicator />}
                {error && <div className="error-banner">{error}</div>}
                <div ref={messagesEndRef} />
              </div>
            )}
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="input-box"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything - I'll guide you to discover the answer..."
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage()}>
              <SendIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
