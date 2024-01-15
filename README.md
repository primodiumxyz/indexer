# Primodium: MUD State Tools

Set of tools for reading data in MUD compliant projects.

## Getting Started

### Requirements

- Docker

To start a local indexer on foundry chain run:

```bash
pnpm indexer:local
```

To properly remove docker networks and volumes run:

```bash
pnpm indexer:clean
```

**Note: crtl+c will only send termination signal to containers. It is recommended to run this time to time**

# Packages

## `@primodiumxyz/pg-indexer-read`

Modified MUD indexer reader that supports both encoded and decoded reads. Includes a new api to read decoded records with _ORM-like_ syntax.

[README](/packages/pg-indexer-reader/README.md) for more info.

## `@primodiumxyz/sync-stack`

Modularized sync-stack heavily based on Lattice's MUD sync-store to easily build reusable sync pipelines that require writing and reading from multiple sources.

[README](/packages/sync-stack/README.md) for more info.
