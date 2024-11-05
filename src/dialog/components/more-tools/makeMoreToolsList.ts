import localization from '../../../localization';
import makeDropdown from '../makeDropdown';
import makeCommandTool from './makeCommandTool';
import makeSearchTool from './makeSearchTool';

const makeMoreToolsList = () => {
	const container = document.createElement('div');
	container.classList.add('more-tools-container');

	const labelElement = document.createElement('strong');
	labelElement.innerText = localization.moreTools;
	container.appendChild(labelElement);

	const commandDropdown = makeDropdown(localization.moreTools__runCommand, makeCommandTool());

	const searchDropdown = makeDropdown(localization.moreTools__search, makeSearchTool());

	container.replaceChildren(labelElement, commandDropdown, searchDropdown);
	return container;
};

export default makeMoreToolsList;
