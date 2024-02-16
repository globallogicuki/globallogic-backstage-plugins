# How to release packages

Ensure that the pull request contains a created changeset using the command:

```shell
yarn changeset
```

If the changes do not require a release, you can run the following to generate an empty changeset:

```shell
yarn changeset --empty
```

Once this PR is merged, the Publish workflow will run and create a new PR titled `Version Packages`. This will be kept up to date by the workflow for every new changeset merged to the `main` branch.

To create a new release and publish a new version of any packages, you must merge this PR into `main`.

Once the Publish workflow has run again, the new version will be available on NPM.
