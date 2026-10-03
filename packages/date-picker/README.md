# Salyra UI / DatePicker

Composable date controls for React, Svelte, Vue, Angular, Astro and Vanilla. Development preview 0.1.0, not published yet.

## Installation

For this local preview, install the calendar archive alongside it. Once published, npm will install the declared Salyra dependencies automatically.

```sh
npm install @salyra-ui/date-picker
```

Import the adapter your app uses, such as `@salyra-ui/date-picker/svelte`. Framework peers are optional. The default stylesheet is optional through `@salyra-ui/date-picker/styles.css`.

Calendar owns the shared calculations, store and native primitives. DatePicker and TimePicker provide their own roots and defaults. DateTimePicker composes both packages. They share the same context, so their primitive components can be used in one editor.

Values remain in draft until complete and valid. Explicit Apply and Cancel are available. Time intervals use end dates or day offsets rather than guessing the next day.

The generated package contains dist, README and LICENSE, without sourcemaps. Vanilla has readable and minified standalone browser files. Each standalone browser bundle includes its dependencies and needs no additional Salyra script.

The workspace contains versioned API documentation, framework examples, tests and architecture notes.
