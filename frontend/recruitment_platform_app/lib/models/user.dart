class User {
  final int id;
  final String email;
  final List<String> roles;

  User({required this.id, required this.email, required this.roles});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      roles: List<String>.from(json['roles']),
    );
  }

  bool hasRole(String role) {
    return roles.contains(role);
  }
}
