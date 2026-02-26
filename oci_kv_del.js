#!/usr/bin/env node
// Usage: node oci_kv_del.js <key>
// Bucket from OCI_KV_STORE env var (default: kv_store)

const os = require("oci-objectstorage");
const common = require("oci-common");

const bucket = process.env.OCI_KV_STORE || "kv_store";
const key = process.argv[2];
if (!key) { console.error("Usage: oci_kv_del <key>"); process.exit(1); }

const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider()
});

async function main() {
  const ns = (await client.getNamespace({})).value;
  await client.deleteObject({ namespaceName: ns, bucketName: bucket, objectName: key });
}

main().catch(err => { console.error(err.message); process.exit(1); });
