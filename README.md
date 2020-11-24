# audio-matrix-vmix-electron
[![Audio Matrix vMix Electron](https://img.shields.io/github/downloads/jensstigaard/audio-matrix-vmix-electron/total.svg)](../../releases)


Simple Audio Matrix vMix app built with [ElectronJS](https://electronjs.org). ElectronJS is a cross-platform framework allowing the app to be built for each Windows, Mac or Linux. 

The app is oriented for touch use.

![Audio Matrix vMix Electron](./readme_assets/overview_050.png "Application overview")

You are free to clone the repository to develop your own app based in this code.

If you are interesting in similar apps, check out [Simple vMix switcher electron app](https://github.com/jensstigaard/simple-vmix-switcher-electron).

-----

## Downloads

See the [**Releases**](../../releases) tab for a direct download of the app for Windows or Mac.

## Features
### Intuitive interface
Clean and intuitive interface with the primarily use case for toggling audiobusses on/off for inputs

### vMix host entering
In the app bar you can easily change the vMix host or IP address.
It includes a dropdown menu with recently used hosts, so you can easily swap between hosts.

### Audio controls
Simply audio controls for audio busses A-G including volume control and mute/unmute.
You can also use the button in the app bar to toggle show/hide of the audio controls in case you want the interface as simple as possible, and only with the audio matrix.

## Additional features
Do you have a good idea for an additional feature for this app? Post an Issue or write me an email at <jens@stigaard.info>.

## Known issues
 - Inputs without audio channels will appear in the interface, but any action will be ignored, since the input has no audio (Found by Dave Edwards - Thanks for the tip - It is a problem with the vMix API itself, and it is reported to vMix)

## Inspiration from
This project is inspired by 
 * [vMatrix Audio Routing by thsorensen1](https://forums.vmix.com/posts/t21233-vMatrix-audio-routing)
 * [vMix Audio Matrix by Håvard Njåstad](https://github.com/Haavard15/vMixAudioMatrix)

## Contributors
[See list of contributors for this repo](../../graphs/contributors)

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
