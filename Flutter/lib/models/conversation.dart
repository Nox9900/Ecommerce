class Conversation {
  final String id;
  final List<ConversationParticipant> participants;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.participants,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['_id'] ?? '',
      participants: (json['participants'] as List? ?? [])
          .map((p) => ConversationParticipant.fromJson(p is String ? {'_id': p} : p))
          .toList(),
      lastMessage: json['lastMessage'],
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.tryParse(json['lastMessageAt'])
          : null,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}

class ConversationParticipant {
  final String id;
  final String? name;
  final String? imageUrl;

  ConversationParticipant({
    required this.id,
    this.name,
    this.imageUrl,
  });

  factory ConversationParticipant.fromJson(Map<String, dynamic> json) {
    return ConversationParticipant(
      id: json['_id'] ?? '',
      name: json['name'],
      imageUrl: json['imageUrl'],
    );
  }
}

class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final List<String> attachments;
  final List<String> readBy;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.attachments = const [],
    this.readBy = const [],
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['_id'] ?? '',
      conversationId: json['conversationId'] is String
          ? json['conversationId']
          : (json['conversationId']?['_id'] ?? ''),
      senderId: json['sender'] is String
          ? json['sender']
          : (json['sender']?['_id'] ?? ''),
      content: json['content'] ?? '',
      attachments: json['attachments'] != null
          ? List<String>.from(json['attachments'])
          : [],
      readBy: json['readBy'] != null
          ? List<String>.from(json['readBy'])
          : [],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
