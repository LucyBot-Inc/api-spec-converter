# Angluar 4.0 Template Project
I use this template as a starter for any new Angular projects.

Check out [the demo](https://bobby-brennan.github.io/angular4-template)

#### Features
* Angular Universal (prerendering)
* [Pug](https://pugjs.org) templates instead of HTML
* Bootstrap Sass
* Font Awesome
* Angular HTML5 Router
* Standard navbar/body layout

## Running the Demo

#### Install

```
npm install
```

#### Run (development mode)
Start the server on port 3000:

```
npm run start
```


#### Build (production)
Build everything and put it in the `dist/` folder:

```
npm run build
```

Or build for GitHub pages by copying `dist/browser` to `docs/`.
Be sure to change the settings in your repo to point GitHub pages to
the `docs/` folder on the `master` branch.

## Customizing

### Base href
The app uses the base href `/` for development builds, and `/angular4-template`
for production builds (to accomodate GitHub pages, which uses the repository
name in the URL's path). You will probably want to change the base href in
`./src/environments/environment.prod.ts`.

### Prerendering
Prerendering is a performance optimization - your page's HTML is generated
at build time, so the user sees a near-instant load of the page, while Angular
loads in the background.

In this build, only the homepage is prerendered - you can add other routes
by editing `./static.paths.ts`.

## New Components
A helper script for creating new components is in `./scripts/new-component.js`.

```
node ./scripts/new-component.js --name "Widget Viewer"
```
