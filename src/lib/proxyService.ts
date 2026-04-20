import { ProxySettings, store } from '../store/store';

/**
 * Proxy Service
 * Handles application-level proxy logic.
 * Note: Browser environments have strict security limits on outbound traffic routing.
 * This implementation provides a hook for future server-side proxy integration or
 * API prefixing.
 */

class ProxyService {
  private settings: ProxySettings;

  constructor() {
    this.settings = store.getProxySettings();
    
    // Listen for changes
    window.addEventListener('proxyChanged', (e: any) => {
      this.settings = e.detail;
      console.log(`[PROXY_SVC]: Updated settings. Enabled: ${this.settings.isEnabled}`);
    });
  }

  /**
   * Mock test to verify proxy connection
   */
  async testConnection(settings?: ProxySettings): Promise<boolean> {
    const s = settings || this.settings;
    if (!s.host || !s.port) return false;

    return new Promise((resolve) => {
      // Simulation of a ping/connection attempt
      setTimeout(() => {
        // Randomly succeed for demo effect or check if host is valid format
        const isValid = s.host.length > 5 && !isNaN(parseInt(s.port));
        resolve(isValid);
      }, 1500);
    });
  }

  /**
   * Wraps a URL if proxy is enabled.
   * In a real full-stack setup, this might route through a backend proxy endpoint.
   */
  wrapUrl(url: string): string {
    if (!this.settings.isEnabled) return url;
    
    // Logic to route through a proxy (e.g., prefixing with a proxy server URL)
    // For now, we log the interception
    console.log(`[PROXY_INT]: Routing request to ${url} through ${this.settings.protocol}://${this.settings.host}:${this.settings.port}`);
    return url;
  }
}

export const proxyService = new ProxyService();
