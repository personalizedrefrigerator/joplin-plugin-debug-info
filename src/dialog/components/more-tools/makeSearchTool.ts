import {
	PanelMessageResponseType,
	PanelMessageType,
	SearchQuery,
	SearchResult,
	WebviewApi,
} from '../../types';
import localization from '../../../localization';
import makeLabeledInput from '../makeLabeledInput';
import makeItemTable from '../makeItemTable';
import makeSpinner from '../makeSpinner';
import { ModelType } from 'api/types';

declare const webviewApi: WebviewApi;

const makeSearchResult = (searchResult: SearchResult) => {
	const container = document.createElement('details');
	const summary = document.createElement('summary');
	summary.innerText = `${searchResult.title} in ${searchResult.inFields.join(',')}`;

	container.onclick = async () => {
		container.onclick = () => {};
		container.appendChild(await makeItemTable(searchResult.id));
	};

	container.replaceChildren(summary);
	return container;
};

// query: A regular expression in string form.
// cancelCounter: Can be used to cancel a search early by incrementing value.
//                This can prevent a search from running in the background.
const makeSearchResults = (query: SearchQuery, cancelCounter: { value: number }) => {
	const container = document.createElement('div');
	const resultsContainer = document.createElement('div');
	const errorMessageContainer = document.createElement('div');

	const loadMoreButton = document.createElement('button');
	loadMoreButton.innerText = localization.loadMore;

	errorMessageContainer.classList.add('error-message');

	let nextPage = 0;
	let hasMore = true;
	const initialCancelValue = cancelCounter.value;
	const loadMore = async () => {
		loadMoreButton.disabled = true;
		errorMessageContainer.style.display = 'none';

		try {
			const matches: SearchResult[] = [];

			// Minimum result count to stop searching
			const minResults = 5;

			while (matches.length < minResults && initialCancelValue === cancelCounter.value) {
				loadMoreButton.innerText = `Checking page ${nextPage}`;

				const result = await webviewApi.postMessage({
					type: PanelMessageType.GetAllMatchingRegex,
					query,
					page: nextPage,
				});
				if (result?.type !== PanelMessageResponseType.SearchResults) {
					throw new Error(`Invalid response type: ${result?.type}`);
				}
				matches.push(...result.results);

				nextPage = result.nextPage;
				if (!result.has_more) {
					hasMore = false;
					break;
				}
			}

			for (const result of matches) {
				resultsContainer.appendChild(makeSearchResult(result));
			}
		} catch (error) {
			errorMessageContainer.style.display = 'block';
			errorMessageContainer.innerText = `Error: ${error}`;
			console.warn('search error', error);
		} finally {
			loadMoreButton.disabled = false;
			loadMoreButton.innerText = localization.loadMore;

			if (!hasMore) {
				loadMoreButton.remove();
			}
		}
	};

	void loadMore();
	loadMoreButton.onclick = loadMore;

	container.replaceChildren(resultsContainer, errorMessageContainer, loadMoreButton);
	return container;
};

const makeSearchInput = () => {
	const searchInputRow = document.createElement('div');
	const [searchInputContainer, searchInput] = makeLabeledInput('Regex Search:');
	searchInputRow.appendChild(searchInputContainer);
	searchInputRow.classList.add('search-query-builder');

	const advancedDropdown = document.createElement('details');
	advancedDropdown.classList.add('advanced');
	const advancedSummary = document.createElement('summary');
	advancedSummary.innerText = localization.advanced;

	const [fieldsContainer, fieldsInput] = makeLabeledInput('Fields:');
	fieldsInput.value = 'title, body';

	const modelTypeDropdown = makeSpinner([
		{ label: 'Notebooks', value: ModelType.Folder },
		{ label: 'Notes', value: ModelType.Note },
		{ label: 'Resources', value: ModelType.Resource },
		{ label: 'Tags', value: ModelType.Tag },
	]);
	modelTypeDropdown.setSelection(ModelType.Note);

	advancedDropdown.replaceChildren(advancedSummary, fieldsContainer, modelTypeDropdown.container);

	const searchButton = document.createElement('button');
	searchButton.innerText = localization.go;
	searchInputRow.appendChild(searchButton);
	searchInputRow.appendChild(advancedDropdown);

	return {
		searchInputRow,
		searchButton,
		getQuery: (): SearchQuery => {
			let fields = fieldsInput.value.split(',').map((item) => item.trim());
			if (fields.length === 0) {
				fields = ['title'];
			}
			fieldsInput.value = fields.join(', ');

			return {
				regex: searchInput.value,
				searchIn: modelTypeDropdown.getSelection(),
				fields,
			};
		},
	};
};

const makeSearchTool = () => {
	const container = document.createElement('div');

	const resultsContainer = document.createElement('div');
	const { searchInputRow, searchButton, getQuery } = makeSearchInput();

	const searchCancelCounter = { value: 0 };
	searchButton.onclick = async () => {
		searchButton.disabled = true;
		searchCancelCounter.value++;
		try {
			resultsContainer.replaceChildren(makeSearchResults(getQuery(), searchCancelCounter));
		} finally {
			searchButton.disabled = false;
		}
	};

	container.replaceChildren(searchInputRow, resultsContainer);
	return container;
};

export default makeSearchTool;
