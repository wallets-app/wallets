(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

const TWOMB = 2097152; // in bytes

function parse (str) {
  if (str === '') return false
  if (str.length > TWOMB) return false // too much json, bro
  try {
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}

var el = document.querySelector('body > pre');

// try to parse
var obj = parse(el.textContent);
if (obj) {
  var json = JSON.stringify(obj, null, 2);
  json = json.replace(/^(\s+)(".+":)/gmi, (v, ws, key) => `${ws}<span style="color: green">${key}</span>`);
  json = json.replace(/<\/span> (".+")/gmi, (v, str) => `</span> <span style="color: #555">${str}</span>`);
  json = json.replace(/^(\s+)(".+")(,?)$/gmi, (v, ws, str, comma) => `${ws}<span style="color: #555">${str}</span>${comma}`);
  json = json.replace(/<\/span> ([0-9]+)/gmi, (v, num) => `</span> <span style="color: blue">${num}</span>`);
  json = json.replace(/^(\s+)([0-9]+)(,?)$/gmi, (v, ws, num, comma) => `${ws}<span style="color: blue">${num}</span>${comma}`);
  json = json.replace(/<\/span> (true|false)/gmi, (v, bool) => `</span> <span style="color: red">${bool}</span>`);
  json = json.replace(/^(\s+)(true|false)(,?)$/gmi, (v, ws, bool, comma) => `${ws}<span style="color: red">${bool}</span>${comma}`);
  el.innerHTML = json;
}

},{}]},{},[1]);
