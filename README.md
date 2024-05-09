# Joplin debug tool

This plugin adds a panel that shows information about the selected notes(s). At present, this information isn't very user-friendly — it's presented roughly as fetched from Joplin's data API.

![screenshot: Shows a panel with note properties including deleted_time, updated_time, and actions including delete](https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/98ef3280-b8d2-44a4-b8d3-99b061252fab)


# Features

## Note info panel

This plugin adds a "note info" panel to Joplin's UI. The panel can be hidden by going to View > Show/Hide note info. 

The fields shown in the plugin are a subset of the fields [stored for different items in Joplin's database](https://github.com/laurent22/joplin/blob/dev/packages/lib/services/database/types.ts).

## Regular expression search

At the bottom of the info panel is a "search" dropdown:

![screenshot: Arrow points to the bottom of the input panel](https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/a55dc295-5884-48e6-8f25-de05170ff6a3)

By default, the search tool contained in the dropdown uses a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) to search through notes' `title` and `body` fields. The fields and type of item can be customized using the options in the "Advanced" dropdown.

A search scans Joplin's database and results are in the order returned by Joplin's [data API](https://joplinapp.org/help/api/references/rest_api/).

### Example searches

- **All notes with an empty body**:
    - <img alt="" width="400" src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/7dcb3d66-8d57-4609-ae4f-3d028a5532b2"/>
    - Search field content: `^$`
    - Advanced settings: `Notes` and fields: `body`.

- **All SVG resources**:
    - <img alt="screenshot" width="400" src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/b0d67218-2caa-47fe-9d58-31bc28503237"/>
    - Search field content: `image/svg`
    - Advanced settings: `Resources` and fields: `mime` (for [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)).

