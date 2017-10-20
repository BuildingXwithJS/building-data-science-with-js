// npm packages
const _ = require('lodash');
const fetch = require('node-fetch');
const jsonld = require('jsonld');
const {promisify} = require('util');

// our packages
const config = require('../config');

// ner ID URI
const nerId = 'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#Phrase';

// clean text function
const cleanText = text =>
  text
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(\w)\.([A-Z0-9_])/g, '$1. $2');

// type extraction function
const toTypeOf = (arr, type) =>
  _.uniqBy(
    arr.filter(it => it.types.includes(type)).map(it => ({
      name: it.values[0],
      url: it.urls[0],
    })),
    'url'
  );

// promisify jsonld.expand
const expandJsonld = promisify(jsonld.expand);

exports.annotate = async text => {
  const json = {
    defaults: 0,
    foxlight: 'OFF',
    input: cleanText(text),
    lang: 'en',
    type: 'text',
    task: 'ner',
    output: 'JSON-LD',
    nif: 0,
    returnHtml: false,
  };

  // send request to fox
  const result = await fetch(config.fox.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  }).then(r => r.json());

  // expand json-ld into array
  const expanded = await expandJsonld(result);

  // get annotations
  const annotations = expanded
    // filter out annotations only
    .filter(it => it['@type'].includes(nerId))
    // convert to sane data structure
    .map(it => ({
      types: _.get(it, 'http://www.w3.org/2005/11/its/rdf#taClassRef', []).map(t => t['@id']),
      values: _.get(it, 'http://persistence.uni-leipzig.org/nlp2rdf/ontologies/nif-core#anchorOf', []).map(
        v => v['@value']
      ),
      urls: _.get(it, 'http://www.w3.org/2005/11/its/rdf#taIdentRef', []).map(v => v['@id']),
    }));

  // add annotations as properties corresponding to type
  return {
    locations: toTypeOf(annotations, 'http://ns.aksw.org/fox/ontology#LOCATION'),
    organizations: toTypeOf(annotations, 'http://ns.aksw.org/fox/ontology#ORGANIZATION'),
    people: toTypeOf(annotations, 'http://ns.aksw.org/fox/ontology#PERSON'),
  };
};
