# simple-vmix-switcher-electron

Simple vMix switcher app built with Electron. Can be compiled as app to Windows, Mac or Linux.

Oriented for touch use.

![Simple vMix Switcher Electron](./readme_assets/overview_030.png "Application overview")

# Feature summary
 - Traditional preview and program row including 'tally' - 8 inputs
 - Shows badges (tally) on input in overlay channel preview/program
 - Long touch on input in program row enables input to be put into an overlay channel
 - Ctrl+Shift+P / Cmd+Shift+P to swap Preview and Program row order
 - Transitions row: Cut and Quick Play + 4 defined transitions in vMix
 - Transition progress between Program and Preview row

## Project setup
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
