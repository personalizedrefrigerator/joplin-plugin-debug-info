interface AppLocalization {
	permanentlyDelete: string;
	deleteToTrash: string;
	showInNoteViewer: string;
	go: string;
	refresh: string;
	toggleNoteInfo: string;
	noteInfoHeader: string;
	propertyDescription__notDeleted: string;
	linkedNotesMayBeOutdated: string;
	propertyDescription__decryptedLocally: string;
	propertyDescription__encryptedLocally: string;
	propertyDescription__notDue: string;
	propertyDescription__notAConflict: string;
	propertyDescription__isAConflict: string;

	moreTools: string;
	moreTools__search: string;
	loadMore: string;
	advanced: string;

	continueDangerousAction: (actionName: string, itemTitle: string) => string;
}

const defaultStrings: AppLocalization = {
	permanentlyDelete: 'Permanently delete',
	deleteToTrash: 'Delete to trash',
	showInNoteViewer: 'Show in editor/viewer',
	go: 'Go',
	refresh: 'Refresh',
	toggleNoteInfo: 'Show/hide note info',
	noteInfoHeader: 'Note info plugin',
	propertyDescription__notDeleted: 'Not deleted',
	linkedNotesMayBeOutdated:
		"Linked notes.\nNote: Joplin doesn't update this frequently. Restarting Joplin and waiting 30 seconds should force this to update.",

	moreTools: 'More tools: ',
	moreTools__search: 'Search',
	loadMore: 'Load more',
	advanced: 'Advanced',

	propertyDescription__encryptedLocally: 'Not yet decrypted',
	propertyDescription__decryptedLocally: 'Decrypted locally',
	propertyDescription__notDue: 'Not due',
	propertyDescription__notAConflict: 'Not a conflict',
	propertyDescription__isAConflict: 'Is a conflict',

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
