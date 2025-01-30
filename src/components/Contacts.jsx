import React from "react"
import { User, UserPlus, UserMinus, MessageSquare } from "lucide-react"

function Contacts({ contacts, presence, onRemoveContact, onStartChat }) {
    const getPresenceColor = (presenceData) => {
        if (!presenceData || presenceData.type === "unavailable") {
            return "bg-gray-400"
        }

        switch (presenceData.show) {
            case "chat":
                return "bg-[#f60d9d]"
            case "away":
                return "bg-yellow-500"
            case "xa":
                return "bg-orange-500"
            case "dnd":
                return "bg-red-500"
            default:
                return presenceData.type === "available" ? "bg-[#f60d9d]" : "bg-gray-400"
        }
    }

    const getPresenceStatus = (presenceData) => {
        if (!presenceData || presenceData.type === "unavailable") {
            return "Offline"
        }

        switch (presenceData.show) {
            case "chat":
                return "Online"
            case "away":
                return "Away"
            case "xa":
                return "Extended Away"
            case "dnd":
                return "Do Not Disturb"
            default:
                return presenceData.status || "Online"
        }
    }

    const formatLastSeen = (timestamp) => {
        if (!timestamp) return "Never"
        const now = new Date()
        const date = new Date(timestamp)
        const diff = now - date
        if (diff < 60000) return "Just now"
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
        return `${Math.floor(diff / 86400000)}d`
    }

    return (
        <div className="w-full bg-white shadow rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contacts
                </h2>
            </div>
            <div className="divide-y divide-gray-100">
                {contacts.map((contact) => {
                    const presenceData = presence[contact.jid]
                    return (
                        <div key={contact.jid} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-[#082245]/10 flex items-center justify-center">
                                        <User className="w-5 h-5 text-[#082245]" />
                                    </div>
                                    <div
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getPresenceColor(
                                            presenceData,
                                        )} border-2 border-white`}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-[#082245]">{contact.name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {getPresenceStatus(presenceData)} · {formatLastSeen(presenceData?.timestamp)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onStartChat(contact)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-[#5f0099] transition-colors"
                                    title="Start Chat"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onRemoveContact(contact.jid)}
                                    className="p-2 rounded-full hover:bg-gray-100 text-red-600 transition-colors"
                                    title="Remove Contact"
                                >
                                    <UserMinus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
                {contacts.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No contacts yet. Add some contacts to get started!
                    </div>
                )}
            </div>
        </div>
    )
}

export default Contacts

