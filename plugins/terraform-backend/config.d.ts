export interface Config {
  integrations: {
    terraform: {
      /**
       * Terraform Cloud/Enterprise token
       * @visibility secret
       */
      token: string;
      /**
       * Optional, the web origin of your Terraform Cloud/Enterprise instance
       * (e.g. https://tfe.enterprise.com). The backend derives the API root by
       * appending /api/v2; for backwards compatibility a value already ending
       * in /api/v2 is used as-is.
       * Defaults to https://app.terraform.io
       */
      baseUrl?: string;
      /**
       * Optional, the number of runs fetched per page from the Terraform API.
       * Defaults to 20
       */
      pageSize?: number;
    };
  };
}
