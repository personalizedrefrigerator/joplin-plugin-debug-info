# Joplin debug tool

This plugin adds a panel that shows information about the selected notes(s). At present, this information isn't very user-friendly — it's presented roughly as fetched from Joplin's data API.

![screenshot: Shows a panel with note properties including deleted_time, updated_time, and actions including delete](https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/98ef3280-b8d2-44a4-b8d3-99b061252fab)

This plugin supports both Joplin Desktop >= 2.14 and Joplin Mobile >= 3.0.

# Features

## Note info panel

This plugin adds a "note info" panel to Joplin's UI. The panel can be hidden with the "View" > "Show/Hide note info" menu item.

The fields shown in the plugin are a subset of the fields [stored for different items in Joplin's database](https://github.com/laurent22/joplin/blob/dev/packages/lib/services/database/types.ts).

### Showing information for a specific note, notebook, or resource

To show the information for a specific note or resource ID, click on the text box to the right of the ID header:
![screenshot: Box to the right of "ID" in the table header is circled](https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/f877d10d-a280-4b39-ac96-b662fa97f3b4)

Next, paste a new ID (or note link) into the ID box. Finally, click "GO":

<img src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/118a7bfc-ea9c-486a-8142-6ec53b9da555" width="340"/>


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

- **All notes with nonbreaking spaces**:
    - <img alt="screenshot" width="400" src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/45b18601-5df1-49a5-b58b-80c1218bde1d"/>
    - Search field content: `\u00A0`
    - Advanced settings: `Notes` and fields: `body`.

- **Shared and/or published notes**:
    - <img alt="screenshot" width="400" src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/a58c694c-0f57-46c6-b4f9-d949df36391c"/>
    - Search field content: `1`
    - Advanced settings: `Notes` and fields: `is_shared`.

- **Notes from Joplin's webclipper**:
    - <img alt="screenshot" width="400" src="https://github.com/personalizedrefrigerator/joplin-plugin-debug-info/assets/46334387/3a5829f8-aeb6-48ed-961a-a167c0170532"/>
    - Search field content: `.`
    - Advanced settings: `Notes` and fields: `source_url`.
    - **Explanation**: Because a `.` means "any character", this query searches for all notes with a non-empty `source_url`. The Joplin webclipper associates a `source_url` with webclipped notes.

