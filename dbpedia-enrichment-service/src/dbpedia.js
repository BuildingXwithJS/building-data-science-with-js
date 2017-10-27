// npm packages
const fetch = require('node-fetch');

const dbpediaBase =
  'http://dbpedia.org/sparql/?' +
  encodeURIComponent('default-graph-uri=http://dbpedia.org') +
  encodeURIComponent('&format=application/sparql-results+json') +
  encodeURIComponent('&timeout=30000');

const sleep = time => new Promise(r => setTimeout(r, time));

const urlToQuery = url => `
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix dbo: <http://dbpedia.org/ontology/>

select distinct ?abstract ?externalLink ?label where {
  <${url}> rdfs:label ?label .
  <${url}> dbo:abstract ?abstract .
  <${url}> dbo:wikiPageExternalLink ?externalLink .

  FILTER (lang(?label) = 'en')
  FILTER (lang(?abstract) = 'en')
} LIMIT 100
`;

module.exports = async ({locations = [], organizations = [], people = []}) => {
  const locationsUrls = locations.map(loc => loc.url);
  const orgUrls = organizations.map(org => org.url);
  const peopleUrls = people.map(p => p.url);
  const entitiesUrls = locationsUrls.concat(orgUrls).concat(peopleUrls);
  const dbpediaUrls = entitiesUrls.filter(url => url.includes('dbpedia.org'));

  const dbpediaEntities = [];

  for (let i = 0; i < dbpediaUrls.length; i++) {
    const url = dbpediaUrls[i];
    const query = urlToQuery(url);
    const requestUrl = `${dbpediaBase}&query=${encodeURIComponent(query)}`;
    const {results: {bindings: res}} = await fetch(requestUrl, {
      headers: {Accept: 'application/sparql-results+json'},
    }).then(r => r.json());

    const abstracts = new Set();
    const externalLinks = new Set();
    const labels = new Set();
    res.forEach(result => {
      const abstract = result.abstract.value;
      abstracts.add(abstract);
      const externalLink = result.externalLink.value;
      externalLinks.add(externalLink);
      const label = result.label.value;
      labels.add(label);
    });

    const entity = {
      url,
      abstracts: [...abstracts],
      labels: [...labels],
      externalLinks: [...externalLinks],
    };
    dbpediaEntities.push(entity);
    await sleep(1000);
  }

  return {dbpediaEntities};
};
