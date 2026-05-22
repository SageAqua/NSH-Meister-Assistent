-- Angebote are neutral documents and should not be forced into income or expense.
ALTER TABLE IF EXISTS documents
  ALTER COLUMN doc_direction DROP NOT NULL,
  ALTER COLUMN category DROP NOT NULL;
