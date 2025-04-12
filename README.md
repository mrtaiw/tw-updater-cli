# TW Updater CLI

A simple CLI tool for updating the Expo app.

## 📦 Installation

You can install the package globally using npm:

```bash
    npm install -g tw-updater-cli
```

## ⬆️ Usage

Before pushing updates, you need to log in:

```bash
tw-updater login
```

If you're using multiple profiles, you can specify one:

```bash
tw-updater login --profile your-profile
```

Once logged in, you can publish a new version update:

```bash
tw-updater update --note "Update notes" --platform "all" --account your-profile
```

## ✨ Contributing

Feel free to open an [issue](https://github.com/mrtaiw/tw-updater-cli/issues) or submit a pull request if you'd like to contribute or report a bug.
