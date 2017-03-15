'use strict';

class InputFileReaderListener {
	constructor(parser, mesageBoxComponent, phrasesComponent, exporters) {
		this.parser = parser;
		this.messageBoxComponent = messageBoxComponent;
		this.phrasesComponent = phrasesComponent;
		this.exporters = exporters;
	}

	selectFile(name, size) {
		this.messageBoxComponent.clear();
		this.phrasesComponent.clear();
		this.exporters.forEach((exporter) => {
			exporter.desactive();
		});
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
	constructor(messageBoxComponent, phrasesComponent, exporters) {
		this.messageBoxComponent = messageBoxComponent;
		this.phrasesComponent = phrasesComponent;
		this.exporters = exporters;
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
		this.exporters.forEach((exporter) => {
			exporter.active(phrases);
		});
	}
}

class Exporter {
	constructor(exportComponent, downloadComponent, unparser) {
		this.exportComponent = exportComponent;
		this.unparser = unparser;
		this.downloadComponent = downloadComponent;
	}

	active(phrases) {
		this.exportComponent.active(() => {
			let unparsed = this.unparser.unparse(phrases);
			this.downloadComponent.downloadTextFile(unparsed);
		});
	}

	desactive() {
		this.exportComponent.desactive();
	}
}

let xmlDownloadComponent = new DownloadComponent('languages_export.xml', 'text/xml');
let csvDownloadComponent = new DownloadComponent('languages_export.csv', 'text/csv');
let xmlUnparser = new XmlUnparser();
let csvUnparser = new CsvUnparser();
let xmlParser = new XmlParser();
let csvParser = new CsvParser();
let xmlExportComponent = new ExportComponent(document.querySelector('#xml-exporter'));
let csvExportComponent = new ExportComponent(document.querySelector('#csv-exporter'));
let xmlExporter = new Exporter(xmlExportComponent, xmlDownloadComponent, xmlUnparser);
let csvExporter = new Exporter(csvExportComponent, csvDownloadComponent, csvUnparser);
let phrasesComponent = new PhrasesComponent(document.querySelector("#phrases"));
let messageBoxComponent = new MessageBoxComponent(document.querySelector("#message-box"));
let parserListener = new ParserListener(messageBoxComponent, phrasesComponent, [xmlExporter, csvExporter]);
let inputFileReaderListenerXml = new InputFileReaderListener(xmlParser, messageBoxComponent, phrasesComponent, [xmlExporter, csvExporter]);
let inputFileReaderListenerCsv = new InputFileReaderListener(csvParser, messageBoxComponent, phrasesComponent, [xmlExporter, csvExporter]);
let inputFileReaderXml = new InputFileReader(document.querySelector('#xml-importer'));
let inputFileReaderCsv = new InputFileReader(document.querySelector('#csv-importer'));
inputFileReaderXml.addListener(inputFileReaderListenerXml);
inputFileReaderCsv.addListener(inputFileReaderListenerCsv);
csvParser.addListener(parserListener);
xmlParser.addListener(parserListener);
