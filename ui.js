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
		this.input.setAttribute("disabled", true);
	}

	resetInput() {
		this.input.removeAttribute("disabled");
		this.input.setAttribute("value", null);
		this.input.value = null;
	}
}

class MessageBox {
	constructor(box) {
		this.box = box;
	}

	info(message) {
		this.clear();
		var messageElement = document.createElement('p');
		messageElement.textContent = message;
		this.box.appendChild(messageElement);
	}

	clear() {
		while (this.box.firstChild) {
			this.box.removeChild(this.box.firstChild);
		}
	}
}
