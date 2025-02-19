export interface Config {
    integrations: {
        terraform: {
            /**
             * Terraform Cloud/Enterprise token
             */
            token: string;
            /**
             * Optional, for using a custom API endpoint for Terraform Enterprise
             * Defaults to https://app.terraform.io/api/v2
             */
            baseUrl?: string;
        }
    }
}