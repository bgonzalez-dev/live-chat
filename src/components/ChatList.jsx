import React from 'react';
import { User } from 'lucide-react';

function ChatList({ setActiveChat, contacts, presence }) {
  const getPresenceColor = (show) => {
    switch (show) {
      case 'Online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  return (
    <div className="overflow-y-auto h-full">
      {contacts.map((contact) => (
        <div
          key={contact.jid}
          className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
          onClick={() => setActiveChat(contact)}
        >
          <div className="relative">
            <User className="w-12 h-12 bg-gray-300 rounded-full p-2 mr-4" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getPresenceColor(presence[contact.jid]?.status)}`} />

          </div>
          <div className="flex-grow pl-2">
            <h2 className="font-semibold pt-3">{contact.name || contact.jid}</h2>
            <p className="text-sm text-gray-500">
              {presence[contact.jid]?.status || 'Offline'}
            </p>
          </div>
          <div className="text-xs text-gray-400">
            {formatLastSeen(presence[contact.jid]?.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatList;

