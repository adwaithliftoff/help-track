import { apiFetch } from "@/lib/api";
import { useState } from "react";

type Comment = {
  id: number;
  comment: string;
  createdAt: string;
  updater: { fullName: string };
};

export default function TicketComments({
  ticketId,
  comments,
  onCommentAdded,
}: {
  ticketId: number;
  comments: Comment[];
  onCommentAdded: () => void;
}) {
  const [text, setText] = useState("");

  async function handleSubmit() {
    await apiFetch(`/tickets/${ticketId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment: text }),
    });
    setText("");
    onCommentAdded();
  }
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white">Comments</h2>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border-b border-white/10 last:border-0 pb-3"
        >
          <div className="flex justify-between mb-1">
            <p className="text-sm text-gray-300 font-medium">
              {comment.updater.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-sm text-gray-400">{comment.comment}</p>
        </div>
      ))}
      <div className="space-y-2 pt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Add a comment..."
          className="w-full resize-none rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-black border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
        >
          Post
        </button>
      </div>
    </div>
  );
}
