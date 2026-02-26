# OCI Key Value

Key - Value is a fundamental paradigm in configuration. OCI provides two services that may be used to build KV interface. First is an OCI Secret that stores values associated with keys, the second is OCI Object Storage service, which ideally fits KV requirements. Both services support IAM access layer that controls access to the granularity of an object.

## Example

Create bucket.

```bash
tenency_ocid=$(oci os ns get-metadata --query 'data."default-s3-compartment-id"' --raw-output)
oci os bucket create --compartment-id $tenency_ocid --name kv_store
```

Put and get data.

```bash
echo "Lorem ipsum dolor sit amet" > lorem
oci os object put --bucket-name kv_store --file lorem

oci os object get --bucket-name kv_store --name lorem --file value
cat value
```

## Scripts

### Bash

```bash
echo "Hello bash!" | ./oci_kv_put bash1
./oci_kv_get bash1 
```

### Node.js

```bash
npm install

echo "Hello Node.js!" | node oci_kv_put.js node1
node oci_kv_get.js node1
```
