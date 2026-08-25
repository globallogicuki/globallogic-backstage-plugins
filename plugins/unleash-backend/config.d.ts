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
     * List of environment names that can be modified via the UI
     * @visibility backend
     */
    editableEnvs?: string[];
    /**
     * Number of environments to display in the UI
     * The frontend reads this via the plugin's `GET /config` endpoint.
     * @default 4
     * @visibility backend
     */
    numEnvs?: number;
  };
}
