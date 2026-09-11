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
    <div className="card border border-zinc-200 rounded-lg shadow-xs flex flex-col h-[calc(100dvh-180px)] min-h-[460px] lg:h-[70vh] overflow-hidden bg-white">
      <div className="border-b border-zinc-200 px-4 py-3 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-zinc-500" />
          <p className="text-xs font-semibold text-zinc-800">
            Conversations
          </p>
        </div>
        <span className="rounded-md bg-white border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
          {conversations.length}
        </span>
      </div>

      <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center text-xs text-zinc-400">
            <User className="h-6 w-6 text-zinc-300 mb-2" />
            <p className="font-semibold text-zinc-800">No active messages</p>
            <p className="text-[11px] text-zinc-400 mt-0.5 max-w-[200px]">
              Tap "Message Reporter" on any listing to start a conversation.
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
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 hover:bg-zinc-50/80 cursor-pointer ${
                    active
                      ? "bg-zinc-100/70 border-l-3 border-zinc-900"
                      : "border-l-3 border-transparent"
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      active
                        ? "bg-white border border-zinc-200 text-zinc-900 shadow-2xs"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {(u?.name?.[0] ?? "?").toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p
                        className={`truncate text-xs font-medium ${active ? "text-zinc-900 font-semibold" : "text-zinc-700"}`}
                      >
                        {u?.name ?? "Conversation"}
                      </p>
                      {hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 ml-1.5" />
                      )}
                    </div>
                    <p
                      className={`truncate text-[11px] leading-relaxed ${hasUnread ? "font-semibold text-zinc-900" : "text-zinc-400"}`}
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
