#!/usr/bin/env node
// Usage: echo "value" | node oci_kv_put.js <key>
// Bucket from OCI_KV_STORE env var (default: kv_store)

const os = require("oci-objectstorage");
const common = require("oci-common");

const bucket = process.env.OCI_KV_STORE || "kv_store";
const key = process.argv[2];
if (!key) { console.error("Usage: oci_kv_put <key>"); process.exit(1); }

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider()
});

async function main() {
  const ns = (await client.getNamespace({})).value;
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  await client.putObject({ namespaceName: ns, bucketName: bucket, objectName: key, putObjectBody: body, contentLength: body.length });
}

main().catch(err => { console.error(err.message); process.exit(1); });
