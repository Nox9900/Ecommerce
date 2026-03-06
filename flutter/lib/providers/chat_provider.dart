import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_mobile_app/core/api_client.dart';

class ChatProvider with ChangeNotifier {
  late IO.Socket socket;
  final List<Map<String, dynamic>> _messages = [];
  bool _isConnected = false;

  List<Map<String, dynamic>> get messages => List.unmodifiable(_messages);
  bool get isConnected => _isConnected;

  ChatProvider() {
    _initSocket();
  }

  void _initSocket() {
    socket = IO.io(ApiClient.baseUrl.replaceAll('/api', ''), <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.onConnect((_) {
      _isConnected = true;
      notifyListeners();
      print('Connected to socket');
    });

    socket.onDisconnect((_) {
      _isConnected = false;
      notifyListeners();
      print('Disconnected from socket');
    });

    socket.on('message', (data) {
      _messages.add(data);
      notifyListeners();
    });

    socket.connect();
  }

  void sendMessage(String text, String receiverId) {
    final message = {
      'text': text,
      'receiverId': receiverId,
      'timestamp': DateTime.now().toIso8601String(),
    };
    socket.emit('message', message);
    _messages.add(message);
    notifyListeners();
  }

  @override
  void dispose() {
    socket.dispose();
    super.dispose();
  }
}
