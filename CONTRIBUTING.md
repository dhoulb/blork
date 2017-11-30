# Blork: Contributing

Contributions welcome! I'm happy to receive pull requests for new checkers (e.g. if you find you're using custom checkers for things you think should be built-in). 

## Pull requests

Please follow these (obvious) guidelines:

1. Code should be fully linted with TSLint (or the PR will be automatically rejected by Travis CI)
2. Test suite must pass (or the PR will be automatically rejected by Travis CI)
3. New features should include corresponding unit tests
4. New features should include new documentation in README.md

## Technical introduction

Blork is written in Typescript, uses TSLint for linting, and Jest for unit testing. Blork is deployed to NPM through Travis CI whenever a new release is made on GitHub, which also automatically checks rejects any pull requests that fail their tests.

### Install (npm)

Clone the repo from GitHub and install dependencies with NPM.

```sh
npm install
```

### Code (you!)

Write any code you like. Don't worry too much about style as TSLint will find and correct most issues, but try to stick to what's already there where possible. Ensure all exported functions (the outer-facing edges of the module) validate their input arguments (e.g. with Blork) so the module is hardened against mistakes/misuse.

### Lint (TSLint)

Blork is linted using TSLint (which is configured to be pretty strict). TSLint will fix as many issues as it can, but any leftover linting issues must be fixed before you can build.

```sh
npm run fix
```

### Build (Typescript)

Blork is written in Typescript (in the `src/` directory) and is compiled into Javascript (in the `lib/` directory) using the `build` script. _The build script will run TSLint before it builds so any linting errors must be fixed first._

```sh
npm run build
```

### Test (Jest)

Tests are written in Jest and are in the `test/` directory. Tests are run against the compiled Javascript code so you won't be able to test your code if you have Typescript compiler errors. Run the test suite using the `test` script, which will attempt to lint and build before it runs.

```sh
npm test
```

### Commit (Git)

Jest unit tests are configured as a precommit hook (using [Husky](https://www.npmjs.com/package/husky)) so Git commits and pushes will fail if code isn't linted, won't build, or fails tests. This helps catch mistakes early (any of these failing would cause your PR to be rejected by Travis CI anyway!)