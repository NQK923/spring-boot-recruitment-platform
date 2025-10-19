class OAuthConfig {
  final String googleClientId;
  final String githubClientId;
  final String githubRedirectUri;
  final String githubAuthorizeRedirectUri;

  const OAuthConfig({
    required this.googleClientId,
    required this.githubClientId,
    required this.githubRedirectUri,
    required this.githubAuthorizeRedirectUri,
  });

  bool get hasGoogleClientId => googleClientId.isNotEmpty;
  bool get hasGitHubClientId => githubClientId.isNotEmpty;
  bool get hasGitHubRedirect => githubRedirectUri.isNotEmpty;
  bool get hasGitHubAuthorizeRedirect => githubAuthorizeRedirectUri.isNotEmpty;

  factory OAuthConfig.fromJson(Map<String, dynamic> json) {
    return OAuthConfig(
      googleClientId: (json['googleClientId'] as String?)?.trim() ?? '',
      githubClientId: (json['githubClientId'] as String?)?.trim() ?? '',
      githubRedirectUri: (json['githubRedirectUri'] as String?)?.trim() ?? '',
      githubAuthorizeRedirectUri: (json['githubAuthorizeRedirectUri'] as String?)?.trim() ?? '',
    );
  }
}
