import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: const [
          ListTile(
            leading: Icon(Icons.person_outline),
            title: Text('Account Information'),
          ),
          ListTile(
            leading: Icon(Icons.lock_outline),
            title: Text('Change Password'),
          ),
          ListTile(
            leading: Icon(Icons.notifications_outlined),
            title: Text('Notification Preferences'),
          ),
          ListTile(
            leading: Icon(Icons.privacy_tip_outlined),
            title: Text('Privacy Settings'),
          ),
          
        ],
      ),
    );
  }
}
