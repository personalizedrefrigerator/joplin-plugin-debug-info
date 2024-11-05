import { ModelType } from 'api/types';

export enum PanelMessageType {
	NoteSelectionChange = 'noteChange',

	GetItemMetadataRequest = 'itemMetadata',
	GetResourcesLinkedToNote = 'getResources',
	GetAssociatedNotes = 'getNotes',
	GetNotesInFolder = 'getNotesInFolder',
	GetSelectedNoteIds = 'getSelection',

	PermanentDeleteItem = 'permanentlyDeleteItem',
	DeleteItemToTrash = 'deleteToTrash',

	OpenInJoplin = 'openInJoplin',
	GetAllMatchingRegex = 'allMatchingRegex',

	RunCommand = 'runCommand',
}

interface NoteSelectionChangeMessage {
	type: PanelMessageType.NoteSelectionChange;
	selectedNoteIds: string[];
}

export type PanelToWebViewMessage = NoteSelectionChangeMessage;

interface ItemMetadataRequest {
	type: PanelMessageType.GetItemMetadataRequest;
	itemId: string;
}

interface NoteResourcesRequest {
	type: PanelMessageType.GetResourcesLinkedToNote;
	noteId: string;
}

interface NoteListRequest {
	type: PanelMessageType.GetAssociatedNotes;
	fromItemType: ModelType;
	fromItemId: string;
}

interface SelectedNoteIdsRequest {
	type: PanelMessageType.GetSelectedNoteIds;
}

type DeleteItemRequest =
	| {
			type: PanelMessageType.DeleteItemToTrash;
			itemId: string;
	  }
	| {
			type: PanelMessageType.PermanentDeleteItem;
			itemId: string;
	  };

interface OpenItemRequest {
	type: PanelMessageType.OpenInJoplin;
	itemId: string;
}

export type SearchQuery = {
	regex: string;
	searchIn: ModelType;
	fields: string[];
};

interface RegexSearchRequest {
	type: PanelMessageType.GetAllMatchingRegex;
	query: SearchQuery;
	page: number;
}

export enum CommandName {
	NewNote = 'newNote',
	Synchronize = 'synchronize',
	HistoryBackward = 'historyBackward',
	HistoryForward = 'historyForward',
}

interface RunCommandRequest {
	type: PanelMessageType.RunCommand;
	commandName: CommandName;
}

export type WebViewToPanelMessage =
	| SelectedNoteIdsRequest
	| NoteResourcesRequest
	| NoteListRequest
	| DeleteItemRequest
	| OpenItemRequest
	| RegexSearchRequest
	| ItemMetadataRequest
	| RunCommandRequest;

export enum PanelMessageResponseType {
	ItemMetadata = 'itemMetadata',
	IdListResponse = 'resources',
	SearchResults = 'searchResults',
	SelectedNoteIds = 'selectedNoteIds',
	CommandOutput = 'commandOutput',
}

export interface ItemMetadata {
	id: string;
	title?: string;
	parent_id?: string;
	type_?: ModelType;
	deleted_time?: number;
	source?: string;
	source_application?: string;
}

interface ItemMetadataResponse {
	type: PanelMessageResponseType.ItemMetadata;
	metadata: ItemMetadata;
}

interface NoteResourcesResponse {
	type: PanelMessageResponseType.IdListResponse;
	ids: string[];
}

export type SearchResult = { id: string; title: string; inFields: string[] };

interface RegexSearchResponse {
	type: PanelMessageResponseType.SearchResults;
	results: SearchResult[];
	nextPage: number;
	has_more: boolean;
}

interface SelectedNoteIdsResponse {
	type: PanelMessageResponseType.SelectedNoteIds;
	selectedNoteIds: string[];
}

interface RunCommandResponse {
	type: PanelMessageResponseType.CommandOutput;
	isError: boolean;
	outputText: string;
}

export type PanelMessageResponse =
	| SelectedNoteIdsResponse
	| ItemMetadataResponse
	| RegexSearchResponse
	| NoteResourcesResponse
	| RunCommandResponse
	| null;

type OnMessageListener = (event: { message: PanelToWebViewMessage }) => void;
export type WebviewApi = {
	postMessage(message: WebViewToPanelMessage): Promise<PanelMessageResponse>;
	onMessage(listener: OnMessageListener): void;
};
