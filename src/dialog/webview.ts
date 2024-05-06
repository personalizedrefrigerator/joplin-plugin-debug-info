import { PanelMessageType, WebviewApi } from './types';
import makeItemTable from './components/makeItemTable';

declare const webviewApi: WebviewApi;

const showTables = async (
	itemIds: string[],
	outputArea: HTMLElement,
	cancelCounter: { value: number },
) => {
	const initialCancelValue = cancelCounter.value;

	const tableHtml: Node[] = [];

	let counter = 0;
	for (const id of itemIds) {
		tableHtml.push(await makeItemTable(id));
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
