import joplin from 'api';
import {
	PanelMessageResponse,
	PanelMessageResponseType,
	PanelMessageType,
	PanelToWebViewMessage,
	WebViewToPanelMessage,
} from './types';
import { ModelType } from 'api/types';
import escapeHtml from '../util/escapeHtml';

// Returns the base path name for Joplin API queries.
const pathNameForItem = (itemType: ModelType) => {
	if (itemType === ModelType.Note) {
		return 'notes';
	} else if (itemType === ModelType.Resource) {
		return 'resources';
	} else if (itemType === ModelType.Folder) {
		return 'folders';
	} else if (itemType === ModelType.Tag) {
		return 'tags';
	}
	return null;
};

export default class ItemInfoDialog {
	private panelHandle: string;

	private constructor() {}

	public static async create() {
		const dialog = new ItemInfoDialog();
		await dialog.initialize();

		return dialog;
	}

	private async initialize() {
		this.panelHandle = await joplin.views.panels.create('note-info-dialog');
		await joplin.views.panels.setHtml(
			this.panelHandle,
			`<p id='selected-note-id'>${escapeHtml(
				(await joplin.workspace.selectedNoteIds()).join(','),
			)}</p>`,
		);
		await joplin.views.panels.addScript(this.panelHandle, 'dialog/webview.js');
		await joplin.views.panels.addScript(this.panelHandle, 'dialog/webview.css');

		await joplin.workspace.onNoteSelectionChange(this.onSelectedNoteChangeHandler);
		await joplin.views.panels.onMessage(
			this.panelHandle,
			async (message: WebViewToPanelMessage): Promise<PanelMessageResponse> => {
				if (message.type === PanelMessageType.GetItemMetadataRequest) {
					const type = await joplin.data.itemType(message.itemId);
					let fields = ['id', 'encryption_applied', 'is_shared', 'updated_time', 'created_time'];
					if (type === ModelType.Note || type === ModelType.Folder) {
						fields.push('parent_id', 'title');

						if (type === ModelType.Note) {
							fields.push('todo_completed', 'todo_due', 'source_application', 'source_url');
						}
					} else if (type === ModelType.Resource) {
						fields.push(
							'size',
							'filename',
							'file_extension',
							'ocr_text',
							'ocr_status',
							'ocr_error',
							'mime',
						);
					}

					const pathName = pathNameForItem(type);
					if (!pathName) {
						return {
							type: PanelMessageResponseType.ItemMetadata,
							metadata: { type_: type, id: message.itemId },
						};
					}

					const data = await joplin.data.get([pathName, message.itemId], {
						fields,
						include_deleted: 1,
						include_conflicts: 1,
					});

					return {
						type: PanelMessageResponseType.ItemMetadata,
						metadata: {
							type_: type,
							...data,
						},
					};
				} else if (message.type === PanelMessageType.GetNoteResources) {
					let data;
					let page = 0;

					const itemIds: string[] = [];
					do {
						data = await joplin.data.get(['notes', message.noteId, 'resources'], { page });
						page++;
						itemIds.push(...data.items.map((i: any) => i.id));
					} while (data.has_more);

					return {
						type: PanelMessageResponseType.NoteResources,
						resourceIds: itemIds,
					};
				} else if (
					message.type === PanelMessageType.PermanentDeleteItem ||
					message.type === PanelMessageType.DeleteItemToTrash
				) {
					const type = await joplin.data.itemType(message.itemId);
					const pathName = pathNameForItem(type);
					if (!pathName) throw new Error(`Unable to delete item with type ${type}`);

					const permanent = message.type === PanelMessageType.PermanentDeleteItem;
					await joplin.data.delete([pathName, message.itemId], { toTrash: !permanent });
					return null;
				} else {
					throw new Error(`Unknown message type, ${message}.`);
				}
			},
		);
	}

	private onSelectedNoteChangeHandler = async () => {
		const selection = await joplin.workspace.selectedNoteIds();
		this.postMessage({
			type: PanelMessageType.NoteSelectionChange,
			selectedNoteIds: selection,
		});
	};

	private postMessage(message: PanelToWebViewMessage) {
		joplin.views.panels.postMessage(this.panelHandle, message);
	}

	public async toggle() {
		const shown = await joplin.views.panels.visible(this.panelHandle);
		if (shown) {
			await joplin.views.panels.hide(this.panelHandle);
		} else {
			await joplin.views.panels.show(this.panelHandle);
		}
	}
}
