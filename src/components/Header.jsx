import React from 'react';
import { MessageSquare, UserPlus, LogOut, MessageSquarePlus } from 'lucide-react';

function Header({ onLogout, onAddContact, onStartDirectChat }) {
    return (
        <header className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-blue-500 mr-2" />
                <h1 className="text-xl font-bold">XMPP Chat</h1>
            </div>
            <div className="flex items-center">
                <button onClick={onStartDirectChat} className="mr-2" title="Start Direct Chat">
                    <MessageSquarePlus className="w-6 h-6 text-gray-500" />
                </button>
                <button onClick={onAddContact} className="mr-2" title="Add Contact">
                    <UserPlus className="w-6 h-6 text-gray-500" />
                </button>
                <button onClick={onLogout} title="Logout">
                    <LogOut className="w-6 h-6 text-gray-500" />
                </button>
            </div>
        </header>
    );
}

export default Header;

