import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';

class DashboardTab {
  const DashboardTab({
    required this.id,
    required this.icon,
    required this.label,
    required this.title,
    this.subtitle,
    required this.child,
    this.actions = const <Widget>[],
    this.floatingActionButton,
    this.badge,
  });

  final String id;
  final IconData icon;
  final String label;
  final String title;
  final String? subtitle;
  final Widget child;
  final List<Widget> actions;
  final Widget? floatingActionButton;
  final Widget? badge;
}

class DashboardShell extends StatefulWidget {
  const DashboardShell({
    super.key,
    required this.tabs,
    this.initialIndex = 0,
    this.headerBackground,
    this.onLogout,
  }) : assert(tabs.length > 0, 'At least one tab is required');

  final List<DashboardTab> tabs;
  final int initialIndex;
  final Widget? headerBackground;
  final VoidCallback? onLogout;

  @override
  State<DashboardShell> createState() => _DashboardShellState();
}

class _DashboardShellState extends State<DashboardShell> {
  late int _selectedIndex;
  late List<Widget> _tabChildren;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    _tabChildren = widget.tabs
        .map(
          (tab) => _KeepAlivePage(
            key: PageStorageKey<String>('dashboard-tab-${tab.id}'),
            child: tab.child,
          ),
        )
        .toList();
  }

  @override
  void didUpdateWidget(covariant DashboardShell oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.tabs.length != widget.tabs.length) {
      _tabChildren = widget.tabs
          .map(
            (tab) => _KeepAlivePage(
              key: PageStorageKey<String>('dashboard-tab-${tab.id}'),
              child: tab.child,
            ),
          )
          .toList();
      if (_selectedIndex >= widget.tabs.length) {
        _selectedIndex = widget.tabs.length - 1;
      }
      return;
    }

    for (var i = 0; i < widget.tabs.length; i++) {
      if (widget.tabs[i].id != oldWidget.tabs[i].id ||
          widget.tabs[i].child != oldWidget.tabs[i].child) {
        _tabChildren[i] = _KeepAlivePage(
          key: PageStorageKey<String>('dashboard-tab-${widget.tabs[i].id}'),
          child: widget.tabs[i].child,
        );
      }
    }
    if (_selectedIndex >= widget.tabs.length) {
      _selectedIndex = widget.tabs.length - 1;
    }
  }

  void _onTabSelected(int index) {
    if (index == _selectedIndex) return;
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tabs = widget.tabs;
    final selectedTab = tabs[_selectedIndex];
    final user = context.watch<AuthProvider>().user;

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 1080;
        final isDesktop = constraints.maxWidth >= 1280;

        final content = Column(
          children: [
            _DashboardHeader(
              title: selectedTab.title,
              subtitle: selectedTab.subtitle,
              actions: selectedTab.actions,
              badge: selectedTab.badge,
              background: widget.headerBackground,
              onLogout: widget.onLogout,
              userEmail: user?.email,
              isWide: isWide,
            ),
            Expanded(
              child: Container(
                margin: EdgeInsets.only(
                  top: isWide ? 12 : 16,
                  left: isWide ? 8 : 0,
                  right: isWide ? 8 : 0,
                  bottom: isWide ? 12 : 0,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(isWide ? 24 : 0),
                  boxShadow: [
                    if (isWide)
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: _tabChildren.isEmpty
                    ? const SizedBox.shrink()
                    : IndexedStack(
                        index: _selectedIndex,
                        children: _tabChildren,
                      ),
              ),
            ),
          ],
        );

        return Scaffold(
          backgroundColor: theme.colorScheme.background,
          floatingActionButton: selectedTab.floatingActionButton,
          floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
          bottomNavigationBar: isWide
              ? null
              : NavigationBar(
                  height: 70,
                  selectedIndex: _selectedIndex,
                  onDestinationSelected: _onTabSelected,
                  destinations: [
                    for (int i = 0; i < tabs.length; i++)
                      NavigationDestination(
                        icon: Icon(tabs[i].icon),
                        label: tabs[i].label,
                      ),
                  ],
                ),
          body: SafeArea(
            bottom: !isWide,
            child: Row(
              children: [
                if (isWide)
                  _DashboardNavigationRail(
                    tabs: tabs,
                    selectedIndex: _selectedIndex,
                    onDestinationSelected: _onTabSelected,
                    extended: isDesktop,
                  ),
                Expanded(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeInOut,
                    padding: EdgeInsets.symmetric(
                      horizontal: isWide ? 16 : 16,
                      vertical: isWide ? 12 : 12,
                    ),
                    child: content,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DashboardNavigationRail extends StatelessWidget {
  const _DashboardNavigationRail({
    required this.tabs,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.extended,
  });

  final List<DashboardTab> tabs;
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final bool extended;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeInOut,
      width: extended ? 240 : 88,
      margin: const EdgeInsets.only(left: 8, top: 12, bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: NavigationRail(
        selectedIndex: selectedIndex,
        extended: extended,
        onDestinationSelected: onDestinationSelected,
        backgroundColor: Colors.white,
        indicatorColor: theme.colorScheme.primary.withOpacity(0.12),
        useIndicator: true,
        destinations: [
          for (final tab in tabs)
            NavigationRailDestination(
              icon: Icon(tab.icon, color: theme.iconTheme.color?.withOpacity(0.7)),
              selectedIcon: Icon(tab.icon, color: theme.colorScheme.primary),
              label: Text(tab.label),
            ),
        ],
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  const _DashboardHeader({
    required this.title,
    this.subtitle,
    required this.actions,
    required this.badge,
    this.background,
    required this.onLogout,
    required this.userEmail,
    required this.isWide,
  });

  final String title;
  final String? subtitle;
  final List<Widget> actions;
  final Widget? badge;
  final Widget? background;
  final VoidCallback? onLogout;
  final String? userEmail;
  final bool isWide;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final email = userEmail ?? 'Guest user';

    final header = Container(
      padding: EdgeInsets.symmetric(
        horizontal: isWide ? 24 : 16,
        vertical: isWide ? 24 : 16,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(isWide ? 24 : 18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        title,
                        style: textTheme.headlineSmall?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    if (badge != null) ...[
                      const SizedBox(width: 12),
                      badge!,
                    ],
                  ],
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    subtitle!,
                    style: textTheme.bodyMedium?.copyWith(
                      color: textTheme.bodyMedium?.color?.withOpacity(0.8),
                    ),
                  ),
                ],
                const SizedBox(height: 18),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.16),
                      child: Text(
                        email.isNotEmpty ? email[0].toUpperCase() : '?',
                        style: textTheme.titleMedium?.copyWith(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            email,
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'You are viewing personalised data synced with the latest backend updates.',
                            style: textTheme.bodySmall?.copyWith(
                              color: textTheme.bodySmall?.color?.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ...actions,
                  if (onLogout != null)
                    FilledButton.icon(
                      onPressed: onLogout,
                      icon: const Icon(Icons.logout_rounded, size: 18),
                      label: const Text('Log out'),
                      style: FilledButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 18),
              if (background != null) background!,
            ],
          ),
        ],
      ),
    );

    return header;
  }
}

class _KeepAlivePage extends StatefulWidget {
  const _KeepAlivePage({super.key, required this.child});

  final Widget child;

  @override
  State<_KeepAlivePage> createState() => _KeepAlivePageState();
}

class _KeepAlivePageState extends State<_KeepAlivePage> with AutomaticKeepAliveClientMixin {
  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }

  @override
  bool get wantKeepAlive => true;
}
