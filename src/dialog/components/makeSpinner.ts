type SpinnerOption<T> = {
	label: string;
	value: T;
};

const makeSpinner = <T>(options: SpinnerOption<T>[], onChange?: () => void) => {
	const container = document.createElement('div');
	const spinner = document.createElement('select');
	if (onChange) {
		spinner.onchange = onChange;
	}

	let index = 0;
	for (const option of options) {
		const optionElement = document.createElement('option');
		optionElement.innerText = option.label;
		optionElement.value = `${index++}`;
		spinner.appendChild(optionElement);
	}
	container.appendChild(spinner);

	spinner.value = '0';

	return {
		container,
		setSelection(newValue: T) {
			const index = options.findIndex((item) => item.value === newValue);
			if (index < 0) {
				throw new Error(`Value ${newValue} not found in options`);
			}
			spinner.value = `${index}`;
		},
		getSelection(): T {
			return options[parseInt(spinner.value)].value;
		},
	};
};

export default makeSpinner;
