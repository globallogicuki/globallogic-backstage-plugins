export interface Config {
  integrations?: {
    terraform?: {
      /**
       * Optional, the web origin of your Terraform Cloud/Enterprise instance
       * (e.g. https://tfe.enterprise.com), used to build links to the
       * Terraform web UI.
       * Defaults to https://app.terraform.io
       * @visibility frontend
       */
      baseUrl?: string;
    };
  };
}
