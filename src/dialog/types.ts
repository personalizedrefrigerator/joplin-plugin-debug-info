import { ModelType } from 'api/types';

export enum PanelMessageType {
	NoteSelectionChange = 'noteChange',

	GetItemMetadataRequest = 'itemMetadata',
	GetNoteResources = 'getResources',
	GetSelectedNoteIds = 'getSelection',

	PermanentDeleteItem = 'permanentlyDeleteItem',
	DeleteItemToTrash = 'deleteToTrash',
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

interface DeleteItemRequest {
	type: PanelMessageType.DeleteItemToTrash | PanelMessageType.PermanentDeleteItem;
	itemId: string;
}

export type WebViewToPanelMessage =
	| SelectedNoteIdsRequest
	| NoteResourcesRequest
	| DeleteItemRequest
	| ItemMetadataRequest;

export enum PanelMessageResponseType {
	ItemMetadata = 'itemMetadata',
	NoteResources = 'resources',
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

interface SelectedNoteIdsResponse {
	type: PanelMessageResponseType.SelectedNoteIds;
	selectedNoteIds: string[];
}

export type PanelMessageResponse =
	| SelectedNoteIdsResponse
	| ItemMetadataResponse
	| NoteResourcesResponse
	| null;

type OnMessageListener = (event: { message: PanelToWebViewMessage }) => void;
export type WebviewApi = {
	postMessage(message: WebViewToPanelMessage): Promise<PanelMessageResponse>;
	onMessage(listener: OnMessageListener): void;
};
