# simple-vmix-switcher-electron

Simple vMix switcher app built with [ElectronJS](https://electronjs.org). ElectronJS is a cross-platform framework allowing the app to be built for each Windows, Mac or Linux. See the Releases tab for a direct download of the app.

The app is oriented for touch use.

You are free to clone the repository to develop your own app based in this code.

![Simple vMix Switcher Electron](./readme_assets/overview_030.png "Application overview")

# Feature summary
 - Traditional preview and program row including 'tally' - 8 inputs
 - Shows badges (tally) on input in overlay channel preview/program
 - Long touch on input in program row enables input to be put into an overlay channel
 - Shortcut: `Ctrl+Shift+P` (Win+Linux) / `Cmd+Alt+P` (Mac) to swap Preview and Program row order
 - Transitions row: Cut and Quick Play + 4 defined transitions in vMix
 - Transition progress (seen between Program and Preview row)
 - vMix host connection
   * Status dot
   * Easy change of host
   * Auto-complete (Saves list of previous connected hosts)

## Project setup
### Install dependencies
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
