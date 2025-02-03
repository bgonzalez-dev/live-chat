import React from "react"
import { MessageSquare, UserPlus, LogOut, MessageSquarePlus, Users } from "lucide-react"

function Header({ onLogout, onAddContact, onStartDirectChat, onToggleContacts }) {
    return (
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
                <img src={"/favicon-base.png"} className={"w-[24px] h-[24px] mr-4"} alt={"headLogo"}/>
                <h1 className="text-xl font-bold text-[#082245]">Chat</h1>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onToggleContacts}
                    className="p-2 rounded-full hover:bg-gray-100 text-[#5f0099] transition-colors"
                    title="Toggle Contacts"
                >
                    <Users className="w-6 h-6" />
                </button>
            </div>
        </header>
    )
}

export default Header

