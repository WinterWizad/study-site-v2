/**
 * Simple Hash-Based Router
 * Handles navigation without page reloads
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentParams = {};
    this.listeners = new Set();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('load', () => this.handleHashChange());
  }

  /**
   * Register a route with a handler
   * @param {string} pattern - Route pattern (e.g., '/subject/:subjectId')
   * @param {Function} handler - Function to call when route matches
   */
  addRoute(pattern, handler) {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\//g, '\\/')
      .replace(/:([^/]+)/g, '([^/]+)');
    const regex = new RegExp(`^${regexPattern}$`);

    this.routes.set(pattern, {
      pattern,
      regex,
      handler,
      paramNames: (pattern.match(/:([^/]+)/g) || []).map(p => p.slice(1))
    });
  }

  /**
   * Navigate to a route
   * @param {string} path - Path to navigate to (e.g., '#/subject/bi')
   */
  navigate(path) {
    if (!path.startsWith('#')) path = '#' + path;
    window.location.hash = path;
  }

  /**
   * Get current route info
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Get current route parameters
   */
  getParams() {
    return { ...this.currentParams };
  }

  /**
   * Subscribe to route changes
   * @param {Function} listener - Called with (route, params) on change
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Handle hash change event
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    console.log('[Router] Hash changed:', hash);
    this.matchRoute(hash);
  }

  /**
   * Match current hash to a route
   */
  matchRoute(hash) {
    console.log('[Router] Matching route for:', hash, 'Routes:', Array.from(this.routes.keys()));
    // Try exact matches first
    for (const [pattern, route] of this.routes) {
      const match = hash.match(route.regex);
      if (match) {
        console.log('[Router] Matched route:', pattern);
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });

        this.currentRoute = route;
        this.currentParams = params;

        // Notify listeners
        this.listeners.forEach(listener => listener(route, params));

        // Call handler
        try {
          route.handler(params);
        } catch (error) {
          console.error('Route handler error:', error);
        }
        return;
      }
    }

    // No match - redirect to home
    console.warn('No route matched:', hash);
    this.navigate('/');
  }

  /**
   * Generate URL for a route with parameters
   * @param {string} pattern - Route pattern
   * @param {Object} params - Parameters to insert
   * @returns {string} Full URL with hash
   */
  generateUrl(pattern, params = {}) {
    let url = pattern;
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
    return '#' + url;
  }
}

// Create singleton instance
const router = new Router();

export default router;