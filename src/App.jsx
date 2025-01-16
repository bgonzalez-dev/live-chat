import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import LoginForm from './components/LoginForm';
import AddContactForm from './components/AddContactForm';
import DirectChatForm from './components/DirectChatForm';
import { setupXMPP, sendMessage, sendPresence, requestPresence } from './xmppClient';

function App() {
    const [activeChat, setActiveChat] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [messages, setMessages] = useState({});
    const [contacts, setContacts] = useState([]);
    const [presence, setPresence] = useState({});
    const [showAddContact, setShowAddContact] = useState(false);
    const [showDirectChat, setShowDirectChat] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isLoggedIn) {
            const interval = setInterval(() => {
                sendPresence();
                contacts.forEach(contact => requestPresence(contact.jid));
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, contacts]);

    const handleLogin = (username, password) => {
        setupXMPP(
            username,
            password,
            (msg) => {
                console.log('Received message in App:', msg);
                setMessages(prevMessages => ({
                    ...prevMessages,
                    [msg.from]: [...(prevMessages[msg.from] || []), msg]
                }));
            },
            (pres) => {
                console.log('Received presence in App:', pres);
                setPresence(prevPresence => ({
                    ...prevPresence,
                    [pres.from]: {
                        show: pres.show,
                        status: pres.status,
                        type: pres.type,
                        timestamp: new Date()
                    }
                }));
            },
            (roster) => {
                console.log('Received roster in App:', roster);
                setContacts(roster);
                roster.forEach(contact => requestPresence(contact.jid));
            }
        );
        setIsLoggedIn(true);
        setCurrentUser(username);
    };

    const handleLogout = () => {
        sendPresence('unavailable', 'Offline');
        setIsLoggedIn(false);
        setActiveChat(null);
        setMessages({});
        setContacts([]);
        setPresence({});
        setCurrentUser(null);
    };

    const handleStartDirectChat = (jid) => {
        const newContact = {
            jid,
            name: jid.split('@')[0],
            subscription: 'none'
        };
        setContacts(prevContacts => [...prevContacts, newContact]);
        setActiveChat(newContact);
        requestPresence(jid);
    };

    const handleSendMessage = (to, body, file = null) => {
        sendMessage(to, body, file);
        const newMessage = {
            from: currentUser,
            to,
            body,
            timestamp: new Date().toISOString(),
            fileUrl: file?.url,
            fileName: file?.name
        };
        setMessages(prevMessages => ({
            ...prevMessages,
            [to]: [...(prevMessages[to] || []), newMessage]
        }));
    };

    return (
        <div className="flex h-screen bg-white">
            {isLoggedIn ? (
                <>
                    <div className="w-[300px] bg-white border-r border-gray-200 flex flex-col">
                        <Header
                            onLogout={handleLogout}
                            onAddContact={() => setShowAddContact(true)}
                            onStartDirectChat={() => setShowDirectChat(true)}
                        />
                        <ChatList
                            setActiveChat={setActiveChat}
                            contacts={contacts}
                            presence={presence}
                        />
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
                    {showAddContact && (
                        <AddContactForm
                            onClose={() => setShowAddContact(false)}
                        />
                    )}
                    {showDirectChat && (
                        <DirectChatForm
                            onStartChat={handleStartDirectChat}
                            onClose={() => setShowDirectChat(false)}
                        />
                    )}
                </>
            ) : (
                <div className="w-full flex items-center justify-center bg-white">
                    <LoginForm onLogin={handleLogin} />
                </div>
            )}
        </div>
    );
}

export default App;

