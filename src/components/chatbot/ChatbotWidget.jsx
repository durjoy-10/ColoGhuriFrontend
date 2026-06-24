import React, { useEffect, useRef, useState } from 'react';
import {
    FaRobot,
    FaTimes,
    FaPaperPlane,
    FaUser,
    FaCheck,
    FaTimesCircle,
    FaSpinner,
    FaTrash,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ChatbotWidget = () => {
    const { user, isAuthenticated } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [messages, setMessages] = useState([]);

    const bottomRef = useRef(null);

    const getUserKey = () => {
        if (user?.id) return `colo_ghuri_chatbot_history_user_${user.id}`;
        if (user?.email) return `colo_ghuri_chatbot_history_email_${user.email}`;
        return 'colo_ghuri_chatbot_history_guest';
    };

    const getPendingKey = () => {
        if (user?.id) return `colo_ghuri_chatbot_pending_user_${user.id}`;
        if (user?.email) return `colo_ghuri_chatbot_pending_email_${user.email}`;
        return 'colo_ghuri_chatbot_pending_guest';
    };

    const welcomeMessage = () => ({
        sender: 'bot',
        text: 'Hi, I am PothBondhu, your Colo Ghuri travel assistant. Ask me about destinations, tours, bookings, trips, or dashboard summary.',
        cards: [],
        quickReplies: ['Show destinations', 'Show tours', 'Help'],
        createdAt: new Date().toISOString(),
    });

    const roleMessage = () => {
        if (!user) return null;

        const roleText =
            user.role === 'admin'
                ? 'You are logged in as Admin. You can ask for admin summary, guide verification, destinations, tours, bookings, users, or activity logs.'
                : user.role === 'guide'
                    ? 'You are logged in as Guide. You can ask for guide dashboard, tour creation, pending bookings, or revenue summary.'
                    : 'You are logged in as Traveller. You can ask for your bookings, trips, budget summary, wishlist, destinations, or tours.';

        return {
            sender: 'bot',
            text: roleText,
            cards: [],
            quickReplies:
                user.role === 'admin'
                    ? ['Admin summary', 'Pending guide groups', 'All bookings']
                    : user.role === 'guide'
                        ? ['Guide dashboard', 'Pending bookings', 'My revenue']
                        : ['My bookings', 'My trips', 'Budget summary'],
            createdAt: new Date().toISOString(),
        };
    };

    const safeMessages = (value) => {
        if (!Array.isArray(value)) return [];

        return value
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                sender: item.sender === 'user' ? 'user' : 'bot',
                text: item.text || '',
                cards: Array.isArray(item.cards) ? item.cards : [],
                quickReplies: Array.isArray(item.quickReplies)
                    ? item.quickReplies
                    : [],
                createdAt: item.createdAt || new Date().toISOString(),
            }))
            .filter((item) => item.text.trim() !== '');
    };

    const loadChatHistory = () => {
        const historyKey = getUserKey();
        const pendingKey = getPendingKey();

        try {
            const savedHistory = localStorage.getItem(historyKey);
            const savedPending = localStorage.getItem(pendingKey);

            let loadedMessages = [];

            if (savedHistory) {
                loadedMessages = safeMessages(JSON.parse(savedHistory));
            }

            let loadedPending = null;

            if (savedPending) {
                loadedPending = JSON.parse(savedPending);
            }

            if (loadedMessages.length === 0) {
                const initialMessages = [welcomeMessage()];
                const roleMsg = roleMessage();

                if (roleMsg) {
                    initialMessages.push(roleMsg);
                }

                setMessages(initialMessages);
            } else {
                setMessages(loadedMessages);
            }

            setPendingAction(loadedPending || null);
        } catch (error) {
            console.error('Chatbot history load error:', error);

            const initialMessages = [welcomeMessage()];
            const roleMsg = roleMessage();

            if (roleMsg) {
                initialMessages.push(roleMsg);
            }

            setMessages(initialMessages);
            setPendingAction(null);
        }
    };

    const saveChatHistory = (nextMessages = messages, nextPending = pendingAction) => {
        const historyKey = getUserKey();
        const pendingKey = getPendingKey();

        try {
            localStorage.setItem(historyKey, JSON.stringify(nextMessages));

            if (nextPending) {
                localStorage.setItem(pendingKey, JSON.stringify(nextPending));
            } else {
                localStorage.removeItem(pendingKey);
            }
        } catch (error) {
            console.error('Chatbot history save error:', error);
        }
    };

    useEffect(() => {
        loadChatHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.email, user?.role]);

    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages, pendingAction);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, pendingAction]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, loading]);

    const clearChatHistory = () => {
        const historyKey = getUserKey();
        const pendingKey = getPendingKey();

        localStorage.removeItem(historyKey);
        localStorage.removeItem(pendingKey);

        const initialMessages = [welcomeMessage()];
        const roleMsg = roleMessage();

        if (roleMsg) {
            initialMessages.push(roleMsg);
        }

        setMessages(initialMessages);
        setPendingAction(null);
        saveChatHistory(initialMessages, null);
    };

    const addUserMessage = (text) => {
        const message = {
            sender: 'user',
            text,
            cards: [],
            quickReplies: [],
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, message]);
    };

    const normalizeCards = (cards) => {
        if (!Array.isArray(cards)) return [];

        return cards.map((card) => ({
            title: card.title || '',
            subtitle: card.subtitle || '',
            description: card.description || '',
            meta: Array.isArray(card.meta) ? card.meta : [],
            url: card.url || card.link || '',
        }));
    };

    const addBotMessage = (data) => {
        const message = {
            sender: 'bot',
            text: data.reply || 'Sorry, I could not process that.',
            cards: normalizeCards(data.cards),
            quickReplies: Array.isArray(data.quick_replies)
                ? data.quick_replies
                : Array.isArray(data.quickReplies)
                    ? data.quickReplies
                    : [],
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, message]);

        if (data.requires_confirmation && data.pending_action) {
            setPendingAction(data.pending_action);
        } else {
            setPendingAction(null);
        }
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();

        if (!trimmed || loading) return;

        addUserMessage(trimmed);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/chatbot/message/', {
                message: trimmed,
            });

            addBotMessage(response.data);
        } catch (error) {
            console.error('Chatbot error:', error);

            addBotMessage({
                reply: 'Sorry, the chatbot server is not responding right now.',
                cards: [],
                quick_replies: ['Show destinations', 'Show tours'],
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmPendingAction = async () => {
        if (!pendingAction || loading) return;

        addUserMessage('Confirm');
        setLoading(true);

        try {
            const response = await axios.post('/chatbot/message/', {
                message: 'confirm',
                confirmed_action: pendingAction,
            });

            addBotMessage(response.data);
            setPendingAction(null);
        } catch (error) {
            console.error('Confirm action error:', error);

            addBotMessage({
                reply: 'Sorry, I could not complete the confirmed action.',
                cards: [],
                quick_replies: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const cancelPendingAction = () => {
        addUserMessage('Cancel');
        setPendingAction(null);

        const cancelMessage = {
            sender: 'bot',
            text: 'Okay, I cancelled the action. Nothing was changed.',
            cards: [],
            quickReplies: ['Help', 'Show destinations', 'Show tours'],
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, cancelMessage]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleQuickReply = (reply) => {
        if (reply.toLowerCase() === 'confirm' && pendingAction) {
            confirmPendingAction();
            return;
        }

        if (reply.toLowerCase() === 'cancel' && pendingAction) {
            cancelPendingAction();
            return;
        }

        sendMessage(reply);
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Open chatbot"
                >
                    <FaRobot className="text-2xl" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[390px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <FaRobot className="text-xl" />
                            </div>

                            <div>
                                <h3 className="font-bold leading-tight">PothBondhu</h3>
                                <p className="text-xs text-white/90">
                                    {isAuthenticated
                                        ? `${user?.role || 'User'} assistant`
                                        : 'Travel assistant'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearChatHistory}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                                aria-label="Clear chatbot history"
                                title="Clear chat"
                            >
                                <FaTrash className="text-sm" />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                                aria-label="Close chatbot"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.createdAt || 'msg'}-${index}`}
                                className={`flex ${
                                    message.sender === 'user'
                                        ? 'justify-end'
                                        : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`max-w-[88%] ${
                                        message.sender === 'user'
                                            ? 'items-end'
                                            : 'items-start'
                                    } flex flex-col gap-2`}
                                >
                                    <div
                                        className={`flex items-start gap-2 ${
                                            message.sender === 'user'
                                                ? 'flex-row-reverse'
                                                : 'flex-row'
                                        }`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                message.sender === 'user'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {message.sender === 'user' ? (
                                                <FaUser className="text-xs" />
                                            ) : (
                                                <FaRobot className="text-xs" />
                                            )}
                                        </div>

                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                                                message.sender === 'user'
                                                    ? 'bg-primary-600 text-white rounded-tr-sm'
                                                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                                            }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>

                                    {message.cards && message.cards.length > 0 && (
                                        <div className="space-y-2 w-full">
                                            {message.cards.map((card, cardIndex) => (
                                                <div
                                                    key={cardIndex}
                                                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                                                >
                                                    <h4 className="font-semibold text-gray-800 text-sm">
                                                        {card.title}
                                                    </h4>

                                                    {card.subtitle && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {card.subtitle}
                                                        </p>
                                                    )}

                                                    {card.description && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {card.description}
                                                        </p>
                                                    )}

                                                    {card.meta && card.meta.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {card.meta.map((item, metaIndex) => (
                                                                <p
                                                                    key={metaIndex}
                                                                    className="text-xs text-gray-500"
                                                                >
                                                                    {item}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {card.url && (
                                                        <Link
                                                            to={card.url}
                                                            className="inline-block mt-2 text-xs font-medium text-primary-600 hover:text-primary-700"
                                                            onClick={() => setIsOpen(false)}
                                                        >
                                                            Open details →
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {message.quickReplies &&
                                        message.quickReplies.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {message.quickReplies.map(
                                                    (reply, replyIndex) => (
                                                        <button
                                                            key={replyIndex}
                                                            onClick={() =>
                                                                handleQuickReply(reply)
                                                            }
                                                            disabled={loading}
                                                            className="text-xs px-3 py-1.5 rounded-full bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {reply}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}

                        {pendingAction && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                <p className="text-xs text-yellow-800 font-medium mb-2">
                                    Confirmation required
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={confirmPendingAction}
                                        disabled={loading}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <FaCheck />
                                        Confirm
                                    </button>

                                    <button
                                        onClick={cancelPendingAction}
                                        disabled={loading}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <FaTimesCircle />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                                    <FaSpinner className="animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-3 bg-white border-t border-gray-200"
                    >
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask PothBondhu..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            PothBondhu can make limited actions only after your confirmation.
                        </p>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;