"""data.gov.in ingestion (official statistics / datasets).

NOT IMPLEMENTED for the prototype: SchemeSetu currently serves scheme terms, not statistics, and no fabricated
statistics are ever returned. Not every data.gov.in dataset has an API; many are downloadable files. When needed,
implement `DataGovIngestor(SourceIngestor)` that downloads a specific resource, validates its schema, and stores
rows with Provenance (resource URL, resource id, updated date).
"""
