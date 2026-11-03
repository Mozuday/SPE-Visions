import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  Reply,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type { Tables } from "../../../types/supabase";
import { formatDate, formatRelativeTime, truncate } from "../../../utils/formatters";
import { statusColorMap } from "../../../utils/helpers";

import AdminTable from "../../components/AdminTable";

type Message = Tables<"contact_messages">;
type MessageStatus = Message["status"];

const statuses: MessageStatus[] = ["new", "read", "replied", "archived"];

const inputClass =
  "rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const StatusBadge = ({ status }: { status: MessageStatus }) => (
  <span
    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColorMap[status]}`}
  >
    {status}
  </span>
);

const ManageMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  const [filter, setFilter] = useState<MessageStatus | "all">("all");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Message | null>(null);

  // =========================================================
  // Load
  // =========================================================

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data ?? []);
    } catch (err) {
      console.error("Failed to load messages:", err);

      setError("Couldn't load messages. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 4000);

    return () => clearTimeout(timer);
  }, [success]);

  // =========================================================
  // Status
  // =========================================================

  const updateStatus = async (message: Message, status: MessageStatus) => {
    if (message.status === status) return;

    setError(null);

    const apply = (next: MessageStatus) => {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? { ...item, status: next } : item
        )
      );

      setSelected((current) =>
        current && current.id === message.id
          ? { ...current, status: next }
          : current
      );
    };

    // Optimistic update, reverted if the server refuses
    apply(status);

    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", message.id);

    if (updateError) {
      console.error("Failed to update message status:", updateError);

      apply(message.status);
      setError("Couldn't update the status. Please try again.");
    }
  };

  const openMessage = (message: Message) => {
    setSelected(message);

    // Opening a new message counts as reading it
    if (message.status === "new") {
      void updateStatus(message, "read");
    }
  };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = async (message: Message) => {
    const confirmed = window.confirm(
      "Delete this message permanently? This can't be undone."
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", message.id);

    if (deleteError) {
      console.error("Failed to delete message:", deleteError);
      setError("Couldn't delete this message. Please try again.");
      return;
    }

    setMessages((current) => current.filter((item) => item.id !== message.id));
    setSelected((current) => (current?.id === message.id ? null : current));
    setSuccess("Message deleted.");
  };

  // =========================================================
  // Derived
  // =========================================================

  const counts = useMemo(() => {
    const result: Record<MessageStatus, number> = {
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    for (const message of messages) {
      result[message.status] += 1;
    }

    return result;
  }, [messages]);

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      if (filter !== "all" && message.status !== filter) return false;

      if (!query) return true;

      return [message.name, message.email, message.subject, message.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [messages, filter, search]);

  // =========================================================
  // UI
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Messages
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Enquiries sent through the contact form on your website.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(filter === status ? "all" : status)}
            className={`rounded-2xl border bg-white p-5 text-left transition dark:bg-slate-900 ${
              filter === status
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
            }`}
          >
            <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
              {status}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {counts[status]}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, subject or message"
            aria-label="Search messages"
            className={`${inputClass} w-full pl-11`}
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as MessageStatus | "all")
          }
          aria-label="Filter by status"
          className={`${inputClass} sm:w-48`}
        >
          <option value="all">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable<Message>
        data={visibleMessages}
        emptyMessage={
          messages.length === 0
            ? "No messages yet. Enquiries from your contact form will appear here."
            : "No messages match your filters."
        }
        columns={[
          {
            key: "name",
            label: "From",
            render: (item) => (
              <div className="min-w-0">
                <p
                  className={`text-slate-900 dark:text-white ${
                    item.status === "new" ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.email}
                </p>
              </div>
            ),
          },
          {
            key: "message",
            label: "Message",
            render: (item) => (
              <div className="max-w-sm">
                {item.subject && (
                  <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400">
                    {item.subject}
                  </p>
                )}

                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {truncate(item.message, 90)}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => <StatusBadge status={item.status} />,
          },
          {
            key: "created_at",
            label: "Received",
            render: (item) => (
              <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                {formatRelativeTime(item.created_at)}
              </span>
            ),
          },
        ]}
        onEdit={openMessage}
        onDelete={(item) => void handleDelete(item)}
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selected.subject || "Message"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Received {formatDate(selected.created_at, "long")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Sender */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {selected.name}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <a
                    href={`mailto:${selected.email}`}
                    className="mt-1 flex items-center gap-2 break-all font-medium text-blue-600 hover:underline dark:text-cyan-400"
                  >
                    <Mail size={15} className="shrink-0" />
                    {selected.email}
                  </a>
                </div>

                {selected.phone && (
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <a
                      href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                      className="mt-1 flex items-center gap-2 font-medium text-blue-600 hover:underline dark:text-cyan-400"
                    >
                      <Phone size={15} className="shrink-0" />
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Message
                </p>

                <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 leading-7 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {selected.message}
                </p>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="message-status"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Status
                </label>

                <select
                  id="message-status"
                  value={selected.status}
                  onChange={(event) =>
                    void updateStatus(selected, event.target.value as MessageStatus)
                  }
                  className={`${inputClass} w-full sm:w-60`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => void handleDelete(selected)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={17} />
                  Delete
                </button>

                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(
                    `Re: ${selected.subject || "Your enquiry to SPE Visions"}`
                  )}`}
                  onClick={() => void updateStatus(selected, "replied")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Reply size={17} />
                  Reply by Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMessages;