export interface Config {
  /**
   * Unleash configuration
   */
  unleash?: {
    /**
     * Base URL of your Unleash instance
     * @visibility backend
     */
    url: string;
    /**
     * API token for authenticating with Unleash
     * Use a Service Account token (Enterprise) or Personal Access Token
     * @visibility secret
     */
    apiToken: string;
    /**
     * Enable permission checks for Unleash operations
     * When set to false, permission checks will be bypassed (useful for development)
     * @default true
     * @visibility backend
     */
    enablePermissions?: boolean;
  };
}
