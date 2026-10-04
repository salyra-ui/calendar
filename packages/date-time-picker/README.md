# Salyra UI / DateTimePicker

Composable datetime controls for React, Svelte, Vue, Angular, Astro and Vanilla.

## Installation

Install with `npm install @salyra-ui/date-time-picker`. npm resolves its declared Salyra dependencies. Import the framework entry your application uses.

```sh
npm install @salyra-ui/date-time-picker
```

Import the adapter your app uses, such as `@salyra-ui/date-time-picker/svelte`. Framework peers are optional. The default stylesheet is optional through `@salyra-ui/date-time-picker/styles.css`.

Calendar owns the shared calculations, store and native primitives. DatePicker and TimePicker provide their own roots and defaults. DateTimePicker composes both packages. They share the same context, so their primitive components can be used in one editor.

Values remain in draft until complete and valid. Explicit Apply and Cancel are available. Time intervals use end dates or day offsets rather than guessing the next day.

The generated package contains dist, README and LICENSE, without sourcemaps. Vanilla has readable and minified standalone browser files. Each standalone browser bundle includes its dependencies and needs no additional Salyra script.

The workspace contains versioned API documentation, framework examples, tests and architecture notes.

## Vanilla browser assets

The archive includes readable and minified standalone browser scripts at `dist/browser/date-time-picker.js` and `dist/browser/date-time-picker.min.js`. Each script includes its required Calendar core. Styles are available at `dist/styles.css` and `dist/styles.min.css`, without sourcemaps. Both JavaScript builds expose the same `SalyraDateTimePicker` global.

For a bundled application, import `@salyra-ui/date-time-picker/vanilla` and, when using the default appearance, `@salyra-ui/date-time-picker/styles.min.css`. The `styles.standard.css` entry gives you the readable stylesheet. Custom compositions can omit these default styles.
