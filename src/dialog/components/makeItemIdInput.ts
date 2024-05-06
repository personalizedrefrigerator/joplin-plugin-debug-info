import localization from '../../localization';
import noteLinkToId from '../../util/noteLinkToId';

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

	submitButton.innerText = localization.go;
	submitButton.style.display = 'none';

	container.replaceChildren(inputElement, submitButton);

	return container;
};

export default buildItemIdInput;
