'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Message {
    id: string
    content: string
    senderId: string
    senderName: string
    timestamp: string
    roomId: string
}

// Ensure this matches your backend URL.
// In production, this should be routed via Nginx /api/v1/chat or distinct subdomain.
// For local dev with docker-compose exposing 3013:
const SOCKET_URL = 'http://localhost:3013'

export function ChatWidget() {
    const { user, isAuthenticated } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const roomId = user ? `support_${user.id}` : 'support_guest'

    useEffect(() => {
        if (!isOpen) return

        const newSocket = io(SOCKET_URL, {
            autoConnect: true,
            transports: ['websocket', 'polling'], // Try websocket first
        })

        newSocket.on('connect', () => {
            console.log('Chat connected')
            setIsConnected(true)

            // Join room
            newSocket.emit('join_room', {
                roomId,
                userId: user?.id || 'guest',
                userName: user?.name || 'Guest',
            })
        })

        newSocket.on('disconnect', () => {
            console.log('Chat disconnected')
            setIsConnected(false)
        })

        newSocket.on('new_message', (msg: Message) => {
            setMessages((prev) => [...prev, msg])
            scrollToBottom()
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [isOpen, user, roomId])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputValue.trim() || !socket || !isConnected) return

        const msgPayload = {
            roomId,
            senderId: user?.id || 'guest',
            senderName: user?.name || 'Guest',
            content: inputValue,
        }

        // Optimistic update? No, let's wait for server echo (or 'new_message' event) 
        // Actually chat gateway broadcasts to room including sender, so we just wait for event.
        // But for better UX we might want optimistic.
        // For now relying on server broadcast.

        socket.emit('send_message', msgPayload)
        setInputValue('')
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 animate-in fade-in zoom-in duration-300"
                size="icon"
            >
                <MessageCircle className="h-8 w-8" />
            </Button>
        )
    }

    return (
        <div className={`fixed bottom-6 right-6 w-[350px] bg-card border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-bold">Live Support</span>
                    {isConnected ? (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/80" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}>
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/80" onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-muted/20">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm opacity-60">
                                <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                                <p>Start a conversation with us!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === (user?.id || 'guest')
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]'
                                                    : 'bg-card border border-border text-card-foreground rounded-tl-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]'
                                                }`}>
                                                {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>}
                                                <p>{msg.content}</p>
                                                <p className="text-[10px] mt-1 opacity-60 text-right">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-background">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="border-2 border-input focus-visible:ring-0 focus-visible:border-primary"
                                disabled={!isConnected}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!isConnected || !inputValue.trim()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary hover:translate-y-0.5 active:translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}
