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
    chatApi
      .conversations()
      .then((r) => {
        const conversations = r.data ?? [];
        setList(conversations);
        if (conversations.length > 0) {
          const match = activeId
            ? conversations.find((c) => c.id === activeId)
            : null;
          setActive(match || conversations[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [activeId]);

  if (loading)
    return (
      <div className="py-24">
        <Loader label="Loading conversations..." />
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          Messages
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Discuss matching details and handover logistics securely with other users.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <ConversationList
          conversations={list}
          currentId={active?.id}
          currentUserId={user?.id}
          onSelect={(c) => {
            setActive(c);
            setSearchParams({ c: c.id });
          }}
        />

        <div>
          {active ? (
            <ChatWindow key={active.id} conversation={active} />
          ) : (
            <div className="card-pad h-[70vh] flex flex-col items-center justify-center text-center text-xs text-slate-500 border border-[#e8e8ed]">
              <ArrowLeftRight className="h-6 w-6 text-slate-350 mb-2" />
              <p className="font-bold text-[#1d1d1f]">Select a conversation</p>
              <p className="text-slate-450 mt-0.5 font-semibold">
                Click a user on the sidebar list to see the chat history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
