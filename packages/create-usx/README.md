# create-usx

[![npm version](https://img.shields.io/npm/v/create-usx.svg)](https://www.npmjs.com/package/create-usx)

## Scaffolding Your First Userscript Project

> **Compatibility Note:**
> USX requires [Node.js](https://nodejs.org/en/) version 18+, 20+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

With NPM:

```bash
$ npm create usx@latest
```

With Yarn:

```bash
$ yarn create usx
```

With PNPM:

```bash
$ pnpm create usx
```

With Bun:

```bash
$ bun create usx
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use via additional command line options. For example, to scaffold a userscript project with the basic template, run:

```bash
# npm 7+, extra double-dash is needed:
npm create usx@latest my-userscript -- --template basic

# yarn
yarn create usx my-userscript --template basic

# pnpm
pnpm create usx my-userscript --template basic

# bun
bun create usx my-userscript --template basic
```

Currently supported template preset is:

- `basic`

You can use `.` for the project name to scaffold in the current directory.
