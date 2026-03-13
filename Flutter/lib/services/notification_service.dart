import 'package:flutter_mobile_app/core/api_client.dart';
import 'package:flutter_mobile_app/core/api_result.dart';
import 'package:flutter_mobile_app/models/notification.dart';

class NotificationService {
  final ApiClient _apiClient;

  NotificationService(this._apiClient);

  Future<ApiResult<List<AppNotification>>> getNotifications() async {
    return _apiClient.get<List<AppNotification>>(
      '/notifications',
      fromJson: (data) {
        if (data is List) {
          return data.map((n) => AppNotification.fromJson(n)).toList();
        }
        if (data is Map && data['notifications'] != null) {
          return (data['notifications'] as List)
              .map((n) => AppNotification.fromJson(n))
              .toList();
        }
        return [];
      },
    );
  }

  Future<ApiResult<int>> getUnreadCount() async {
    return _apiClient.get<int>(
      '/notifications/unread',
      fromJson: (data) {
        if (data is Map) return data['count'] ?? 0;
        return 0;
      },
    );
  }

  Future<ApiResult<void>> markAsRead(String notificationId) async {
    return _apiClient.put<void>(
      '/notifications/$notificationId/read',
      fromJson: (_) {},
    );
  }

  Future<ApiResult<void>> markAllAsRead() async {
    return _apiClient.put<void>(
      '/notifications/read-all',
      fromJson: (_) {},
    );
  }
}
