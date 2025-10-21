class Company {
  final int id;
  final String name;
  final String? description;
  final String? website;
  final String? logoUrl;

  Company({
    required this.id,
    required this.name,
    this.description,
    this.website,
    this.logoUrl,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      website: json['website'],
      logoUrl: json['logoUrl'],
    );
  }
}
