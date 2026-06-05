"use client";

import { useEffect, useRef, useState } from "react";
import { searchMessages } from "@/services/api/messages.api";
import { MessageRow } from "@/types/chat.types";
import { getRequestErrorMessage } from "@/utils/api.utils";
import ChatIcon from "@/components/ui/ChatIcon";

type Props = {
  conversationId: number;
  onClose: () => void;
};

function normaliseRows(model: unknown): MessageRow[] {
  if (!model) return [];
  if (Array.isArray(model)) return model as MessageRow[];
  if (typeof model === "object" && model !== null) {
    const obj = model as { Rows?: MessageRow[]; rows?: MessageRow[] };
    return (obj.Rows ?? obj.rows ?? []) as MessageRow[];
  }
  return [];
}

/** Slide-in panel for searching within the active conversation. */
export default function InChatSearchPanel({ conversationId, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MessageRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        setError("");
        setLoading(true);
        const res = await searchMessages(conversationId, query.trim(), 1, 30);
        setResults(normaliseRows(res.Model));
        setSearched(true);
      } catch (err) {
        setError(getRequestErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, conversationId]);

  return (
    <div className="search-panel" role="region" aria-label="Search messages">
      <div className="search-panel-header">
        <button
          type="button"
          className="chat-icon-button"
          onClick={onClose}
          aria-label="Close search"
        >
          <ChatIcon name="back" size={18} />
        </button>
        <div className="search-panel-input-wrap">
          <span className="search-icon">
            <ChatIcon name="search" size={16} />
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search messages in this chat..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              <ChatIcon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="search-panel-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span className="alert-message">{error}</span>
          </div>
        )}

        {loading && (
          <div className="search-loading">
            <div className="shimmer-line" style={{ width: "60%" }} />
            <div className="shimmer-line" style={{ width: "80%" }} />
            <div className="shimmer-line" style={{ width: "40%" }} />
          </div>
        )}

        {!loading && !error && query.trim() && results.length === 0 && searched && (
          <div className="search-empty">
            <ChatIcon name="search" size={32} />
            <p>No messages found</p>
            <span>Try different keywords</span>
          </div>
        )}

        {!loading && !error && !query.trim() && (
          <div className="search-empty">
            <ChatIcon name="search" size={32} />
            <p>Search this conversation</p>
            <span>Find messages by keyword</span>
          </div>
        )}

        {!loading && results.length > 0 && (
          <ul className="search-results">
            {results.map((row) => (
              <li key={row.messageid} className="search-result-row">
                <div className="search-result-avatar">
                  {(row.username ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="search-result-body">
                  <div className="search-result-meta">
                    <span className="search-result-name">
                      {row.username ?? `User #${row.senderuserid}`}
                    </span>
                    <span className="search-result-date">
                      {row.creationdate
                        ? new Date(row.creationdate).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="search-result-text">{row.messagecontent}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
