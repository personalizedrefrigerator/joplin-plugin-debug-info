let idCounter = 0;
const makeLabeledInput = (label: string): [HTMLElement, HTMLInputElement] => {
	const container = document.createElement('span');
	const labelElement = document.createElement('label');
	const inputElement = document.createElement('input');

	inputElement.id = `labeledInput--${idCounter++}`;
	labelElement.innerText = label;
	labelElement.htmlFor = inputElement.id;

	container.replaceChildren(labelElement, inputElement);
	return [container, inputElement];
};

export default makeLabeledInput;
