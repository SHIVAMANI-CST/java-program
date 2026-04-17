// ChatScreen.tsx
import { ChatScreenProps } from "@/types/home";

export default function ChatScreen({ messages }: ChatScreenProps) {
  return (
    <div className="p-4 pb-20 h-full">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="max-w-md">
            <h1 className="text-5xl text-gray-300 font-bold mb-4">CinfyAI</h1>
            <p className="text-gray-400">
              Ask me anything and I&#39;ll do my best to assist you.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-2xl ${
                message.isUser
                  ? "ml-auto bg-gray-200 text-black"
                  : "mr-auto bg-gray-100"
              } max-w-[90%]`}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
