import React, { useState, useEffect } from "react"
import Header from "./components/Header"
import ChatList from "./components/ChatList"
import ChatWindow from "./components/ChatWindow"
import Contacts from "./components/Contacts"
import LoginForm from "./components/LoginForm"
import AddContactForm from "./components/AddContactForm"
import DirectChatForm from "./components/DirectChatForm"
import { setupXMPP, sendMessage, sendPresence, requestPresence, removeContact, logout } from "./xmppClient"

function App() {
    const [activeChat, setActiveChat] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [messages, setMessages] = useState({})
    const [contacts, setContacts] = useState([])
    const [presence, setPresence] = useState({})
    const [showAddContact, setShowAddContact] = useState(false)
    const [showDirectChat, setShowDirectChat] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [showContacts, setShowContacts] = useState(false)


    useEffect(() => {
        if (isLoggedIn) {
            const interval = setInterval(() => {
                sendPresence()
                contacts.forEach((contact) => requestPresence(contact.jid))
            }, 30000)
            return () => clearInterval(interval)
        }
    }, [isLoggedIn, contacts])

    useEffect(() => {
        const storedMessages = JSON.parse(localStorage.getItem(`chat_${currentUser}`));
        if (storedMessages) {
            setMessages(storedMessages);
        }
    }, [currentUser]);


    const handleLogin = (username, password) => {
        setupXMPP(
            username,
            password,
            (msg) => {
                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [msg.from]: [...(prevMessages[msg.from] || []), msg],
                }));
            },
            (pres) => {
                setPresence((prevPresence) => ({
                    ...prevPresence,
                    [pres.from]: {
                        show: pres.show,
                        status: pres.status,
                        type: pres.type,
                        timestamp: new Date(),
                    },
                }));
            },
            (roster) => {
                setContacts(roster);
                roster.forEach((contact) => requestPresence(contact.jid));
            }
        );

        setIsLoggedIn(true);
        setCurrentUser(username);

        // Store session state in sessionStorage
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", username);
    };


    const handleLogout = () => {
        sendPresence("unavailable", "Offline")
        setIsLoggedIn(false)
        setActiveChat(null)
        setMessages({})
        setContacts([])
        setPresence({})
        setCurrentUser(null)
        logout()
    }

    const handleStartDirectChat = (jid) => {
        const newContact = {
            jid: typeof jid === "string" ? jid : jid.jid,
            name: typeof jid === "string" ? jid.split("@")[0] : jid.name,
            subscription: "none",
        }
        setContacts((prevContacts) => {
            if (!prevContacts.find((c) => c.jid === newContact.jid)) {
                return [...prevContacts, newContact]
            }
            return prevContacts
        })
        setActiveChat(newContact)
        setShowContacts(false)
        requestPresence(newContact.jid)
    }

    const handleRemoveContact = (jid) => {
        removeContact(jid)
        setContacts((prevContacts) => prevContacts.filter((c) => c.jid !== jid))
        if (activeChat?.jid === jid) {
            setActiveChat(null)
        }
    }

    const handleSendMessage = (to, body, file = null) => {
        const newMessage = {
            from: currentUser,  // This ensures we know the sender
            to,
            body,
            timestamp: new Date().toISOString(),
            fileUrl: file?.url || null,
            fileName: file?.name || null,
        };

        // Update messages state immediately
        setMessages((prevMessages) => {
            const updatedMessages = {
                ...prevMessages,
                [to]: [...(prevMessages[to] || []), newMessage],
            };

            // Save updated messages to localStorage
            localStorage.setItem(`chat_${currentUser}`, JSON.stringify(updatedMessages));

            return updatedMessages;
        });

        // Send the message to the XMPP server
        sendMessage(to, body, file);
    }

    return (
        <div className="flex h-screen bg-white">
            {isLoggedIn ? (
                <>
                    <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col">
                        <Header
                            onLogout={handleLogout}
                            onAddContact={() => setShowAddContact(true)}
                            onStartDirectChat={() => setShowDirectChat(true)}
                            onToggleContacts={() => setShowContacts(!showContacts)}
                        />
                        {showContacts ? (
                            <Contacts
                                contacts={contacts}
                                presence={presence}
                                onRemoveContact={handleRemoveContact}
                                onStartChat={handleStartDirectChat}
                            />
                        ) : (
                            <ChatList setActiveChat={setActiveChat} contacts={contacts} presence={presence} />
                        )}
                    </div>
                    <div className="flex-1 bg-gray-50">
                        <ChatWindow
                            activeChat={activeChat}
                            messages={messages[activeChat?.jid] || []}
                            presence={presence[activeChat?.jid]}
                            onSendMessage={handleSendMessage}
                            currentUser={currentUser}
                        />
                    </div>
                    {showAddContact && <AddContactForm onClose={() => setShowAddContact(false)} />}
                    {showDirectChat && (
                        <DirectChatForm onStartChat={handleStartDirectChat} onClose={() => setShowDirectChat(false)} />
                    )}
                </>
            ) : (
                <div className="w-full flex items-center justify-center bg-white">
                    <LoginForm onLogin={handleLogin} />
                </div>
            )}
        </div>
    )
}

export default App

