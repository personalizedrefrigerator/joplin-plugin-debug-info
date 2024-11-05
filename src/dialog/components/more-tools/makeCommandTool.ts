import { CommandName, PanelMessageResponseType, PanelMessageType, WebviewApi } from '../../types';
import localization from '../../../localization';

declare const webviewApi: WebviewApi;

const makeCommandTool = () => {
	const container = document.createElement('div');
	const descriptionElement = document.createElement('p');
	descriptionElement.textContent = localization.moreTools__runCommand__description;
	const commandControls = document.createElement('div');
	const commandOutput = document.createElement('div');

	commandOutput.classList.add('command-output');

	const clearOutputLog = () => {
		commandOutput.replaceChildren();
	};
	const logMessage = (text: string) => {
		const messageContainer = document.createElement('div');
		messageContainer.classList.add('log');
		messageContainer.textContent = text;
		commandOutput.appendChild(messageContainer);
		return messageContainer;
	};
	const logError = (message: string) => {
		logMessage(message).classList.add('-error');
	};

	const runCommand = async (commandName: CommandName) => {
		clearOutputLog();
		logMessage(`Running command: ${commandName}`);
		const output = await webviewApi.postMessage({
			type: PanelMessageType.RunCommand,
			commandName,
		});
		if (output?.type === PanelMessageResponseType.CommandOutput) {
			if (output.isError) {
				logError(`Error: ${output.outputText}`);
			} else {
				logMessage(`Output: ${output.outputText}`);
			}
		}
	};

	const addCommandButton = (commandName: CommandName) => {
		const button = document.createElement('button');
		button.classList.add('command-button');
		button.textContent = commandName;
		button.onclick = () => {
			void runCommand(commandName);
		};
		commandControls.appendChild(button);
	};
	for (const command of Object.values(CommandName)) {
		addCommandButton(command);
	}

	container.replaceChildren(descriptionElement, commandControls, commandOutput);
	return container;
};

export default makeCommandTool;
