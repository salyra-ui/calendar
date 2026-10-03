# Salyra UI / Calendar

Composable calendar controls for React, Svelte, Vue, Angular, Astro and Vanilla. Development preview 0.1.0, not published yet.

## Installation

Install this archive by itself. Once published, npm will install the declared Salyra dependencies automatically.

```sh
npm install @salyra-ui/calendar
```

Import the adapter your app uses, such as `@salyra-ui/calendar/svelte`. Framework peers are optional. The default stylesheet is optional through `@salyra-ui/calendar/styles.css`.

Calendar owns the shared calculations, store and native primitives. DatePicker and TimePicker provide their own roots and defaults. DateTimePicker composes both packages. They share the same context, so their primitive components can be used in one editor.

Values remain in draft until complete and valid. Explicit Apply and Cancel are available. Time intervals use end dates or day offsets rather than guessing the next day.

The generated package contains dist, README and LICENSE, without sourcemaps. Vanilla has readable and minified standalone browser files. Each standalone browser bundle includes its dependencies and needs no additional Salyra script.

The workspace contains versioned API documentation, framework examples, tests and architecture notes.
