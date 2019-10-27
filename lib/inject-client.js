import { InjectInitial } from './namespace';

export const Injected = {

	obj(name) {
		const json = document.getElementById(name);
		// Apparently .text doesn't work on some IE's.
		return json ? EJSON.parse(json.innerHTML) : undefined;
	},

	meta(name) {
		return this.metas[name];
	},

	/* internal methods */

	parseMetas() {
		const metaEls = document.getElementsByTagName('meta');
		for (let i = 0; i < metaEls.length; i += 1) this.metas[metaEls[i].getAttribute('id')]				= metaEls[i].getAttribute('content');
	},
	metas: {},
};

Object.assign(InjectInitial, Injected);

InjectInitial.parseMetas();

// deprecated
// Inject = {
// 	getObj: Injected.obj,
// 	getMeta: Injected.meta,
// };
