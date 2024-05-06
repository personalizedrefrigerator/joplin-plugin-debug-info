import { ModelType } from 'api/types';
import localization from '../../localization';

/** Shows and describes the value of a property of some Joplin item. */
const makeItemPropertyDescription = (key: string, value: string | number) => {
	const container = document.createElement('span');
	container.classList.add('item-property-description');

	let description = '';
	if (key === 'type_') {
		if (value === ModelType.Note) {
			description = 'note';
		} else if (value === ModelType.Folder) {
			description = 'notebook';
		} else if (value === ModelType.Resource) {
			description = 'resource';
		} else if (value === ModelType.Tag) {
			description = 'tag';
		}
	} else if (
		key === 'created_time' ||
		key === 'updated_time' ||
		key === 'user_created_time' ||
		key === 'user_updated_time' ||
		key === 'deleted_time'
	) {
		description = new Date(value).toLocaleString();

		if (key === 'deleted_time' && value === 0) {
			description = localization.notDeleted;
		}
	} else if (key === 'size' && typeof value === 'number') {
		if (value > 1024 * 1024) {
			description = `${value / 1024 / 1024} MiB`;
		} else if (value > 1024) {
			description = `${value / 1024} KiB`;
		}
	}

	const descriptionElement = document.createElement('span');
	descriptionElement.classList.add('description');
	const rawValueElement = document.createElement('span');
	rawValueElement.classList.add('rawvalue');

	descriptionElement.innerText = description;
	rawValueElement.innerText = `${value}`;

	container.replaceChildren(rawValueElement, descriptionElement);

	return container;
};

export default makeItemPropertyDescription;
