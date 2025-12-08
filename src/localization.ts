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
	moreTools__runCommand: string;
	moreTools__runCommand__description: string;
	custom: string;

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
	moreTools__runCommand: 'Run a command',
	moreTools__runCommand__description:
		'This tool allows running certain Joplin commands and observing their output. At present, only a small subset of all commands are listed.',
	custom: 'Custom',
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
	hr: {
		permanentlyDelete: 'Izbriši zauvijek',
		deleteToTrash: 'Premjesti u smeće',
		showInNoteViewer: 'Prikaži u uređivaču/pregledniku',
		go: 'Idi',
		refresh: 'Osvježi',
		toggleNoteInfo: 'Prikaži/Sakrij informacije o bilješci',
		noteInfoHeader: 'Dodatak za informacije o bilješci',
		propertyDescription__notDeleted: 'Nije izbrisano',
		linkedNotesMayBeOutdated:
			"Povezane bilješke.\nNapomena: Joplin ih ne aktualizira često. Ponovno pokretanje Joplina i čekanje 30 sekundi bi trebalo prisiliti da se ovo aktualizira.",

		moreTools: 'Više alata: ',
		moreTools__search: 'Traži',
		moreTools__runCommand: 'Pokreni naredbu',
		moreTools__runCommand__description:
			'Ovaj alat omogućuje pokretanje određenih Joplin naredbi i pregled njihovih rezultata. Trenutačno je naveden samo mali podskup svih naredbi.',
		custom: 'Prilagođeno',
		loadMore: 'Učitaj više',
		advanced: 'Napredno',

		propertyDescription__encryptedLocally: 'Još nije dešifrirano',
		propertyDescription__decryptedLocally: 'Dešifrirano lokalno',
		propertyDescription__notDue: 'Još nije potrebno',
		propertyDescription__notAConflict: 'Nije konflikt',
		propertyDescription__isAConflict: 'Je konflikt',

		continueDangerousAction: (actionName, itemTitle) =>
			`${actionName} ${itemTitle}.\nNastaviti? Ovo može dovesti do gubitka podataka.`,
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
