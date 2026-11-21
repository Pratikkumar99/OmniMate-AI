import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Menu,
  X,
  Trash2,
  Loader2,
  Plus,
  FileText,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [message, setMessage] = useState("");
  const [documentId, setDocumentId] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);

  const fileInputRef = useRef(null);

  const uploadPDF = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    setPdfUploading(true);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }
      // Set newly uploaded PDF as active
      setDocumentId(data.documentId);
      setPdfName(data.fileName);
    } catch (error) {
      console.error("PDF upload error:", error);
      alert(error.message);
    } finally {
      setPdfUploading(false);

      // Allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
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
    if (!message.trim() || loading || pdfUploading) return;

    const question = message;
    const previousChats = chats;

    // Add user's message
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
      let response;

      if (documentId) {
        // PDF-based RAG chat
        response = await fetch(`${API_URL}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            documentId,
            history: previousChats,
          }),
        });
      } else {
        // Normal AI chat
        response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            history: previousChats,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Add AI response
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
  3000;

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

          {/* Input Area */}

          {/* Input Area */}
          <div className="sticky bottom-0 bg-[#F5F0E8] pt-4 pb-2">
            {/* Uploaded PDF indicator */}
            {pdfName && (
              <div className="mb-3 flex items-center justify-between bg-[#C7F0B2] border-2 border-black p-3 shadow-[3px_3px_0px_black]">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={22} />

                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">{pdfName}</p>
                    <p className="text-xs font-medium">
                      PDF ready for questions
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDocumentId(null);
                    setPdfName("");
                  }}
                  className="p-1 hover:bg-white border-2 border-transparent hover:border-black"
                  title="Remove active PDF"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Uploading indicator */}
            {pdfUploading && (
              <div className="mb-3 flex items-center gap-2 bg-[#A9C7FF] border-2 border-black p-3">
                <Loader2 size={18} className="animate-spin" />
                <span className="font-bold text-sm">
                  Uploading and processing PDF...
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 border-[3px] border-black bg-white p-2 shadow-[5px_5px_0px_black]">
              {/* Hidden PDF input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadPDF(file);
                }}
              />

              {/* Attach PDF button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={pdfUploading}
                className="p-2 hover:bg-[#FFE45C] disabled:opacity-50"
                title="Upload PDF"
              >
                <Plus size={21} />
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder={
                  pdfName
                    ? `Ask anything about ${pdfName}...`
                    : "Message OmniMate..."
                }
                className="flex-1 min-w-0 p-3 outline-none bg-transparent font-medium"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim() || loading || pdfUploading}
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
