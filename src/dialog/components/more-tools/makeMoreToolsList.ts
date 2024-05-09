import localization from '../../../localization';
import makeSearchTool from './makeSearchTool';

const makeMoreToolsList = () => {
	const container = document.createElement('div');
	container.classList.add('more-tools-container');

	const labelElement = document.createElement('strong');
	labelElement.innerText = localization.moreTools;
	container.appendChild(labelElement);

	const searchDropdown = document.createElement('details');
	const searchSummary = document.createElement('summary');
	searchDropdown.appendChild(searchSummary);
	searchSummary.innerText = localization.moreTools__search;
	searchDropdown.replaceChildren(searchSummary, makeSearchTool());

	container.appendChild(searchDropdown);

	return container;
};

export default makeMoreToolsList;
