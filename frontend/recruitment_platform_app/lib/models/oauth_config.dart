class OAuthConfig {
  final String googleClientId;
  final String githubClientId;
  final String githubRedirectUri;

  const OAuthConfig({
    required this.googleClientId,
    required this.githubClientId,
    required this.githubRedirectUri,
  });

  bool get hasGoogleClientId => googleClientId.isNotEmpty;
  bool get hasGitHubClientId => githubClientId.isNotEmpty;
  bool get hasGitHubRedirect => githubRedirectUri.isNotEmpty;

  factory OAuthConfig.fromJson(Map<String, dynamic> json) {
    return OAuthConfig(
      googleClientId: (json['googleClientId'] as String?)?.trim() ?? '',
      githubClientId: (json['githubClientId'] as String?)?.trim() ?? '',
      githubRedirectUri: (json['githubRedirectUri'] as String?)?.trim() ?? '',
    );
  }
}
