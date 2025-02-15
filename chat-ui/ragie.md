# Set RAGIE_API_KEY which is used in the rest of this guide
export RAGIE_API_KEY=tnt_24ZKeWdQZ4x_kKzyU6KZ7TYPFK3o2Zuhz92kWIJ2cSc6nGPctRLKd6I


# Download a sample file
curl https://raw.githubusercontent.com/ragieai/ragie-examples/main/data/podcasts/E162-Live-from-Davos-Milei-goes-viral-Adam-Neumanns-headwinds-streamings-broken-model-more.txt > transcript.txt


# Upload the file
curl -X POST https://api.ragie.ai/documents \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -H "Content-type: multipart/form-data" \
  -F 'metadata={"scope": "tutorial"}' \
  -F "file=@transcript.txt" \
  -F mode=fast


# Retriveing chunks
curl -X POST https://api.ragie.ai/retrievals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "query": "chamath davos",
    "rerank": true,
    "filter": {"scope": "tutorial"}
  }'


# Generate an answer

curl -X POST https://api.ragie.ai/tutorial/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAGIE_API_KEY" \
  -d '{
    "query": "what does chamath think about davos?",
    "rerank": true,
    "filter": {"scope": "tutorial"}
  }'