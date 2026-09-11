import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { chatApi } from "../../api/chat.api";
import MessageBubble from "./MessageBubble";
import { SendHorizontal, MessageSquareDashed } from "lucide-react";

// Renders the active conversation's message history feed and user input container
export default function ChatWindow({ conversation }) {
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
      const joinResp = await joinConversation(conversation.id);
      if (!joinResp.ok) return;
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
    const resp = await sendMessage(conversation.id, text);
    setSending(false);
    if (resp.ok) {
      setInput("");
      emitTyping(conversation.id, false);
    }
  };

  return (
    <div className="card border border-[#e8e8ed] shadow-none flex h-[70vh] flex-col overflow-hidden bg-white">
      <div className="flex items-center gap-3 border-b border-[#e8e8ed] px-4 py-3 bg-[#f5f5f7]/40 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] border border-[#e8e8ed] text-[10px] font-bold text-[#1d1d1f]">
          {(other?.name?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1d1d1f] leading-tight">
            {other?.name ?? "User"}
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {other?.email}
          </p>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-white px-5 py-5 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-450 py-10">
            <MessageSquareDashed className="h-6 w-6 text-slate-300 mb-2" />
            <p className="font-bold text-[#1d1d1f]">No messages yet</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
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
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 italic bg-[#f5f5f7] border border-[#e8e8ed] w-fit px-2.5 py-1 rounded-full">
            <span>typing...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-[#e8e8ed] px-4 py-3 bg-white shrink-0"
      >
        <input
          className="input pr-12 focus:bg-white"
          placeholder="Type your message here..."
          value={input}
          onChange={(e) => onChange(e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary rounded-xl shrink-0 p-2.5"
          disabled={sending || input.trim().length === 0}
          title="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
