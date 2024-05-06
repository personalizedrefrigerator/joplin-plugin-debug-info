import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import NoteInfoPanel from './dialog/NoteInfoPanel';
import localization from './localization';

joplin.plugins.register({
	onStart: async function () {
		const panel: NoteInfoPanel = await NoteInfoPanel.create();
		await joplin.commands.register({
			name: 'noteInfo',
			label: localization.toggleNoteInfo,
			execute: async () => {
				await panel.toggle();
			},
		});

		await joplin.views.menuItems.create('noteInfoMenuItem', 'noteInfo', MenuItemLocation.View);
	},
});
