import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/conversation.dart';

class ChatService {
  final ApiClient _apiClient;

  ChatService(this._apiClient);

  Future<ApiResult<List<Conversation>>> getConversations() async {
    return _apiClient.get<List<Conversation>>(
      '/chats',
      fromJson: (data) {
        if (data is List) {
          return data.map((c) => Conversation.fromJson(c)).toList();
        }
        return [];
      },
    );
  }

  Future<ApiResult<int>> getUnreadCount() async {
    return _apiClient.get<int>(
      '/chats/unread-count',
      fromJson: (data) {
        if (data is Map) return data['count'] ?? 0;
        return 0;
      },
    );
  }

  Future<ApiResult<void>> markConversationAsRead(String conversationId) async {
    return _apiClient.put<void>(
      '/chats/$conversationId/read',
      fromJson: (_) {},
    );
  }

  Future<ApiResult<List<ChatMessage>>> getMessages(String conversationId) async {
    return _apiClient.get<List<ChatMessage>>(
      '/chats/$conversationId/messages',
      fromJson: (data) {
        if (data is List) {
          return data.map((m) => ChatMessage.fromJson(m)).toList();
        }
        return [];
      },
    );
  }

  Future<ApiResult<Conversation>> startConversation(String participantId) async {
    return _apiClient.post<Conversation>(
      '/chats',
      data: {'participantId': participantId},
      fromJson: (data) => Conversation.fromJson(data),
    );
  }

  /// Sends a message. File attachments require multipart; text-only uses JSON.
  Future<ApiResult<ChatMessage>> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    return _apiClient.post<ChatMessage>(
      '/chats/message',
      data: {
        'conversationId': conversationId,
        'content': content,
      },
      fromJson: (data) => ChatMessage.fromJson(data),
    );
  }
}
