import joplin from 'api';
import {
	PanelMessageResponse,
	PanelMessageResponseType,
	PanelMessageType,
	PanelToWebViewMessage,
	SearchResult,
	WebViewToPanelMessage,
} from './types';
import { ModelType } from 'api/types';
import escapeHtml from '../util/escapeHtml';
import localization from '../localization';
import isVersionGreater from '../util/isVersionGreater';

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

const fieldsForItemType = (itemType: ModelType) => {
	let fields = ['id', 'encryption_applied', 'is_shared', 'updated_time', 'created_time'];
	if (itemType === ModelType.Note || itemType === ModelType.Folder) {
		fields.push('parent_id', 'title', 'deleted_time');

		if (itemType === ModelType.Note) {
			fields.push(
				'author',
				'altitude',
				'latitude',
				'longitude',
				'markup_language',
				'todo_completed',
				'todo_due',
				'source_application',
				'source_url',
				'is_conflict',
				'user_created_time',
				'user_updated_time',
			);
		}
	} else if (itemType === ModelType.Resource) {
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
	return fields;
};

const canMoveItemToTrash = async (itemType: ModelType) => {
	const versionSupportsTrash = isVersionGreater((await joplin.versionInfo()).version, '3.0.0');
	return versionSupportsTrash && (itemType === ModelType.Note || itemType === ModelType.Folder);
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
			`
				<h1 class='panel-header'>${escapeHtml(localization.noteInfoHeader)}</h1>
			`,
		);
		await joplin.views.panels.addScript(this.panelHandle, 'dialog/webview.js');
		await joplin.views.panels.addScript(this.panelHandle, 'dialog/webview.css');

		await joplin.workspace.onNoteSelectionChange(this.onSelectedNoteChangeHandler);
		await joplin.views.panels.onMessage(this.panelHandle, this.handleWebViewMessage);
	}

	private onSelectedNoteChangeHandler = async () => {
		const selection = await joplin.workspace.selectedNoteIds();
		this.postMessage({
			type: PanelMessageType.NoteSelectionChange,
			selectedNoteIds: selection,
		});
	};

	private handleWebViewMessage = async (
		message: WebViewToPanelMessage,
	): Promise<PanelMessageResponse> => {
		if (message.type === PanelMessageType.GetItemMetadataRequest) {
			const type = await joplin.data.itemType(message.itemId);
			const fields = fieldsForItemType(type);

			const pathName = pathNameForItem(type);
			if (!pathName) {
				return {
					type: PanelMessageResponseType.ItemMetadata,
					metadata: { type_: type, id: message.itemId },
				};
			}

			const data = await joplin.data.get([pathName, message.itemId], {
				fields,
				include_deleted: '1',
				include_conflicts: '1',
			});

			return {
				type: PanelMessageResponseType.ItemMetadata,
				metadata: {
					type_: type,
					...data,
				},
			};
		} else if (message.type === PanelMessageType.GetResourcesLinkedToNote) {
			let data;
			let page = 0;

			const itemIds: string[] = [];
			do {
				data = await joplin.data.get(['notes', message.noteId, 'resources'], { page });
				page++;
				itemIds.push(...data.items.map((i: any) => i.id));
			} while (data.has_more);

			return {
				type: PanelMessageResponseType.IdListResponse,
				ids: itemIds,
			};
		} else if (message.type === PanelMessageType.GetNotesLinkedToResource) {
			let data;
			let page = 0;

			const itemIds: string[] = [];
			do {
				data = await joplin.data.get(['resources', message.resourceId, 'notes'], { page });
				page++;
				itemIds.push(...data.items.map((i: any) => i.id));
			} while (data.has_more);

			return {
				type: PanelMessageResponseType.IdListResponse,
				ids: itemIds,
			};
		} else if (
			message.type === PanelMessageType.PermanentDeleteItem ||
			message.type === PanelMessageType.DeleteItemToTrash
		) {
			const type = await joplin.data.itemType(message.itemId);
			const pathName = pathNameForItem(type);
			if (!pathName) throw new Error(`Unable to delete item with type ${type}`);

			const permanent = message.type === PanelMessageType.PermanentDeleteItem;
			if (!permanent && !(await canMoveItemToTrash(type))) {
				throw new Error(
					`Refusing to permanently delete an item of type ${type}, when to-trash was requested.`,
				);
			}

			await joplin.data.delete([pathName, message.itemId], { permanent: permanent ? '1' : false });
			return null;
		} else if (message.type === PanelMessageType.OpenInJoplin) {
			await joplin.commands.execute('openItem', `:/${message.itemId}`);
			return null;
		} else if (message.type === PanelMessageType.GetAllMatchingRegex) {
			let page = message.page;
			const results: SearchResult[] = [];

			const query = message.query;
			const regex = new RegExp(query.regex, 'u');

			let lastResponse = { has_more: true, items: [] as any[] };

			// Don't check more than just a few pages at once -- this allows progress
			// to be shown.
			const maxCheckedPage = message.page + 3;

			const searchFields = query.fields;
			const fieldValidityRegex = /^[a-zA-Z0-9_-]+$/;
			if (searchFields.some((field) => !field.match(fieldValidityRegex))) {
				throw new Error(`All fields should match ${/^[a-zA-Z0-9_-]+$/}`);
			}

			// The ID and title fields are needed to create results, even if we're not searching with them.
			let loadFields = searchFields;
			if (!loadFields.includes('id')) {
				loadFields = [...loadFields, 'id'];
			}
			if (!loadFields.includes('title')) {
				loadFields = [...loadFields, 'title'];
			}

			const searchIn = pathNameForItem(query.searchIn);
			if (!searchIn) {
				throw new Error(`Unknown model type for search: ${query.searchIn}.`);
			}

			const includeDeleted = loadFields.includes('deleted_time');
			const includeConflicts = loadFields.includes('is_conflict');

			while (lastResponse.has_more && page < maxCheckedPage) {
				lastResponse = await joplin.data.get([searchIn], {
					fields: loadFields,
					include_deleted: includeDeleted ? '1' : 0,
					include_conflicts: includeConflicts ? '1' : 0,
					page,
				});

				for (const item of lastResponse.items) {
					const inFields = [];

					for (const field of searchFields) {
						const hasField = Object.prototype.hasOwnProperty.call(item, field);
						if (hasField && `${item[field]}`.match(regex)) {
							inFields.push(field);
						}
					}

					if (inFields.length > 0) {
						results.push({
							id: item.id,
							// Trim the title for better display (handles the case where a
							// note has a very long title.)
							title: (item.title ?? item.id).substring(0, 128),
							inFields,
						});
					}
				}

				page++;
			}

			return {
				type: PanelMessageResponseType.SearchResults,
				results,
				nextPage: page,
				has_more: lastResponse.has_more,
			};
		} else if (message.type === PanelMessageType.GetSelectedNoteIds) {
			return {
				type: PanelMessageResponseType.SelectedNoteIds,
				selectedNoteIds: await joplin.workspace.selectedNoteIds(),
			};
		} else {
			const exhaustivenessCheck: never = message;
			throw new Error(`Unknown message type, ${exhaustivenessCheck}.`);
		}
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
