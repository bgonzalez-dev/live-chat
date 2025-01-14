import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { sendMessage } from '../xmppClient';
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
    // Aquí deberías implementar la lógica para subir el archivo a tu servidor
    // y devolver la URL del archivo subido
    // Por ahora, simplemente devolveremos una URL falsa
    return `https://example.com/files/${fileName}`;
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!activeChat) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-xl text-gray-500">Select a chat or start a new one to begin messaging</p>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-full">
        <div className="bg-white p-4 border-b flex items-center">
          <h2 className="text-xl font-semibold flex-grow">{activeChat.name || activeChat.jid}</h2>
          <div className="text-sm text-gray-500">
            {presence?.type === 'unavailable' ? 'Offline' : 'Online'} •
            Last seen: {formatTimestamp(presence?.timestamp)}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.from === currentUser ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg ${msg.from === currentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {msg.body}
                  {msg.fileUrl && (
                      <div>
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                          {msg.fileName}
                        </a>
                      </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="bg-white p-4 border-t flex">
          <button type="button" className="mr-2" onClick={() => fileInputRef.current.click()}>
            <Paperclip className="w-6 h-6 text-gray-500" />
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
              className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" className="mx-2" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile className="w-6 h-6 text-gray-500" />
          </button>
          <button type="submit" className="bg-blue-500 text-white rounded-full p-2">
            <Send className="w-5 h-5" />
          </button>
        </form>
        {showEmojiPicker && (
            <div className="absolute bottom-16 right-4">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
        )}
      </div>
  );
}

export default ChatWindow;

