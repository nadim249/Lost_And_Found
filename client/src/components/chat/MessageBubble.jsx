import { Check, CheckCheck } from "lucide-react";

// Message bubble UI component
export default function MessageBubble({ message, mine }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs transition-all duration-200 ${
          mine
            ? "rounded-tr-none bg-[#1d1d1f] text-white"
            : "rounded-tl-none bg-[#f5f5f7] text-[#1d1d1f] border border-[#e8e8ed]"
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.messageText}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1 text-[9px]">
          <span className={mine ? "text-[#86868b]" : "text-slate-400"}>
            {time}
          </span>
          {mine && (
            <span className="shrink-0" title={message.isRead ? "Read" : "Sent"}>
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-indigo-400" />
              ) : (
                <Check className="h-3 w-3 text-slate-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
