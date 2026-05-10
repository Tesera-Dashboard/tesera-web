"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  RotateCcw,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "model";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const STARTER_PROMPTS = [
  "Bugün stok durumumu özetle",
  "Geciken kargolar hakkında ne yapmalıyım?",
  "Siparişleri nasıl optimize edebilirim?",
  "En çok satan ürünlerim hangileri olabilir?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await fetchWithAuth("/ai/conversations");
      if (!res.ok) throw new Error("Konuşmalar yüklenemedi");
      const data = await res.json();
      setConversations(data);
    } catch (err: any) {
      toast.error(err.message || "Konuşmalar yüklenemedi");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`/ai/conversations/${conversationId}`);
      if (!res.ok) throw new Error("Konuşma yüklenemedi");
      const data = await res.json();
      const loadedMessages: Message[] = data.messages.map((m: any) => ({
        role: m.role === "model" ? "model" : "user",
        content: m.content,
      }));
      setMessages(loadedMessages);
      setSelectedConversationId(conversationId);
    } catch (err: any) {
      toast.error(err.message || "Konuşma yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSelectedConversationId(null);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/ai/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Konuşma silinemedi");
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedConversationId === id) {
        setMessages([]);
        setSelectedConversationId(null);
      }
      toast.success("Konuşma silindi");
    } catch (err: any) {
      toast.error(err.message || "Konuşma silinemedi");
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetchWithAuth("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: newMessages,
          conversation_id: selectedConversationId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Bir hata oluştu");
      }

      const data = await res.json();
      setMessages([...newMessages, { role: "model", content: data.message }]);

      if (!selectedConversationId) {
        setSelectedConversationId(data.conversation_id);
        await loadConversations();
      } else {
        // Update the conversation's updated_at in the list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversationId ? { ...c, updated_at: new Date().toISOString() } : c
          )
        );
      }
    } catch (err: any) {
      toast.error(err.message || "YZ yanıt oluşturamadı.");
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSelectedConversationId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex h-full -m-6">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-muted/30 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
          sidebarOpen ? "w-72 min-w-[18rem]" : "w-0 min-w-0 border-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 justify-start gap-2"
            onClick={handleNewConversation}
          >
            <Plus className="h-4 w-4" />
            Yeni Konuşma
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground px-4">
              Henüz konuşma yok. Yeni bir konuşma başlatın.
            </div>
          ) : (
            conversations
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedConversationId === conv.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent text-foreground"
                  )}
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDate(conv.updated_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(conv.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                YZ Asistanı
              </h2>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Yeni Sohbet
            </Button>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-10">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">Nasıl yardımcı olabilirim?</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Envanter, siparişler, kargolar veya iş operasyonlarınızla ilgili sorularınızı sorun.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg px-4">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-sm text-left px-4 py-3 rounded-xl border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 items-start",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border"
                    )}
                  >
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap"
                        : "bg-card border rounded-tl-sm",
                      msg.role === "model" &&
                        "prose prose-sm max-w-none dark:prose-invert prose-p:mb-2 prose-p:mt-0 prose-ul:mb-2 prose-ul:mt-0 prose-ol:mb-2 prose-ol:mt-0 prose-headings:mb-2 prose-headings:mt-3 prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:bg-muted prose-code:text-muted-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none"
                    )}
                  >
                    {msg.role === "model" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Loading bubble */}
              {isLoading && (
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
              className="resize-none min-h-[52px] max-h-40 text-sm"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[52px] w-[52px] shrink-0"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-2">
            YZ yanıtları hatalı olabilir. Önemli kararlar için çift kontrol edin.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konuşmayı Sil</DialogTitle>
            <DialogDescription>
              Bu konuşmayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
            >
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
