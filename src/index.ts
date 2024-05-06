import joplin from 'api';
import { MenuItemLocation } from 'api/types';
import NoteInfoPanel from './dialog/NoteInfoPanel';

joplin.plugins.register({
	onStart: async function () {
		let panel: NoteInfoPanel | null = null;
		await joplin.commands.register({
			name: 'noteInfo',
			label: 'Note info',
			execute: async () => {
				if (!panel) {
					panel = await NoteInfoPanel.create();
				} else {
					await panel.toggle();
				}
			},
		});

		await joplin.views.menuItems.create('noteInfoMenuItem', 'noteInfo', MenuItemLocation.View);
	},
});
