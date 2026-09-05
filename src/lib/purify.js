'use strict';

const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = require('dompurify')(window);

module.exports = DOMPurify;
