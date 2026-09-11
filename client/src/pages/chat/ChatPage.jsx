import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { chatApi } from "../../api/chat.api";
import { useAuth } from "../../context/AuthContext";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import Loader from "../../components/common/Loader";
import { MessageSquare, ArrowLeftRight } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeId = searchParams.get("c");

  useEffect(() => {
    let cancelled = false;
    chatApi
      .conversations()
      .then((r) => {
        if (cancelled) return;
        const conversations = r.data ?? [];
        setList(conversations);
        if (conversations.length > 0) {
          const match = activeId
            ? conversations.find((c) => c.id === activeId)
            : null;
          // On mobile screens, only activate if explicit c query param is present
          const isMobile = window.innerWidth < 1024;
          if (match) {
            setActive(match);
          } else if (!isMobile && !activeId) {
            setActive(conversations[0]);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const handleSelectConversation = (c) => {
    setActive(c);
    setSearchParams({ c: c.id });
  };

  const handleBackToList = () => {
    setActive(null);
    setSearchParams({});
  };

  if (loading)
    return (
      <div className="py-24">
        <Loader label="Loading conversations..." />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      {/* Header - hide on mobile if active chat is open to save screen real estate */}
      <div className={`mb-4 sm:mb-5 ${active ? "hidden lg:block" : "block"}`}>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          Messages
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Discuss matching details and handover logistics securely with other users.
        </p>
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[320px_1fr]">
        {/* Conversation List: hidden on mobile if an active conversation is open */}
        <div className={`${active ? "hidden lg:block" : "block"}`}>
          <ConversationList
            conversations={list}
            currentId={active?.id}
            currentUserId={user?.id}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Chat Window / Placeholder: hidden on mobile if no active conversation */}
        <div className={`${!active ? "hidden lg:block" : "block"}`}>
          {active ? (
            <ChatWindow
              key={active.id}
              conversation={active}
              onBack={handleBackToList}
            />
          ) : (
            <div className="card border border-zinc-200 rounded-lg p-6 h-[70vh] hidden lg:flex flex-col items-center justify-center text-center text-xs text-zinc-400 bg-white">
              <ArrowLeftRight className="h-6 w-6 text-zinc-300 mb-2" />
              <p className="font-semibold text-zinc-800">Select a conversation</p>
              <p className="text-zinc-400 mt-0.5 max-w-xs leading-relaxed">
                Choose a conversation from the sidebar to view chat history and exchange messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
