import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { FiSend } from 'react-icons/fi';

const Chat = ({ roomCode, initialMessages = [] }) => {
  const { socket, emit } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat_message', handler);
    return () => socket.off('chat_message', handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !roomCode) return;
    emit('send_chat', { roomCode, message: input.trim() });
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '360px', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          💬 Room Chat
        </h3>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1rem' }}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, idx) => {
          const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={idx} style={{ padding: '0.375rem 0.75rem', margin: '0.25rem 0' }}>
                <div className="chat-bubble system">{msg.message}</div>
              </div>
            );
          }

          return (
            <div key={idx} className={`chat-message ${isOwn ? 'own' : ''}`}>
              {!isOwn && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, hsl(${(msg.sender?.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 50%), hsl(${(msg.sender?.username?.charCodeAt(0) ?? 0) * 10 % 360}, 70%, 35%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.7rem'
                }}>
                  {(msg.sender?.username || msg.senderName || '?')[0].toUpperCase()}
                </div>
              )}
              <div>
                {!isOwn && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px', paddingLeft: '4px' }}>
                    {msg.sender?.username || msg.senderName}
                  </div>
                )}
                <div className={`chat-bubble ${isOwn ? 'own' : 'other'}`}>
                  {msg.message}
                  <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '2px', textAlign: 'right' }}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(99,102,241,0.12)', display: 'flex', gap: '0.5rem' }}>
        <input
          id="chat-input"
          className="input-field"
          style={{ flex: 1, padding: '0.5rem 0.75rem' }}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={500}
        />
        <button
          id="chat-send-btn"
          className="btn-primary"
          style={{ padding: '0.5rem 0.875rem', flexShrink: 0 }}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
