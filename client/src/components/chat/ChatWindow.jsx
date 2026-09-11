import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { chatApi } from "../../api/chat.api";
import MessageBubble from "./MessageBubble";
import { SendHorizontal, MessageSquareDashed, ArrowLeft } from "lucide-react";

// Renders the active conversation's message history feed and user input container
export default function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth();
  const {
    joinConversation,
    leaveConversation,
    sendMessage,
    on,
    emitTyping,
    markRead,
  } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const listRef = useRef(null);
  const typingTimeout = useRef(null);

  const other = conversation.participants.find(
    (p) => p.user.id !== user?.id,
  )?.user;

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      // Attempt socket join in background without blocking API fetch
      joinConversation(conversation.id).catch(() => undefined);
      try {
        const res = await chatApi.messages(conversation.id);
        if (!cancelled && res.data) setMessages(res.data);
        markRead(conversation.id);
      } catch {
        /* ignore */
      }
    };
    setup();
    return () => {
      cancelled = true;
      leaveConversation(conversation.id);
    };
  }, [conversation.id, joinConversation, leaveConversation, markRead]);

  useEffect(() => {
    const off1 = on("new_message", (m) => {
      if (m.conversationId !== conversation.id) return;
      setMessages((prev) =>
        prev.some((x) => x.id === m.id) ? prev : [...prev, m],
      );
      if (m.senderId !== user?.id) markRead(conversation.id);
    });
    const off2 = on("typing", (data) => {
      if (data.conversationId !== conversation.id) return;
      if (data.userId === user?.id) return;
      setTypingUser({ userId: data.userId, isTyping: data.isTyping });
    });
    const off3 = on("messages_read", (data) => {
      if (data.conversationId !== conversation.id) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m)),
      );
    });
    return () => {
      off1();
      off2();
      off3();
    };
  }, [conversation.id, user?.id, on, markRead]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, typingUser?.isTyping]);

  const onChange = (v) => {
    setInput(v);
    emitTyping(conversation.id, v.length > 0);
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(
      () => emitTyping(conversation.id, false),
      1500,
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);

    try {
      let sent = false;
      const resp = await sendMessage(conversation.id, text);
      if (resp?.ok) {
        sent = true;
      } else {
        // Fallback to HTTP REST API if socket fails or is disconnected
        const res = await chatApi.send(conversation.id, text);
        if (res?.data) {
          setMessages((prev) =>
            prev.some((x) => x.id === res.data.id) ? prev : [...prev, res.data],
          );
          sent = true;
        }
      }

      if (sent) {
        setInput("");
        emitTyping(conversation.id, false);
      } else {
        toast.error("Could not send message. Please try again.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card border border-zinc-200 rounded-lg shadow-xs flex h-[calc(100dvh-180px)] min-h-[460px] lg:h-[70vh] flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 bg-zinc-50/70 shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden p-1.5 -ml-1 text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-200/60 transition-colors"
            title="Back to conversations"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-900 shrink-0">
          {(other?.name?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-900 leading-tight truncate">
            {other?.name ?? "User"}
          </p>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
            {other?.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-white px-3 sm:px-5 py-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-zinc-400 py-10">
            <MessageSquareDashed className="h-6 w-6 text-zinc-300 mb-2" />
            <p className="font-semibold text-zinc-800">No messages yet</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Send a message to start conversation.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              mine={m.senderId === user?.id}
            />
          ))
        )}
        {typingUser?.isTyping && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 italic bg-zinc-100 border border-zinc-200 w-fit px-2.5 py-1 rounded-full">
            <span>typing...</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-zinc-200 px-3 sm:px-4 py-2.5 bg-white shrink-0"
      >
        <input
          className="input pr-10 focus:bg-white text-xs"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => onChange(e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary rounded-lg shrink-0 p-2 sm:px-3 sm:py-1.5"
          disabled={sending || input.trim().length === 0}
          title="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
