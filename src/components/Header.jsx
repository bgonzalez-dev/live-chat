import React from 'react';
import { MessageSquare, UserPlus, LogOut, MessageSquarePlus } from 'lucide-react';

function Header({ onLogout, onAddContact, onStartDirectChat }) {
    return (
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-[#f60d9d] mr-2" />
                <h1 className="text-xl font-bold text-[#082245]">XMPP Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onStartDirectChat}
                    className="p-2 rounded-full hover:bg-gray-100 text-[#5f0099] transition-colors"
                    title="Start Direct Chat"
                >
                    <MessageSquarePlus className="w-6 h-6" />
                </button>
                <button
                    onClick={onAddContact}
                    className="p-2 rounded-full hover:bg-gray-100 text-[#5f0099] transition-colors"
                    title="Add Contact"
                >
                    <UserPlus className="w-6 h-6" />
                </button>
                <button
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-gray-100 text-[#5f0099] transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
}

export default Header;

