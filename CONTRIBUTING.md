# Contributing to the [GlobalLogic](https://www.globallogic.com/) Backstage Plugins Project

We want to create strong community of contributors -- all working together to create the kind of delightful experience that Backstage deserves.

Contributions are welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given. ❤️

In general, we aim to stick as closely as possible to the [contribution guidelines which apply to the Backstage project](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md). If something is not covered in this document, please assume that the appropriate Backstage guideline will apply.

## Types of Contributions

This repository will gather the plugins we have worked on, so contribution is more than welcome both in this repository in general, and in a scope of a particular plugin.

### Report bugs

No one likes bugs. Report bugs as an issue [here](https://github.com/globallogicuki/globallogic-backstage-plugins/issues/new?assignees=&labels=bug&template=bug_template.md).

### Fix bugs or build new features

Look through the [GitHub issues](https://github.com/globallogicuki/globallogic-backstage-plugins/issues) for bugs or problems that other users are having. If you're having a problem yourself, feel free to contribute a fix for us to review.

### Submit feedback

The best way to send feedback is to file [an issue](https://github.com/globallogicuki/globallogic-backstage-plugins/issues/new).

If you are proposing a feature:

- Explain in detail how it would work.
- Explain the wider context about what you are trying to achieve.
- Keep the scope as narrow as possible, to make it easier to implement.
- Remember that this is a volunteer-driven project, and that contributions are welcome :)

## Get Started!

Start by reading the repository [README](./README.md) to get set up for local development.

## Coding Guidelines

We use the backstage-cli to build, serve, lint, test and package all the plugins.

As such, the [same coding guidelines as in Backstage repository mostly apply](https://github.com/backstage/backstage/blob/master/CONTRIBUTING.md#coding-guidelines).

## Creating Changesets

We use [changesets](https://github.com/atlassian/changesets) in order to prepare releases. To make the process of generating releases easy, please include changesets with your pull request. This will result in every package affected by a change getting a proper version number and an entry in its `CHANGELOG.md.

### When to use a changeset?

Any time a patch, minor, or major change aligning to [Semantic Versioning](https://semver.org) is made to any published package in `plugins/`, a changeset should be used.

In general, changesets are not needed for the documentation, build utilities or similar.

### How to create a changeset

1. Run `yarn changeset`
2. Select which packages you want to include a changeset for
3. Select impact of the change you're introducing. If the package you are changing is at version 0.x, use minor for breaking changes and patch otherwise. If the package is at 1.0.0 or higher, use major for breaking changes, minor for backwards compatible API changes, and patch otherwise. See the [Semantic Versioning specification](https://semver.org/#semantic-versioning-specification-semver) for more details.
4. Explain your changes in the generated changeset. See [examples of well written changesets](https://backstage.io/docs/getting-started/contributors#writing-changesets).
5. Add generated changeset to Git
6. Push the commit with your changeset to the branch associated with your PR

For more information, checkout [adding a changeset](https://github.com/atlassian/changesets/blob/master/docs/adding-a-changeset.md) documentation in the changesets repository.

## Releasing Plugins and Packages

Please include changeset files your pull requests if you would like them to be released. To create a changeset file run `yarn changeset` and commit the resulting file to the pull request.

After merging a changeset file to main, a subsequent pull request is created automatically that makes the actual version bumps of the plugins/packages based on the changeset files. When this pull request is merged, the plugins and packages are automatically published to npm.

## Code of Conduct

We subscribe to the [Spotify FOSS code of conduct](https://github.com/backstage/backstage/blob/master/CODE_OF_CONDUCT.md) which is used by the Backstage project.
