'use strict';

class InputFileReaderListener {
	constructor(parser, mesageBoxComponent, phrasesComponent) {
		this.parser = parser;
		this.messageBoxComponent = messageBoxComponent;
	}

	selectFile(name, size) {
		phrasesComponent.clear();
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
	constructor(phrasesComponent) {
		this.phrasesComponent = phrasesComponent;
	}

	parserError(error) {
		console.error(`Parser error ${error}`);
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
let parserListener = new ParserListener(phrasesComponent);
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
