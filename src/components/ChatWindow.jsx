import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

function ChatWindow({ activeChat, messages, presence, onSendMessage, currentUser }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const getPresenceStatus = (presenceData) => {
    if (!presenceData || presenceData.type === 'unavailable') {
      return 'Offline';
    }

    switch (presenceData?.show) {
      case 'chat':
        return 'Online';
      case 'away':
        return 'Away';
      case 'xa':
        return 'Extended Away';
      case 'dnd':
        return 'Do Not Disturb';
      default:
        return presenceData.status || 'Online';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && activeChat) {
      onSendMessage(activeChat.jid, message);
      setMessage('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && activeChat) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result;
        const fileUrl = await uploadFile(base64, file.name);
        onSendMessage(activeChat.jid, `Sent a file: ${file.name}`, { url: fileUrl, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (base64, fileName) => {
    return `https://example.com/files/${fileName}`;
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  if (!activeChat) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <p className="text-xl text-gray-400">Select a chat or start a new one to begin messaging</p>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-full bg-gray-100" style={{ backgroundImage: 'url(/bg.svg)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
        <div className="bg-white p-4 border-b border-gray-200 flex items-center">
          <h2 className="text-xl font-semibold text-[#082245] flex-grow">{activeChat.name}</h2>
          <div className="text-sm text-[#5f0099]">
            {getPresenceStatus(presence)}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.from === currentUser ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[70%] px-4 py-2 rounded-2xl shadow-2xl ${
                    msg.from === currentUser
                        ? 'bg-[#f60d9d] text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-[#082245] rounded-bl-none'
                }`}>
                  {msg.body}
                  {msg.fileUrl && (
                      <div className="mt-1">
                        <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline hover:opacity-80"
                        >
                          {msg.fileName}
                        </a>
                      </div>
                  )}
                  <div className={`text-xs mt-1 ${msg.from === currentUser ? 'text-white/80' : 'text-gray-500'}`}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="bg-white p-4 border-t border-gray-200 flex items-center gap-2">
          <button
              type="button"
              className="text-[#5f0099] hover:text-[#f60d9d] transition-colors"
              onClick={() => fileInputRef.current.click()}
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
          />
          <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow px-4 py-2 bg-gray-50 text-[#082245] rounded-full border border-gray-200 focus:outline-none focus:border-[#f60d9d] focus:ring-1 focus:ring-[#f60d9d]"
          />
          <button
              type="button"
              className="text-[#5f0099] hover:text-[#f60d9d] transition-colors"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-6 h-6" />
          </button>
          <button
              type="submit"
              className="bg-[#f60d9d] text-white rounded-full p-2 hover:bg-[#5f0099] transition-colors disabled:opacity-50"
              disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {showEmojiPicker && (
            <div className="absolute bottom-20 right-4 shadow-xl">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
        )}
      </div>
  );
}

export default ChatWindow;

