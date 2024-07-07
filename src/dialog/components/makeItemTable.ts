import { ModelType } from 'api/types';
import {
	PanelMessageResponseType,
	PanelMessageType,
	WebViewToPanelMessage,
	WebviewApi,
} from '../types';
import buildItemIdInput from './makeItemIdInput';
import localization from '../../localization';
import makeItemPropertyDescription from './makeItemPropertyDescription';
import makeRefreshButton from './makeRefreshButton';

declare const webviewApi: WebviewApi;

/** Creates a table with information and actions related to an item. */
const makeItemTable = async (
	itemId: string,
	selectedNoteIds?: string[],
): Promise<HTMLTableElement | Node> => {
	const table = document.createElement('table');
	table.classList.add('item-table');

	const goToItem = async (itemId: string) => {
		table.replaceWith(await makeItemTable(itemId));
	};

	const refresh = async () => {
		await goToItem(itemId);
	};

	const makeItemLink = (content: Node | string, targetId: string) => {
		const contentNode = typeof content === 'string' ? document.createTextNode(content) : content;
		const link = document.createElement('button');
		link.appendChild(contentNode);
		link.onclick = () => {
			void goToItem(targetId);
		};
		return link;
	};

	const tableRows: HTMLElement[] = [];
	const addTableRow = (
		header: string,
		content: string | HTMLElement,
		linkTarget?: string | undefined,
	) => {
		const tableRow = document.createElement('tr');
		const headerElement = document.createElement('th');
		const contentElement = document.createElement('td');
		contentElement.classList.add('item-table-property-value');

		headerElement.appendChild(document.createTextNode(header));
		const contentNode =
			typeof content === 'string' ? document.createTextNode(`${content}`) : content;
		if (linkTarget) {
			contentElement.appendChild(makeItemLink(contentNode, linkTarget));
		} else {
			contentElement.appendChild(contentNode);
		}

		tableRow.replaceChildren(headerElement, contentElement);
		tableRows.push(tableRow);
	};

	const noteInfo = await webviewApi.postMessage({
		type: PanelMessageType.GetItemMetadataRequest,
		itemId,
	});

	if (!noteInfo) {
		return document.createTextNode(`No content found: ${itemId}`);
	}
	if (noteInfo?.type !== PanelMessageResponseType.ItemMetadata) {
		throw new Error('Invalid metadata response: ' + noteInfo);
	}

	const metadata = noteInfo.metadata;
	for (const key in metadata) {
		const isLink = ['parent_id', 'conflict_original_id'].includes(key);
		const value = metadata[key as keyof typeof metadata];
		if (value === undefined) continue;

		const content = makeItemPropertyDescription(key, value);
		addTableRow(key, content, isLink ? `${value}` : undefined);
	}

	// A button that sends a request for an ID list when clicked.
	const makeItemListButton = (requestMessage: WebViewToPanelMessage, linkHeader = '') => {
		const showButton = document.createElement('button');
		showButton.onclick = async () => {
			showButton.disabled = true;

			const resources = await webviewApi.postMessage(requestMessage);
			if (resources?.type !== PanelMessageResponseType.IdListResponse) {
				throw new Error(`Invalid item list response ${resources}`);
			}

			const linkContainer = document.createElement('ul');
			for (const id of resources.ids) {
				const element = document.createElement('li');
				element.appendChild(makeItemLink(id, id));
				linkContainer.appendChild(element);
			}
			showButton.replaceWith(document.createTextNode(linkHeader), linkContainer);
		};
		showButton.innerText = '...';
		return showButton;
	};

	if (metadata.type_ === ModelType.Note) {
		addTableRow(
			'resources',
			makeItemListButton({
				type: PanelMessageType.GetResourcesLinkedToNote,
				noteId: itemId,
			}),
		);
	} else if (
		metadata.type_ === ModelType.Resource ||
		metadata.type_ === ModelType.Folder ||
		metadata.type_ === ModelType.Tag
	) {
		addTableRow(
			'notes',
			makeItemListButton(
				{
					type: PanelMessageType.GetAssociatedNotes,
					fromItemType: metadata.type_,
					fromItemId: itemId,
				},
				metadata.type_ === ModelType.Resource ? localization.linkedNotesMayBeOutdated : '',
			),
		);
	}

	const actionButtonContainer: HTMLElement = document.createElement('div');
	const addActionButton = (title: string, action: () => Promise<void>, confirmAction: boolean) => {
		const button = document.createElement('button');
		button.innerText = title;
		button.onclick = async () => {
			if (
				!confirmAction ||
				confirm(localization.continueDangerousAction(title, metadata.title ?? metadata.id))
			) {
				button.disabled = true;
				try {
					await action();
				} finally {
					button.disabled = false;
				}
			}
		};
		actionButtonContainer.appendChild(button);
	};

	if (
		metadata.type_ === ModelType.Folder ||
		metadata.type_ === ModelType.Resource ||
		metadata.type_ === ModelType.Note
	) {
		addActionButton(
			localization.permanentlyDelete,
			async () => {
				await webviewApi.postMessage({ type: PanelMessageType.PermanentDeleteItem, itemId });
				table.remove();
			},
			true,
		);

		// Resources can't be deleted to trash
		if (
			(metadata.type_ === ModelType.Folder || metadata.type_ === ModelType.Note) &&
			metadata.deleted_time === 0
		) {
			addActionButton(
				localization.deleteToTrash,
				async () => {
					await webviewApi.postMessage({ type: PanelMessageType.DeleteItemToTrash, itemId });
					await goToItem(itemId);
				},
				true,
			);
		}

		const isCurrentlySelectedNote = selectedNoteIds?.length === 1 && selectedNoteIds[0] === itemId;
		if (metadata.type_ === ModelType.Note && !isCurrentlySelectedNote) {
			addActionButton(
				localization.showInNoteViewer,
				async () => {
					await webviewApi.postMessage({ type: PanelMessageType.OpenInJoplin, itemId });
				},
				false,
			);
		}
	}

	addTableRow('actions', actionButtonContainer);

	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');

	const headContent = document.createElement('th');
	headContent.classList.add('item-table-header');
	headContent.appendChild(makeRefreshButton(refresh));
	headContent.appendChild(buildItemIdInput(metadata.id, goToItem));
	headContent.colSpan = 2;

	thead.appendChild(headContent);

	tbody.replaceChildren(...tableRows);
	table.replaceChildren(thead, tbody);
	return table;
};

export default makeItemTable;
