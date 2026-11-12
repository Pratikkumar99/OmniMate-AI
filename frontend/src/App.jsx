import { useState, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Menu,
   X, Trash2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
const API_URL = import.meta.env.VITE_API_URL
function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("omnimates_chats");

    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const deleteAllChats = () => {
    setChats([]);
    localStorage.removeItem("omnimates_chats");
  };
  useEffect(() => {
    localStorage.setItem("omnimates_chats", JSON.stringify(chats));
  }, [chats]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const question = message;

    // Store previous conversation before adding new message
    const previousChats = chats;

    // Add user's message to UI
    setChats((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history: previousChats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Add AI response to UI
      setChats((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      setChats((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);

      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Tell me some news about politics",
    "What's the weather in mumbai?",
    "Tell me something interesting",
    "What is price of bitcoin?",
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-black flex">
      {/* Main Chat */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 border-b-[3px] border-black px-5 md:px-8 flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)}>
                <Menu />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#A9C7FF] border-2 border-black flex items-center justify-center">
                <Bot size={22} />
              </div>
              <div>
                <p className="font-black">OmniMate AI</p>
                <p className="text-xs text-green-700 font-bold">
                  ● Ready to chat
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm font-bold">
            <button
              onClick={deleteAllChats}
              className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-[#FF9E8F] text-black font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            >
              <Trash2 size={16} />
              Delete Chats
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <section className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col">
          {chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#A9C7FF] border-[3px] border-black shadow-[6px_6px_0px_black] flex items-center justify-center mb-7">
                <Bot size={42} />
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Hey there!
              </h2>

              <p className="text-gray-600 text-lg max-w-lg mb-10">
                I'm OmniMate, your personal AI assistant. Ask me anything. Let's
                figure things out together.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(item)}
                    className="text-left bg-white border-[2px] border-black p-4 font-bold shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition"
                  >
                    <Sparkles size={18} className="mb-3 text-blue-600" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-6 pb-8">
              {chats.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${
                    chat.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 border-[2px] border-black shadow-[4px_4px_0px_black] ${
                      chat.role === "user" ? "bg-[#FFE45C]" : "bg-white"
                    }`}
                  >
                    <p className="text-xs font-black uppercase mb-3">
                      {chat.role === "user" ? "You" : "OmniMate"}
                    </p>

                    {chat.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-black mb-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-black mt-4 mb-2 border-b-2 border-black pb-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="font-black text-lg mt-3 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="leading-7 text-gray-800 mb-3 last:mb-0">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-black text-black bg-[#FFE45C] px-1">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6 space-y-2 my-3">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-6 space-y-2 my-3">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-7 pl-1">{children}</li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="bg-[#C7F0B2] border-l-4 border-black p-3 my-4 font-medium">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="border-t-2 border-black my-4" />
                          ),
                        }}
                      >
                        {chat.text}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap leading-7">
                        {chat.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#A9C7FF] border-2 border-black p-4 shadow-[4px_4px_0px_black]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">OmniMate is thinking</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:150ms]"></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:300ms]"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="sticky bottom-0 bg-[#F5F0E8] pt-4 pb-2">
            <div className="flex items-center gap-3 border-[3px] border-black bg-white p-2 shadow-[5px_5px_0px_black]">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Message OmniMate..."
                className="flex-1 min-w-0 p-3 outline-none bg-transparent font-medium"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className="bg-[#FFE45C] border-2 border-black p-3 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              OmniMate AI can make mistakes. Verify important information.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
