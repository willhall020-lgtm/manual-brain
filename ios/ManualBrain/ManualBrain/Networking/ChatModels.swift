import Foundation

// Mirrors the Anthropic Messages API shapes that app/api/chat/route.ts
// passes straight through (lib/chat-loop.ts's ChatLoopResult). The client's
// job is the same as ChatPanel.tsx's: resend the growing `messages` array
// verbatim each turn and read back whatever the server appended — it never
// needs to construct a tool_use or tool_result block itself, only round-trip
// the ones the server sends.

/// A message's `content` is either a plain string (every message this app
/// sends) or an array of content blocks (every assistant reply, and the
/// tool_result messages the server appends on this app's behalf).
enum ChatMessageContent: Codable, Equatable {
    case text(String)
    case blocks([ChatContentBlock])

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let text = try? container.decode(String.self) {
            self = .text(text)
        } else {
            self = .blocks(try container.decode([ChatContentBlock].self))
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .text(let text): try container.encode(text)
        case .blocks(let blocks): try container.encode(blocks)
        }
    }
}

enum ChatContentBlock: Codable, Equatable {
    case text(String)
    case toolUse(id: String, name: String, input: JSONValue)
    case toolResult(toolUseId: String, content: String)
    /// Anything this client doesn't need to render (e.g. a future block
    /// type) — kept so decoding the whole array never fails outright.
    case other

    private enum CodingKeys: String, CodingKey {
        case type, text, id, name, input
        case toolUseId = "tool_use_id"
        case content
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let type = try c.decodeIfPresent(String.self, forKey: .type) ?? ""
        switch type {
        case "text":
            self = .text(try c.decode(String.self, forKey: .text))
        case "tool_use":
            let id = try c.decode(String.self, forKey: .id)
            let name = try c.decode(String.self, forKey: .name)
            let input = try c.decodeIfPresent(JSONValue.self, forKey: .input) ?? .object([:])
            self = .toolUse(id: id, name: name, input: input)
        case "tool_result":
            let id = try c.decode(String.self, forKey: .toolUseId)
            let content = try c.decode(String.self, forKey: .content)
            self = .toolResult(toolUseId: id, content: content)
        default:
            self = .other
        }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .text(let text):
            try c.encode("text", forKey: .type)
            try c.encode(text, forKey: .text)
        case .toolUse(let id, let name, let input):
            try c.encode("tool_use", forKey: .type)
            try c.encode(id, forKey: .id)
            try c.encode(name, forKey: .name)
            try c.encode(input, forKey: .input)
        case .toolResult(let toolUseId, let content):
            try c.encode("tool_result", forKey: .type)
            try c.encode(toolUseId, forKey: .toolUseId)
            try c.encode(content, forKey: .content)
        case .other:
            // Never constructed client-side except by decoding an unknown
            // block; re-encoding one is not a real path, but a harmless
            // empty text block is a safer default than throwing.
            try c.encode("text", forKey: .type)
            try c.encode("", forKey: .text)
        }
    }
}

struct ChatMessage: Codable, Equatable {
    var role: String // "user" | "assistant"
    var content: ChatMessageContent

    static func user(_ text: String) -> ChatMessage {
        ChatMessage(role: "user", content: .text(text))
    }
}

struct ChatRequest: Encodable {
    var messages: [ChatMessage]
}

struct ChatResponse: Codable {
    var messages: [ChatMessage]?
    var error: String?
}

/// A single bubble's worth of derived content — one per user turn's reply,
/// same as ChatPanel.tsx's DisplayMessage: all of the assistant's text
/// blocks from this turn joined together, plus a badge per tool it used.
struct ChatDisplayMessage: Identifiable, Equatable {
    let id = UUID()
    var role: String
    var text: String
    var notes: [String]
}

enum ChatToolNote {
    /// Mirrors ChatPanel.tsx's TOOL_NOTES map — a friendly label per tool,
    /// falling back to the raw name for anything not in the table.
    static func label(for toolName: String) -> String {
        switch toolName {
        case "list_tasks": return "checked your tasks"
        case "add_task": return "added a task"
        case "schedule_task": return "booked an event"
        case "mark_task_done": return "marked a task done"
        case "list_calendar_events": return "checked your calendar"
        default: return "used \(toolName)"
        }
    }
}

/// Splits a freshly-returned message array into (the appended display
/// message, for the assistant's reply) given how many messages were sent —
/// mirrors ChatPanel.tsx's `send()` reducer exactly: only assistant messages
/// contribute (tool_result messages come back with role "user" and are
/// skipped, same as the web client).
func chatDisplayMessage(appended: [ChatMessage]) -> ChatDisplayMessage {
    var text = ""
    var notes: [String] = []
    for message in appended where message.role == "assistant" {
        guard case .blocks(let blocks) = message.content else { continue }
        for block in blocks {
            switch block {
            case .text(let t):
                text += (text.isEmpty ? "" : "\n") + t
            case .toolUse(_, let name, _):
                notes.append(ChatToolNote.label(for: name))
            default:
                break
            }
        }
    }
    return ChatDisplayMessage(role: "assistant", text: text.isEmpty ? "(no response)" : text, notes: notes)
}
