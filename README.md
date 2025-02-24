[![CI](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/ci.yml/badge.svg)](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/ci.yml) [![Coverage Report](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/testCoverage.yml/badge.svg)](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/testCoverage.yml) [![Publish](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/publish.yml/badge.svg)](https://github.com/globallogicuki/globallogic-backstage-plugins/actions/workflows/publish.yml)

# GlobalLogic [Backstage](https://backstage.io) Plugins 

This repo contains all plugins created by [GlobalLogic](https://www.globallogic.com/).

The following plugins and scaffold actions can be found in this repository:

- [Terraform Enterprise/Cloud](https://www.npmjs.com/package/@globallogicuki/backstage-plugin-terraform)
- [Terraform Enterprise/Cloud Backend](https://www.npmjs.com/package/@globallogicuki/backstage-plugin-terraform-backend)

Installation instructions for each plugin can be found in their individual README files.

## Getting Started for Local Development

Clone the repository

```sh
git clone https://github.com/globallogicuki/globallogic-backstage-plugins.git
cd globallogic-backstage-plugins
```

To run the local app, run:

```sh
yarn install
yarn dev
```

### Environment variables

There is a `app-config.local.tpl.yaml` file which you should use as the basis to create the `app-config.local.yaml` file.

You can find out more on how Backstage uses config and evironment variables [here](https://backstage.io/docs/conf/).

## License

Copyright 2024 GlobalLogic Inc. Licensed under the Apache License, Version 2.0: <http://www.apache.org/licenses/LICENSE-2.0>
