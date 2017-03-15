'use strict';

class InputFileReader {
	constructor(input) {
		this.listeners = [];
		this.input = input;
		this.input.addEventListener('change', () => this.loadFile());
	}

	addListener(listener) {
		this.listeners.push(listener);
	}

	loadFile() {
		this.disableInput();
		let files = this.input.files;
		if (files.length <= 0) {
			return;
		}
		let file = files[0];
		this.listeners.forEach((listener) => listener.selectFile(file.name, file.size));
		let reader = new FileReader();
		reader.addEventListener('progress', (event) => {
			let progress = event.loaded / event.total;
			this.listeners.forEach((listener) => listener.uploadFileProgress(progress));
		});
		reader.addEventListener('error', (event) => {
			this.resetInput();
			this.listeners.forEach((listener) => listener.uploadFileError(event));
		});
		reader.addEventListener('load', () => {
			this.resetInput();
			this.listeners.forEach((listener) => listener.uploadFileComplete(reader.result));
		});
		reader.readAsText(file);
	}

	disableInput() {
		this.input.disabled = true;
	}

	resetInput() {
		this.input.disabled = false;
		this.input.value = null;
	}
}

class PhraseComponent {
	constructor(phrase, containerElement) {
		this.phraseElement = document.createElement('div');
		let headersElement = document.createElement('header');
		let pathElement = document.createElement('p');
		let keyElement = document.createElement('p');
		let itemIdElement = document.createElement('p');
		let fieldIdElement = document.createElement('p');
		let updatedElement = document.createElement('p');
		pathElement.textContent = phrase.path;
		keyElement.textContent = phrase.key;
		itemIdElement.textContent = phrase.itemId;
		fieldIdElement.textContent = phrase.fieldId;
		updatedElement.textContent = phrase.updated;
		headersElement.appendChild(pathElement);
		headersElement.appendChild(keyElement);
		headersElement.appendChild(itemIdElement);
		headersElement.appendChild(fieldIdElement);
		headersElement.appendChild(updatedElement);
		this.phraseElement.appendChild(headersElement);
		this.phraseElement.classList.add('phrase-container');
		containerElement.appendChild(this.phraseElement);
	}
}

class MessageBoxComponent {
	constructor(containerElement) {
		this.containerElement = containerElement;
	}

	info(message) {
		this.clear();
		var messageElement = document.createElement('p');
		messageElement.textContent = message;
		this.containerElement.appendChild(messageElement);
	}

	clear() {
		while (this.containerElement.firstChild) {
			this.containerElement.removeChild(this.containerElement.firstChild);
		}
	}
}
