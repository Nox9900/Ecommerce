class HeroBanner {
  final int id;
  final String title;
  final String? image;
  final String? link;
  final int order;
  final bool isActive;

  HeroBanner({
    required this.id,
    required this.title,
    this.image,
    this.link,
    this.order = 0,
    this.isActive = true,
  });

  factory HeroBanner.fromJson(Map<String, dynamic> json) {
    return HeroBanner(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      image: json['image'],
      link: json['link'],
      order: json['order'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }
}
