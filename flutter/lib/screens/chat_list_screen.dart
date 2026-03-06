import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_mobile_app/providers/chat_provider.dart';
import 'package:flutter_mobile_app/core/theme.dart';
import 'package:flutter_mobile_app/screens/chat_screen.dart';

class ChatListScreen extends StatelessWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Consumer<ChatProvider>(
        builder: (context, chat, child) {
          // This would normally fetch from an API, but for now we list conversations
          // Mock data for illustration
          final conversations = [
            {'id': '1', 'name': 'Support Team', 'lastMessage': 'How can we help you?', 'time': '10:30 AM'},
            {'id': '2', 'name': 'Vendor A', 'lastMessage': 'Your order has been shipped', 'time': 'Yesterday'},
          ];

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: conversations.length,
            separatorBuilder: (context, index) => const Divider(),
            itemBuilder: (context, index) {
              final conversation = conversations[index];
              return ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primaryDefault.withOpacity(0.1),
                  child: Text(conversation['name']![0]),
                ),
                title: Text(conversation['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(conversation['lastMessage']!, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: Text(conversation['time']!, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ChatScreen(
                        receiverId: conversation['id']!,
                        receiverName: conversation['name']!,
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
