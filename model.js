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
