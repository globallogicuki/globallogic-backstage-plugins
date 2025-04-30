# Terraform Frontend Plugin for Backstage

You can use this plugin to display a list of terraform runs for one or more workspaces.

![Terraform Runs - Single Workspace](./docs/terraform-plugin-content.png)

![Terraform Runs - Multiple Workspaces](./docs/terraform-plugin-content-multiple.png)

## Install

```shell
yarn add @globallogicuki/backstage-plugin-terraform
```

## Setup

This plugin is designed to work in its own tab within an entity. You will need to add the `<EntityTerraformContent />` component to the entity page in the frontend app.

There is a `isTerraformAvailable` helper function and a `<EntityTerraformCard />` component available should you wish to use this within an existing tab.

Edit the `packages/app/src/components/catalog/EntityPage.tsx` and add the imports:

```typescript
import { EntityTerraformContent } from '@globallogicuki/backstage-plugin-terraform';
```

Then add the following route and component to the desired entity page:

```typescript
<EntityLayout.Route path="/terraform" title="Terraform">
  <EntityTerraformContent />
</EntityLayout.Route>
```

There are two annotations that you should add to your `catalog-info.yaml` file:

```yaml
annotations:
  terraform/organization: orgName
  terraform/workspaces: workspaceName1,workspaceName2,workspaceName3
```

You will also need to have the [terraform backend plugin](https://www.npmjs.com/package/@globallogicuki/backstage-plugin-terraform-backend) installed and running.

## Terraform Latest Run card

![Latest Run card - Single Workspace](./docs/terraform-plugin-latest-run-content.png)

![Latest Run card - Multiple Workspaces](./docs/terraform-plugin-latest-run-content-multiple.png)

This is an additional component that can be referenced with `<EntityTerraformLatestRunCard>` and imported and added to the `EntityPage.tsx` file for routing.

## Terraform Workspace Health card

![Workspace Health card - Light mode](./docs/terraform-plugin-workspace-health-light.png)

This is an additional component that can be referenced with `<EntityTerraformWorkspaceHealthAssessmentsCard>` and imported and added to the `EntityPage.tsx` file for routing from the plugin root.

Alternatively it can be referenced from within another component, using the `<TerraformWorkspaceHealthAssessments>` tag.

It will render a Health Card for each workspace defined in your `catalog-info.yaml` file, with each Health Card containing child cards for Drift Metrics and Validation Checks for a particular workspace.

### Terraform Drift Metrics

![Workspace Health card - Drift Only](./docs/terraform-plugin-workspace-health-drift-only.png)

The Drift card is visible within the Workspace Health component by default, but can be optionally hidden using the `showDrift` property on the `<TerraformWorkspaceHealthAssessments>` tag, eg:

    <TerraformWorkspaceHealthAssessments showDrift={false}>

### Terraform Validation Checks

![Workspace Health card - Validation Checks Only](./docs/terraform-plugin-workspace-health-checks-only.png)

The Validation Checks card is also visible within the Workspace Health component by default, but can be optionally hidden using the `showValidationChecks` property on the `<TerraformWorkspaceHealthAssessments>` tag, eg:

    <TerraformWorkspaceHealthAssessments showValidationChecks={false}>
