import { InjectInitial } from './namespace';

function escapeReplaceString(str) {
	/*
   * When using string.replace(str, newSubStr), the dollar sign ("$") is
   * considered a special character in newSubStr, and needs to be escaped
   * as "$$".  We have to do this twice, for escaping the newSubStr in
   * this function, and for the resulting string which is passed back.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
   */
	return str.replace(/\$/g, '$$$$');
}

const InjectInitialFunctions = {
	// stores in a script type=application/ejson tag, accessed with Injected.obj('id')
	obj(id, data, res) {
		this._checkForObjOrFunction(data,
			'InjectInitial.obj(id, data [,res]) expects `data` to be an Object or Function');

		if (res) {
			this._resAssign(res, 'objList', id, data);
		} else {
			this.objList[id] = data;
		}
	},
	objList: {},

	// Inserts a META called `id`, whose `content` can be accessed with Injected.meta()
	meta(id, data, res) {
		this._checkForTextOrFunction(data,
			'InjectInitial.meta(id, data [,res]) expects `data` to be an String or Function');

		if (res) {
			this._resAssign(res, 'metaList', id, data);
		} else {
			this.metaList[id] = data;
		}
	},
	metaList: {},

	rawHead(id, textOrFunc, res) {
		this._checkForTextOrFunction(textOrFunc,
			'InjectInitial.rawHead(id, content [,res]) expects `content` to be an String or Function');

		if (res) {
			this._resAssign(res, 'rawHeads', id, textOrFunc);
		} else {
			this.rawHeads[id] = textOrFunc;
		}
	},
	rawHeads: {},

	rawBody(id, textOrFunc, res) {
		this._checkForTextOrFunction(textOrFunc,
			'InjectInitial.rawBody(id, content [,res]) expects `content` to be an String or Function');

		if (res) {
			this._resAssign(res, 'rawBodies', id, textOrFunc);
		} else {
			this.rawBodies[id] = textOrFunc;
		}
	},
	rawBodies: {},

	// The callback receives the entire HTML page and must return a modified version
	rawModHtml(id, func) {
		if (!_.isFunction(func)) {
			const message = `InjectInitial func id "${id}" should be a function, not ${typeof (func)}`;
			throw new Error(message);
		}

		this.rawModHtmlFuncs[id] = func;
	},
	rawModHtmlFuncs: {},

	_injectObjects(html, res) {
		const objs = _.extend({}, InjectInitial.objList, res.InjectInitial && res.InjectInitial.objList);
		if (_.isEmpty(objs)) {
			return html;
		}

		let obj; let
			injectHtml = '';
		for (id in objs) {
			obj = _.isFunction(objs[id]) ? objs[id](res) : objs[id];
			injectHtml += `  <script id='${id.replace("'", '&apos;')
			}' type='application/ejson'>${EJSON.stringify(obj)
			}</script>\n`;
		}

		return html.replace('<head>', `<head>\n${escapeReplaceString(injectHtml)}`);
	},

	_injectMeta(html, res) {
		const metas = _.extend({}, InjectInitial.metaList, res.Inject && res.InjectInitial.metaList);
		if (_.isEmpty(metas)) return html;

		let injectHtml = '';
		for (id in metas) {
			const meta = this._evalToText(metas[id], res, html);
			injectHtml += `  <meta id='${id.replace("'", '&apos;')
			}' content='${meta.replace("'", '&apos;')}'>\n`, res;
		}

		return html.replace('<head>', `<head>\n${escapeReplaceString(injectHtml)}`);
	},

	_injectHeads(html, res) {
		const heads = _.extend({}, InjectInitial.rawHeads, res.InjectInitial && res.InjectInitial.rawHeads);
		if (_.isEmpty(heads)) return html;

		let injectHtml = '';
		for (id in heads) {
			const head = this._evalToText(heads[id], res, html);
			injectHtml += `${head}\n`;
		}

		return html.replace('<head>', `<head>\n${escapeReplaceString(injectHtml)}`);
	},

	_injectBodies(html, res) {
		const bodies = _.extend({}, InjectInitial.rawBodies, res.InjectInitial && res.InjectInitial.rawBodies);
		if (_.isEmpty(bodies)) return html;

		let injectHtml = '';
		for (id in bodies) {
			const body = this._evalToText(bodies[id], res, html);
			injectHtml += `${body}\n`;
		}

		return html.replace('<body>', `<body>\n${escapeReplaceString(injectHtml)}`);
	},

	// ensure object exists and store there
	_resAssign(res, key, id, value) {
		if (!res.InjectInitial) res.InjectInitial = {};
		if (!res.InjectInitial[key]) res.InjectInitial[key] = {};
		res.InjectInitial[key][id] = value;
	},

	_checkForTextOrFunction(arg, message) {
		if (!(_.isString(arg) || _.isFunction(arg))) {
			throw new Error(message);
		}
	},

	_checkForObjOrFunction(arg, message) {
		if (!(_.isObject(arg) || _.isFunction(arg))) {
			throw new Error(message);
		}
	},

	// we don't handle errors here. Let them to handle in a higher level
	_evalToText(textOrFunc, res, html) {
		if (_.isFunction(textOrFunc)) {
			return textOrFunc(res, html);
		} else {
			return textOrFunc;
		}
	},
};

Object.assign(InjectInitial, InjectInitialFunctions);

InjectInitial.rawModHtml('injectHeads', InjectInitial._injectHeads.bind(InjectInitial));
InjectInitial.rawModHtml('injectMeta', InjectInitial._injectMeta.bind(InjectInitial));
InjectInitial.rawModHtml('injectBodies', InjectInitial._injectBodies.bind(InjectInitial));
InjectInitial.rawModHtml('injectObjects', InjectInitial._injectObjects.bind(InjectInitial));
