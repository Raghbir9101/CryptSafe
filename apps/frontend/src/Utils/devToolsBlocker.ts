export class DevToolsBlocker {
  private static instance: DevToolsBlocker;
  private isEnabled: boolean = false;

  private constructor() {}

  static getInstance(): DevToolsBlocker {
    if (!DevToolsBlocker.instance) {
      DevToolsBlocker.instance = new DevToolsBlocker();
    }
    return DevToolsBlocker.instance;
  }

  enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.blockKeyboardShortcuts();
    this.blockContextMenu();
    this.blockConsoleMethods();
    this.blockEvalAndFunction();
    this.blockSourceView();
    this.blockBrowserMenuAccess();
  }

  disable(): void {
    this.isEnabled = false;
    // Note: Some protections cannot be easily disabled once applied
  }

  private blockKeyboardShortcuts(): void {
    const shortcuts = [
      { key: 'F12', description: 'F12 key' },
      { key: 'I', ctrl: true, shift: true, description: 'Ctrl+Shift+I' },
      { key: 'J', ctrl: true, shift: true, description: 'Ctrl+Shift+J' },
      { key: 'C', ctrl: true, shift: true, description: 'Ctrl+Shift+C' },
      { key: 'E', ctrl: true, shift: true, description: 'Ctrl+Shift+E' },
      { key: 'u', ctrl: true, description: 'Ctrl+U (View Source)' },
    ];

    document.addEventListener('keydown', (e) => {
      // Skip if key is undefined or null
      if (!e.key) return;
      
      for (const shortcut of shortcuts) {
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!shortcut.ctrl || (e.ctrlKey || e.metaKey)) &&
          (!shortcut.shift || e.shiftKey)
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.handleDevToolsAttempt(shortcut.description);
          return false;
        }
      }
    }, true);
  }

  private blockContextMenu(): void {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleDevToolsAttempt('Right-click context menu');
      return false;
    }, true);
  }

  private blockConsoleMethods(): void {
    const methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];

    const noop = () => {};
    methods.forEach((method) => {
      try {
        (console as any)[method] = noop;
      } catch (e) {
        // Ignore errors
      }
    });
  }

  private blockEvalAndFunction(): void {
    const noop = () => {};
    
    try {
      // Block eval
      window.eval = noop;
      
      // Block Function constructor
      (window as any).Function = noop;
      
      // Block setTimeout with string
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = function(handler: any, timeout?: number, ...args: any[]) {
        if (typeof handler === 'string') {
          return originalSetTimeout(noop, timeout, ...args);
        }
        return originalSetTimeout(handler, timeout, ...args);
      } as typeof setTimeout;
      
      // Block setInterval with string
      const originalSetInterval = window.setInterval;
      window.setInterval = function(handler: any, timeout?: number, ...args: any[]) {
        if (typeof handler === 'string') {
          return originalSetInterval(noop, timeout, ...args);
        }
        return originalSetInterval(handler, timeout, ...args);
      } as typeof setInterval;
    } catch (e) {
      // Ignore errors
    }
  }

  private blockSourceView(): void {
    // Additional protection against view source
    document.addEventListener('keydown', (e) => {
      // Skip if key is undefined or null
      if (!e.key) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        this.handleDevToolsAttempt('View Source');
        return false;
      }
    }, true);
  }

  private blockBrowserMenuAccess(): void {
    // Block access to browser menu items that could lead to dev tools
    // This is more limited but we can try to detect some patterns
    
    // Block attempts to access browser menu via keyboard
    document.addEventListener('keydown', (e) => {
      // Skip if key is undefined or null
      if (!e.key) return;
      
      // Alt key combinations that might open browser menus
      if (e.altKey) {
        // Block Alt+F (File menu in some browsers)
        if (e.key === 'F') {
          e.preventDefault();
          e.stopPropagation();
          this.handleDevToolsAttempt('Browser menu access');
          return false;
        }
        // Block Alt+T (Tools menu in some browsers)
        if (e.key === 'T') {
          e.preventDefault();
          e.stopPropagation();
          this.handleDevToolsAttempt('Browser menu access');
          return false;
        }
      }
    }, true);

    // Try to detect when dev tools are opened via browser menu
    // This is limited but can catch some cases
    let devToolsOpened = false;
    
    const checkDevTools = () => {
      if (!this.isEnabled) return;
      
      // Check if dev tools are likely open by looking for specific elements
      // This is not 100% reliable but can catch some cases
      const devToolsSelectors = [
        '#devtools', 
        '.devtools', 
        '[data-devtools]',
        'iframe[src*="devtools"]',
        'iframe[src*="chrome-devtools"]'
      ];
      
      for (const selector of devToolsSelectors) {
        if (document.querySelector(selector)) {
          if (!devToolsOpened) {
            devToolsOpened = true;
            this.handleDevToolsDetected();
          }
          break;
        }
      }
      
      // Check for common dev tools window names
      if (window.name && window.name.includes('devtools')) {
        if (!devToolsOpened) {
          devToolsOpened = true;
          this.handleDevToolsDetected();
        }
      }
    };

    // Check periodically for dev tools
    setInterval(checkDevTools, 1000);
  }

  private handleDevToolsAttempt(method: string): void {
    console.warn(`Developer tools access blocked: ${method}`);
    
    // You can add custom handling here:
    // - Show a warning message
    // - Log the attempt
    // - Redirect the user
    // - Disable certain features temporarily
    
    // Example: Show a toast notification
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast({
        title: "Access Denied",
        description: "Developer tools are not allowed in this application.",
        variant: "destructive"
      });
    }
  }

  private handleDevToolsDetected(): void {
    console.warn('Developer tools detected!');
    
    // You can add custom handling here:
    // - Redirect to a warning page
    // - Disable application functionality
    // - Log the incident
    // - Show a modal warning
    
    // Example: Redirect to home page
    // window.location.href = '/';
    
    // Example: Show a modal
    if (typeof window !== 'undefined' && (window as any).showDevToolsWarning) {
      (window as any).showDevToolsWarning();
    }
  }
}

// Export a singleton instance
export const devToolsBlocker = DevToolsBlocker.getInstance();

// Export a simple function to enable protection
export const enableDevToolsProtection = () => {
  devToolsBlocker.enable();
};

// Export a function to disable protection
export const disableDevToolsProtection = () => {
  devToolsBlocker.disable();
}; 