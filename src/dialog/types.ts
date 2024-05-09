import { ModelType } from 'api/types';

export enum PanelMessageType {
	NoteSelectionChange = 'noteChange',

	GetItemMetadataRequest = 'itemMetadata',
	GetNoteResources = 'getResources',
	GetSelectedNoteIds = 'getSelection',

	PermanentDeleteItem = 'permanentlyDeleteItem',
	DeleteItemToTrash = 'deleteToTrash',

	OpenInJoplin = 'openInJoplin',
	GetAllMatchingRegex = 'allMatchingRegex',
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
	type: PanelMessageType.GetNoteResources;
	noteId: string;
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

export type WebViewToPanelMessage =
	| SelectedNoteIdsRequest
	| NoteResourcesRequest
	| DeleteItemRequest
	| OpenItemRequest
	| RegexSearchRequest
	| ItemMetadataRequest;

export enum PanelMessageResponseType {
	ItemMetadata = 'itemMetadata',
	NoteResources = 'resources',
	SearchResults = 'searchResults',
	SelectedNoteIds = 'selectedNoteIds',
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
	type: PanelMessageResponseType.NoteResources;
	resourceIds: string[];
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

export type PanelMessageResponse =
	| SelectedNoteIdsResponse
	| ItemMetadataResponse
	| RegexSearchResponse
	| NoteResourcesResponse
	| null;

type OnMessageListener = (event: { message: PanelToWebViewMessage }) => void;
export type WebviewApi = {
	postMessage(message: WebViewToPanelMessage): Promise<PanelMessageResponse>;
	onMessage(listener: OnMessageListener): void;
};
