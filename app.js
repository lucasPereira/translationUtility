'use strict';

class InputFileReaderListener {
	constructor(parser, mesageBoxComponent, phrasesComponent) {
		this.parser = parser;
		this.messageBoxComponent = messageBoxComponent;
		this.phrasesComponent = phrasesComponent;
	}

	selectFile(name, size) {
		this.messageBoxComponent.clear();
		this.phrasesComponent.clear();
	}

	uploadFileProgress(progress) {
		let percentage = Math.round(progress * 100);
		this.messageBoxComponent.info(`Uploading file (${percentage}%)`)
	}

	uploadFileComplete(content) {
		this.messageBoxComponent.info(`File uploaded with success`);
		this.parser.parse(content);
	}

	uploadFileError(error) {
		this.messageBoxComponent.error(`File uploaded failure`);
		console.error(error);
	}
}

class ParserListener {
	constructor(messageBoxComponent, phrasesComponent) {
		this.messageBoxComponent = messageBoxComponent;
		this.phrasesComponent = phrasesComponent;
	}

	parserError(error) {
		this.messageBoxComponent.error(`Parser error. Please, make sure the file is in valid format.`);
		console.error(error);
	}

	receivePhrases(phrases) {
		phrases.forEach((phrase) => {
			this.phrasesComponent.createPhraseComponent(phrase, (translation, newValue) => {
				translation.translation = newValue;
			});
		});
	}
}

let phrasesComponent = new PhrasesComponent(document.querySelector("#phrases"));
let messageBoxComponent = new MessageBoxComponent(document.querySelector("#message-box"));
let parserListener = new ParserListener(messageBoxComponent, phrasesComponent);
let xmlParser = new XmlParser();
let csvParser = new CsvParser();
let inputFileReaderListenerXml = new InputFileReaderListener(xmlParser, messageBoxComponent, phrasesComponent);
let inputFileReaderListenerCsv = new InputFileReaderListener(csvParser, messageBoxComponent, phrasesComponent);
let inputFileReaderXml = new InputFileReader(document.querySelector('#xml-importer'));
let inputFileReaderCsv = new InputFileReader(document.querySelector('#csv-importer'));
inputFileReaderXml.addListener(inputFileReaderListenerXml);
inputFileReaderCsv.addListener(inputFileReaderListenerCsv);
csvParser.addListener(parserListener);
xmlParser.addListener(parserListener);
