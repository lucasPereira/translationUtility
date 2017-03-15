'use strict';

class InputFileReaderListener {
	constructor(parser, mesageBoxComponent) {
		this.parser = parser;
		this.messageBoxComponent = messageBoxComponent;
	}

	selectFile(name, size) {
		console.log(name + ' ' + size);
	}

	uploadFileProgress(progress) {
		let percentage = Math.round(progress * 100);
		this.messageBoxComponent.info(`Uploading file (${percentage}%)`)
	}

	uploadFileComplete(content) {
		this.parser.parse(content);
		this.messageBoxComponent.info(`File uploaded with success`);
	}

	uploadFileError(event) {
		console.error(event);
	}
}

class ParserListener {
	constructor(phrasesElement) {
		this.phrasesElement = phrasesElement;
	}

	parserError(error) {
		console.error(`Parser error ${error}`);
	}

	receivePhrases(phrases) {
		phrases.forEach((phrase) => {
			new PhraseComponent(phrase, this.phrasesElement);
		});
	}
}

let messageBoxComponent = new MessageBoxComponent(document.querySelector("#message-box"));
let parserListener = new ParserListener(document.querySelector('#phrases'));
let xmlParser = new XmlParser();
let csvParser = new CsvParser();
let inputFileReaderListenerXml = new InputFileReaderListener(xmlParser, messageBoxComponent);
let inputFileReaderListenerCsv = new InputFileReaderListener(csvParser, messageBoxComponent);
let inputFileReaderXml = new InputFileReader(document.querySelector('#xml-importer'));
let inputFileReaderCsv = new InputFileReader(document.querySelector('#csv-importer'));
inputFileReaderXml.addListener(inputFileReaderListenerXml);
inputFileReaderCsv.addListener(inputFileReaderListenerCsv);
csvParser.addListener(parserListener);
xmlParser.addListener(parserListener);
