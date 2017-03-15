'use strict';

class XmlParser {
	constructor() {
		this.listeners = [];
		this.locales = ['en', 'es-ES', 'fr-FR', 'de-DE'];
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
			this.locales.forEach((locale) => {
				let translationXml = xmlPhrase.querySelector(locale);
				let translation = translationXml ? translationXml.textContent : '';
				let phraseTranslation = new PhraseTranslation(locale, translation);
				phrase.addTranslation(phraseTranslation);
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


class XmlUnparser {
	unparse(phrases) {
		let xml = document.implementation.createDocument("", "", null);
		let xmlSitecore = xml.createElement('sitecore');
		phrases.forEach((phrase) => {
			let xmlPhrase = xml.createElement('phrase');
			xmlPhrase.setAttribute('path', phrase.path);
			xmlPhrase.setAttribute('key', phrase.key);
			xmlPhrase.setAttribute('itemid', phrase.itemId);
			xmlPhrase.setAttribute('fieldid', phrase.fieldId);
			xmlPhrase.setAttribute('updated', phrase.updated);
			phrase.translations.forEach((translation) => {
				let xmlTranslation = xml.createElement(translation.locale);
				let xmlTranslationText = xml.createTextNode(translation.translation);
				xmlTranslation.appendChild(xmlTranslationText);
				xmlPhrase.appendChild(xmlTranslation);
			});
			xmlSitecore.appendChild(xmlPhrase);
		});
		xml.appendChild(xmlSitecore);
		let serializer = new XMLSerializer();
		return serializer.serializeToString(xml);
	}
}

class CsvUnparser {
	unparse(phrases) {
		let csv = phrases.map((phrase) => {
			let csvPhrase = {
				path: phrase.path,
				key: phrase.key,
				itemid: phrase.itemId,
				fieldid: phrase.fieldId,
				updated: phrase.updated,
			};
			phrase.translations.forEach((translation) => {
				csvPhrase[translation.locale] = translation.translation;
			});
			return csvPhrase;
		});
		return Papa.unparse(csv);
	}
}
