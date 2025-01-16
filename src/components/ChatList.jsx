import React from 'react';
import { User } from 'lucide-react';

function ChatList({ setActiveChat, contacts, presence }) {
  const getPresenceColor = (presenceData) => {
    if (!presenceData || presenceData.type === 'unavailable') {
      return 'bg-gray-400';
    }

    switch (presenceData.show) {
      case 'chat':
        return 'bg-[#f60d9d]';
      case 'away':
        return 'bg-yellow-500';
      case 'xa':
        return 'bg-orange-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return presenceData.type === 'available' ? 'bg-[#f60d9d]' : 'bg-gray-400';
    }
  };

  const getPresenceStatus = (presenceData) => {
    if (!presenceData || presenceData.type === 'unavailable') {
      return 'Offline';
    }

    switch (presenceData.show) {
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

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
      <div className="overflow-y-auto h-full">
        {contacts.map((contact) => {
          const presenceData = presence[contact.jid];
          return (
              <div
                  key={contact.jid}
                  className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                  onClick={() => setActiveChat(contact)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#082245]/10 flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-[#082245]" />
                  </div>
                  <div
                      className={`absolute bottom-1 right-3 w-3 h-3 rounded-full ${getPresenceColor(presenceData)} border-2 border-white`}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h2 className="font-semibold text-[#082245] truncate">{contact.name}</h2>
                  <p className="text-sm text-gray-500 truncate">
                    {getPresenceStatus(presenceData)}
                  </p>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {formatLastSeen(presenceData?.timestamp)}
                </div>
              </div>
          );
        })}
      </div>
  );
}

export default ChatList;

