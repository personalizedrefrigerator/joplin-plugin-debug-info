import { ModelType } from 'api/types';
import {
	PanelMessageResponse,
	PanelMessageResponseType,
	PanelMessageType,
	PanelToWebViewMessage,
	WebViewToPanelMessage,
} from './types';
import noteLinkToId from '../util/noteLinkToId';

type OnMessageListener = (event: { message: PanelToWebViewMessage }) => void;

declare const webviewApi: {
	postMessage(message: WebViewToPanelMessage): Promise<PanelMessageResponse>;
	onMessage(listener: OnMessageListener): void;
};

const buildItemIdInput = (initialValue: string, onSubmit: (id: string) => void) => {
	const container = document.createElement('div');
	const inputElement = document.createElement('input');
	const submitButton = document.createElement('button');

	inputElement.value = initialValue;
	inputElement.type = 'text';

	inputElement.oninput = () => {
		const id = noteLinkToId(inputElement.value);
		if (id) {
			submitButton.disabled = false;
			inputElement.classList.remove('invalid');
		} else {
			inputElement.classList.add('invalid');
		}
	};
	inputElement.onfocus = () => {
		submitButton.style.display = '';
	};
	submitButton.onclick = () => {
		const id = noteLinkToId(inputElement.value);
		if (!id) {
			alert(`Not an item ID: ${id}`);
			return;
		}
		onSubmit(id);
	};

	submitButton.innerText = 'Go';
	submitButton.style.display = 'none';

	container.replaceChildren(inputElement, submitButton);

	return container;
};

const buildItemTable = async (itemId: string): Promise<HTMLTableElement | Node> => {
	const table = document.createElement('table');

	const goToItem = async (itemId: string) => {
		table.replaceWith(await buildItemTable(itemId));
	};

	const buildItemLink = (content: Node | string, targetId: string) => {
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

		headerElement.appendChild(document.createTextNode(header));
		const contentNode =
			typeof content === 'string' ? document.createTextNode(`${content}`) : content;
		if (linkTarget && typeof content === 'string') {
			contentElement.appendChild(buildItemLink(contentNode, content));
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
		throw new Error('Invalid response: ' + noteInfo);
	}

	const metadata = noteInfo.metadata;
	for (const key in metadata) {
		const isLink = ['parent_id'].includes(key);
		const value = metadata[key as keyof typeof metadata];
		if (value === undefined) continue;

		addTableRow(key, `${value}`, isLink ? `${value}` : undefined);
	}

	if (metadata.type_ === ModelType.Note) {
		const showButton = document.createElement('button');
		showButton.onclick = async () => {
			showButton.disabled = true;

			const resources = await webviewApi.postMessage({
				type: PanelMessageType.GetNoteResources,
				noteId: itemId,
			});
			if (resources?.type !== PanelMessageResponseType.NoteResources) {
				throw new Error(`Invalid response ${resources}`);
			}

			const linkContainer = document.createElement('ul');
			for (const id of resources.resourceIds) {
				const element = document.createElement('li');
				element.appendChild(buildItemLink(id, id));
				linkContainer.appendChild(element);
			}
			showButton.replaceWith(linkContainer);
		};
		showButton.innerText = '...';
		addTableRow('resources', showButton);
	}

	const actionButtonContainer: HTMLElement = document.createElement('div');
	const addActionButton = (title: string, action: () => Promise<void>, confirmAction: boolean) => {
		const button = document.createElement('button');
		button.innerText = title;
		button.onclick = async () => {
			if (
				!confirmAction ||
				confirm(`${title} ${metadata.title ?? metadata.id}.\nContiue? This may lead to data loss.`)
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
			'Permanently delete',
			async () => {
				await webviewApi.postMessage({ type: PanelMessageType.PermanentDeleteItem, itemId });
				table.remove();
			},
			true,
		);
		addActionButton(
			'Delete to trash',
			async () => {
				await webviewApi.postMessage({ type: PanelMessageType.DeleteItemToTrash, itemId });
				await goToItem(itemId);
			},
			true,
		);
	}

	addTableRow('actions', actionButtonContainer);

	const thead = document.createElement('thead');
	const tbody = document.createElement('tbody');

	const headContent = document.createElement('th');
	headContent.appendChild(buildItemIdInput(metadata.id, goToItem));
	headContent.colSpan = 2;

	thead.appendChild(headContent);

	tbody.replaceChildren(...tableRows);
	table.replaceChildren(thead, tbody);
	return table;
};

const showTables = async (
	itemIds: string[],
	outputArea: HTMLElement,
	cancelCounter: { value: number },
) => {
	const initialCancelValue = cancelCounter.value;

	const tableHtml: Node[] = [];

	let counter = 0;
	for (const id of itemIds) {
		tableHtml.push(await buildItemTable(id));
		if (cancelCounter.value !== initialCancelValue) {
			return;
		}

		counter++;
		if (counter > 20) {
			tableHtml.push(document.createTextNode('...'));
			break;
		}
	}

	outputArea.replaceChildren(...tableHtml);
};

const main = () => {
	const initialIdsContainer = document.querySelector<HTMLElement>('#selected-note-id')!;
	const initialIds = initialIdsContainer!.innerText.split(',');
	const outputArea = document.createElement('div');
	document.body.appendChild(outputArea);

	const reloadCounter = { value: 0 };
	void showTables(initialIds, outputArea, reloadCounter);

	webviewApi.onMessage(({ message }) => {
		if (message.type === PanelMessageType.NoteSelectionChange) {
			reloadCounter.value++;
			void showTables(message.selectedNoteIds, outputArea, reloadCounter);
		}
	});
};

main();
