# audio-matrix-vmix-electron
[![Audio Matrix vMix Electron](https://img.shields.io/github/downloads/jensstigaard/audio-matrix-vmix-electron/total.svg)]()


Simple Audio Matrix vMix app built with [ElectronJS](https://electronjs.org). ElectronJS is a cross-platform framework allowing the app to be built for each Windows, Mac or Linux. 

The app is oriented for touch use.

![Audio Matrix vMix Electron](./readme_assets/overview_050.png "Application overview")

You are free to clone the repository to develop your own app based in this code.

If you are interesting in similar apps, check out [Simple vMix switcher electron app](https://github.com/jensstigaard/simple-vmix-switcher-electron).

-----

## Downloads

See the [**Releases**](../../releases) tab for a direct download of the app for Windows or Mac.

## Features
 - Intuitive interface for toggling audiobusses on/off for inputs
 - Audio controls for audio busses A-G including volume control and mute/unmute
 - Easy change of vMix host, including dropdown with recently used hosts
 
## Known issues
 - Inputs without audio channels will appear in the interface, but any action will be ignored, since the input has no audio (Found by Dave Edwards - Thanks for the tip - It is a problem with the vMix API itself, and it is reported to vMix)

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
