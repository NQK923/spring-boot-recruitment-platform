class CompanyUser {
  final int userId;
  final String? email;
  final String role;

  CompanyUser({
    required this.userId,
    this.email,
    required this.role,
  });

  factory CompanyUser.fromJson(Map<String, dynamic> json) {
    return CompanyUser(
      userId: json['userId'],
      email: json['email'],
      role: json['role'],
    );
  }
}
