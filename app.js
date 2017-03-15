'use strict';

class InputFileReaderListener {
	constructor(parser, mesageBox) {
		this.parser = parser;
		this.messageBox = messageBox;
	}

	selectFile(name, size) {
		console.log(name + ' ' + size);
	}

	uploadFileProgress(progress) {
		let percentage = Math.round(progress * 100);
		this.messageBox.info(`Uploading file (${percentage}%)`)
	}

	uploadFileComplete(content) {
		this.parser.parse(content);
		this.messageBox.info(`File uploaded with success`);
	}

	uploadFileError(event) {
		console.error(event);
	}
}

class ParserListener {
	parserError(error) {
		console.error(`Parser error ${error}`);
	}

	receivePhrases(phrases) {
		console.log(phrases);
	}
}

let messageBox = new MessageBox(document.querySelector("#message-box"));
let parserListener = new ParserListener();
let xmlParser = new XmlParser();
let csvParser = new CsvParser();
let inputFileReaderListenerXml = new InputFileReaderListener(xmlParser, messageBox);
let inputFileReaderListenerCsv = new InputFileReaderListener(csvParser, messageBox);
let inputFileReaderXml = new InputFileReader(document.querySelector('#xml-importer'));
let inputFileReaderCsv = new InputFileReader(document.querySelector('#csv-importer'));
inputFileReaderXml.addListener(inputFileReaderListenerXml);
inputFileReaderCsv.addListener(inputFileReaderListenerCsv);
csvParser.addListener(parserListener);
xmlParser.addListener(parserListener);
