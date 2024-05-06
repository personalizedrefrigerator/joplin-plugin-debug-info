interface AppLocalization {
	permanentlyDelete: string;
	deleteToTrash: string;
	go: string;
	toggleNoteInfo: string;
	noteInfoHeader: string;
	notDeleted: string;
	continueDangerousAction: (actionName: string, itemTitle: string) => string;
}

const defaultStrings: AppLocalization = {
	permanentlyDelete: 'Permanently delete',
	deleteToTrash: 'Delete to trash',
	go: 'Go',
	toggleNoteInfo: 'Show/hide note info',
	noteInfoHeader: 'Note info plugin',
	notDeleted: 'Not deleted',
	continueDangerousAction: (actionName, itemTitle) =>
		`${actionName} ${itemTitle}.\nContiue? This may lead to data loss.`,
};

const localizations: Record<string, AppLocalization> = {
	en: defaultStrings,

	// TODO: Override the default localizations here
	es: {
		...defaultStrings,
	},
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
	const localeSep = language.indexOf('-');

	if (localeSep !== -1) {
		languages.push(language.substring(0, localeSep));
	}
}

for (const locale of languages) {
	if (locale in localizations) {
		localization = localizations[locale];
		break;
	}
}

if (!localization) {
	console.log('No supported localization found. Falling back to default.');
	localization = defaultStrings;
}

export default localization!;
