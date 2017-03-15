'use strict';

class PhraseTranslation {
	constructor(locale, translation) {
		this.locale = locale;
		this.translation = translation;
	}
}

class Phrase {
	constructor(path, key, itemId, fieldId, updated) {
		this.path = path;
		this.key = key;
		this.itemId = itemId;
		this.fieldId = fieldId;
		this.updated = updated;
		this.translations = [];
	}

	addTranslation(translation) {
		this.translations.push(translation);
	}
}

class XmlParser {
	constructor() {
		this.listeners = [];
	}

	addListener(listener) {
		this.listeners.push(listener);
	}

	parse(plainText) {
		let parser = new DOMParser();
		let xml = parser.parseFromString(plainText, "application/xml");
		let error = xml.querySelector('parsererror');
		if (error !== null) {
			this.listeners.forEach((listener) => listener.parserError(error.textContent));
			return;
		}
		let phrases = [];
		let xmlPhrases = xml.querySelectorAll('phrase');
		xmlPhrases.forEach((xmlPhrase) => {
			let path = xmlPhrase.getAttribute('path');
			let key = xmlPhrase.getAttribute('key');
			let itemId = xmlPhrase.getAttribute('itemid');
			let fieldId = xmlPhrase.getAttribute('fieldid');
			let updated = xmlPhrase.getAttribute('updated');
			let phrase = new Phrase(path, key, itemId, fieldId, updated);
			xmlPhrase.childNodes.forEach((translationXml) => {
				if (translationXml.nodeType === Node.ELEMENT_NODE) {
					let locale = translationXml.nodeName;
					let translation = translationXml.textContent;
					let phraseTranslation = new PhraseTranslation(locale, translation);
					phrase.addTranslation(phraseTranslation);
				}
			});
			phrases.push(phrase);
		});
		this.listeners.forEach((listener) => listener.receivePhrases(phrases));
	}
}

class CsvParser {
	constructor() {
		this.listeners = [];
		this.locales = ['en', 'es-ES', 'fr-FR', 'de-DE'];
	}

	addListener(listener) {
		this.listeners.push(listener);
	}

	parse(plainText) {
		Papa.parse(plainText, {
			header: true,
			skipEmptyLines: true,
			error: (error, file, element, reason) => {
				this.listeners.forEach((listener) => listener.parseError(reason));
			},
			complete: (csv) => {
				if (csv.errors.length > 0) {
					let errorMessage = csv.errors.reduce((message, current) => {
						message += current.row + ' ' + current.message + '\n';
						return message;
					}, '');
					this.listeners.forEach((listener) => listener.parserError(errorMessage));
					return;
				}
				let phrases = [];
				csv.data.forEach((csvPhrase) => {
					let path = csvPhrase['path'];
					let key = csvPhrase['key'];
					let itemId = csvPhrase['itemid'];
					let fieldId = csvPhrase['fieldid'];
					let updated = csvPhrase['updated'];
					let phrase = new Phrase(path, key, itemId, fieldId, updated);
					this.locales.forEach((locale) => {
						let phraseTranslation = new PhraseTranslation(locale, csvPhrase[locale])
						phrase.addTranslation(phraseTranslation);
					});
					phrases.push(phrase);
				});
				this.listeners.forEach((listener) => listener.receivePhrases(phrases));
			}
		});
	}
}
