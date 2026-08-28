"use client";

// Booked: a plain status pill. Not booked: a button that hands the task
// straight to Claude (POST /api/tasks/[id]/book) to pick a time and book
// it, same judgment (planning rules, duration, conflict-check) the chat
// itself uses — this is a shortcut into that, not a separate code path.

interface Props {
  booked: boolean;
  booking: boolean;
  onBook: () => void;
}

export default function BookButton({ booked, booking, onBook }: Props) {
  if (booked) {
    return (
      <span
        style={{
          flex: "none",
          background: "#EFF8E4",
          color: "#3D5C1B",
          borderRadius: 99,
          padding: "4px 10px",
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: ".03em",
        }}
      >
        BOOKED
      </span>
    );
  }

  return (
    <button
      onClick={onBook}
      disabled={booking}
      title="Ask Claude to book this onto your calendar"
      style={{
        flex: "none",
        background: booking ? "#E4E4DE" : "#14140F",
        color: booking ? "#93938A" : "#FFFFFF",
        border: 0,
        borderRadius: 99,
        padding: "4px 10px",
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: ".03em",
      }}
    >
      {booking ? "BOOKING…" : "BOOK"}
    </button>
  );
}
