import localization from '../../localization';

const makeRefreshButton = (onRefresh: () => void) => {
	const refreshButton = document.createElement('button');

	refreshButton.textContent = '⟳';
	refreshButton.setAttribute('aria-label', localization.refresh);
	refreshButton.title = localization.refresh;
	refreshButton.classList.add('refresh', 'refresh-button');

	refreshButton.onclick = onRefresh;

	return refreshButton;
};

export default makeRefreshButton;
