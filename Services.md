# Available microservices

Inputs:
- `opencritic-input-service` - input service that gets data from OpenCritic API

Processing:
- `corenlp-processing-service` - processing service that calculates sentiments for given article using CoreNLP
- `fox-processing-service` - processing service that extracts named entities from given article using FOX
- `keywords-processing-service` - processing service that calculates keywords and keyphrases for given article using retext module
- `summary-processing-service` - processing service that generates summary for given article using node-summary module

Enrichment:
- Wikidata links - ?
- DBpedia info

Utility:
- `storage-service` - storage and processing management microservice

Output:
- REST API
- UI
