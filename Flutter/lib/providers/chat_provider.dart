import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/env.dart';
import 'package:flutter_mobile_app/models/conversation.dart';
import 'package:flutter_mobile_app/services/chat_service.dart';

class ChatProvider with ChangeNotifier {
  IO.Socket? _socket;
  ChatService? _chatService;
  String? _userId;

  List<Conversation> _conversations = [];
  final Map<String, List<ChatMessage>> _messagesByConversation = {};
  int _unreadCount = 0;
  bool _isConnected = false;
  bool _isLoading = false;
  String? _error;

  List<Conversation> get conversations => _conversations;
  int get unreadCount => _unreadCount;
  bool get isConnected => _isConnected;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<ChatMessage> getMessages(String conversationId) {
    return _messagesByConversation[conversationId] ?? [];
  }

  void init(ApiClient apiClient, {required String? token, String? userId}) {
    _chatService = ChatService(apiClient);
    _userId = userId;
    if (token != null) {
      _connectSocket(token);
      fetchConversations();
      fetchUnreadCount();
    }
  }

  void _connectSocket(String token) {
    _socket?.dispose();
    _socket = IO.io(Env.socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token},
    });

    _socket!.onConnect((_) {
      _isConnected = true;
      if (_userId != null) {
        _socket!.emit('joinUser', _userId);
      }
      notifyListeners();
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      notifyListeners();
    });

    _socket!.on('message', (data) {
      if (data is Map<String, dynamic>) {
        final message = ChatMessage.fromJson(data);
        _messagesByConversation.putIfAbsent(message.conversationId, () => []);
        _messagesByConversation[message.conversationId]!.add(message);
        notifyListeners();
      }
    });

    _socket!.on('notification:new', (data) {
      _unreadCount++;
      notifyListeners();
    });

    _socket!.connect();
  }

  Future<void> fetchConversations() async {
    if (_chatService == null) return;

    _isLoading = true;
    notifyListeners();

    final result = await _chatService!.getConversations();
    if (result.isSuccess && result.data != null) {
      _conversations = result.data!;
    } else {
      _error = result.error;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchUnreadCount() async {
    if (_chatService == null) return;

    final result = await _chatService!.getUnreadCount();
    if (result.isSuccess && result.data != null) {
      _unreadCount = result.data!;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(String conversationId) async {
    if (_chatService == null) return;

    _isLoading = true;
    notifyListeners();

    final result = await _chatService!.getMessages(conversationId);
    if (result.isSuccess && result.data != null) {
      _messagesByConversation[conversationId] = result.data!;
    } else {
      _error = result.error;
    }

    _isLoading = false;
    notifyListeners();
  }

  void joinConversation(String conversationId) {
    _socket?.emit('joinConversation', conversationId);
  }

  Future<void> sendMessage(String conversationId, String content) async {
    if (_chatService == null) return;

    final result = await _chatService!.sendMessage(
      conversationId: conversationId,
      content: content,
    );

    if (result.isSuccess && result.data != null) {
      _messagesByConversation.putIfAbsent(conversationId, () => []);
      _messagesByConversation[conversationId]!.add(result.data!);
      notifyListeners();
    } else {
      _error = result.error;
      notifyListeners();
    }
  }

  Future<void> markConversationAsRead(String conversationId) async {
    if (_chatService == null) return;
    await _chatService!.markConversationAsRead(conversationId);
    await fetchUnreadCount();
  }

  Future<Conversation?> startConversation(String participantId) async {
    if (_chatService == null) return null;

    final result = await _chatService!.startConversation(participantId);
    if (result.isSuccess && result.data != null) {
      _conversations.insert(0, result.data!);
      notifyListeners();
      return result.data;
    }
    _error = result.error;
    notifyListeners();
    return null;
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _conversations = [];
    _messagesByConversation.clear();
    _unreadCount = 0;
    notifyListeners();
  }

  @override
  void dispose() {
    _socket?.dispose();
    super.dispose();
  }
}
