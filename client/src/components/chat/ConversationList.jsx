import { MessageSquare, User } from "lucide-react";

const other = (c, me) => {
  const o = c.participants.find((p) => p.user.id !== me)?.user;
  return o;
};

// Renders a sidebar containing the list of active user chat sessions
export default function ConversationList({
  conversations,
  currentId,
  currentUserId,
  onSelect,
}) {
  return (
    <div className="card border border-[#e8e8ed] shadow-none flex flex-col h-[70vh] overflow-hidden bg-white">
      <div className="border-b border-[#e8e8ed] px-4 py-3 bg-[#f5f5f7]/40 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[#515154]" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#515154]">
          Conversations ({conversations.length})
        </p>
      </div>
      <ul className="flex-1 divide-y divide-[#e8e8ed] overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center text-xs text-slate-500">
            <User className="h-6 w-6 text-slate-350 mb-2" />
            <p className="font-bold text-[#1d1d1f]">No active messages</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Click contact buttons on item details page to start a chat.
            </p>
          </div>
        ) : (
          conversations.map((c) => {
            const u = other(c, currentUserId);
            const active = currentId === c.id;
            const hasUnread =
              c.lastMessage &&
              !c.lastMessage.isRead &&
              c.lastMessage.senderId !== currentUserId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 hover:bg-[#f5f5f7]/40 ${
                    active
                      ? "bg-[#f5f5f7]/70 border-l-4 border-[#1d1d1f]"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      active
                        ? "bg-white border border-[#e8e8ed] text-[#1d1d1f]"
                        : "bg-[#f5f5f7] text-[#515154]"
                    }`}
                  >
                    {(u?.name?.[0] ?? "?").toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`truncate text-xs font-bold ${active ? "text-[#1d1d1f]" : "text-slate-700"}`}
                      >
                        {u?.name ?? "Conversation"}
                      </p>
                      {hasUnread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1d1d1f] shrink-0 ml-1.5" />
                      )}
                    </div>
                    <p
                      className={`truncate text-[11px] leading-relaxed ${hasUnread ? "font-bold text-[#1d1d1f]" : "text-slate-400"}`}
                    >
                      {c.lastMessage
                        ? c.lastMessage.messageText
                        : "Say hello..."}
                    </p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
