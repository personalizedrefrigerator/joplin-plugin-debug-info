const makeDropdown = (title: string, content: HTMLElement) => {
	const detailsElement = document.createElement('details');
	const summaryElement = document.createElement('summary');
	summaryElement.textContent = title;
	detailsElement.replaceChildren(summaryElement, content);

	return detailsElement;
};

export default makeDropdown;
