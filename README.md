# OCI Key Value

Key - Value is a fundamental paradigm in configuration. OCI provides two services that may be used to build KV interface. First is an OCI Secret that stores values associated with keys, the second is OCI Object Storage service, which ideally fits KV requirements. Both services support IAM access layer that controls access to the granularity of an object.

## Example

```bash
echo "Lorem ipsum dolor sit amet" > lorem
oci os object put --bucket-name gdir_info --file lorem

oci os object get --bucket-name gdir_info --name lorem --file value
cat value
```

## Scripts

```bash
echo value1 | ./oci_kv_put gdir_info key1
./oci_kv_get gdir_info key1 
```
