# Contributing Guidelines

We welcome issues or pull requests. Before opening an issue, we ask that you
first briefly look through the [open issues][issues] for any duplicate
or related issues.

[issues]: https://github.com/Vessel9817/onion-site-template/issues

## Development

Below are descriptions of internal tools and mechanisms that may assist
development.

### Tests

Unit and integration tests run directly in Node. They need no containers,
network access or database:

```shell
# Test every workspace
npm test

# Same, with a coverage report
npm run test:coverage
```

A single workspace can be tested on its own:

```shell
npm test --workspace=./src/express
```

Separately, a smoke test builds the compose project, generates a throwaway
onion address and waits for tor to confirm the site answers over it.
Tor joins only a private Tor network that the test starts in a container,
so the address is never published. It may take several minutes.

> [!WARNING]
> Never run a smoke test on a configured deployment, always on a throwaway
> checkout. This overwrites any secret with example credentials, so it refuses
> to run once a configured `.env` file exists, or while any container or
> network of the `website` compose project exists. The second command below
> removes the containers, networks and volumes a smoke test leaves behind,
> and would delete a deployment's volumes just the same.

```shell
npm run test:smoke:start

# If successful, do some stuff on the test network

npm run test:smoke:stop
```

### Dependencies

Dependabot updates npm packages in the root `package-lock.json`.
Renovate updates base images, GitHub Actions and the other pinned versions.

The express and mongo images install from their workspace's own
`package-lock.json`, which Dependabot version updates leave alone.
After any change to the root lockfile, copy its versions into the workspace
lockfiles:

```shell
# Lists workspace lockfile entries that differ from the root
npm run workspaces

# Rewrites them from the root lockfile
npm run workspaces:fix
```

On a Dependabot pull request, check out its branch, run the second command
and push the result. If a workspace lockfile holds a newer version than the
root, as after a security update to that lockfile only, the command leaves it
unchanged and says how to update the root first.

CI also runs `npm ls --all --package-lock-only`, because `npm ci` accepts a
root lockfile whose versions break a dependency's range. If it reports an
invalid dependency, copy the entry npm expects from a workspace lockfile that
has it, then run the fix above. `npm dedupe --package-lock-only` also clears
it, but can move or lower unrelated versions, which the fix may then refuse.

> [!WARNING]
> Run npm commands that change dependencies from the project root,
> e.g, `npm install -w ./src/mongo dotenv@latest`. Inside a workspace,
> npm updates the root lockfile rather than the workspace's own, unless given
> `--workspaces=false` on the command line.

### ESLint

A code linter. Used to prettify code, ensuring teams conform to the same
stylistic standards. Also used to address potential errors, such as
[the many edge cases of JavaScript][wtfjs] that make the language infamous
for being initially built on hasty designs.

Usage:

```shell
# Displays linting issues
npm run eslint

# Fixes linting issues, displaying any requiring manual fixing
npm run eslint:fix
```

[wtfjs]: https://github.com/denysdovhan/wtfjs
