# OCI Key Value

Key - Value is a fundamental paradigm in configuration. OCI provides two services that may be used to build a KV interface. First is an OCI Secret that stores values associated with keys, the second is OCI Object Storage service, which ideally fits KV requirements. Both services support an IAM access layer that controls access to the granularity of an object.

## Example

### Create bucket

```bash
tenancy_ocid=$(oci iam availability-domain list --query 'data[0]."compartment-id"' --raw-output)
oci os bucket create --compartment-id $tenancy_ocid --name kv_store
```

### Raw OCI CLI

```bash
echo "Hello OCI!" > /tmp/oci1
oci os object put --bucket-name kv_store --file /tmp/oci1

oci os object get --bucket-name kv_store --name oci1 --file /tmp/value
cat /tmp/value

oci os object delete --bucket-name kv_store --name oci1 
rm /tmp/oci1 /tmp/value
```

### Bash

```bash
echo -n "Hello bash!" | ./oci_kv_put bash1
./oci_kv_get bash1
./oci_kv_del bash1
```

### Node.js

```bash
npm install

echo -n "Hello Node.js!" | node oci_kv_put.js node1
node oci_kv_get.js node1
node oci_kv_del.js node1
```

### Terraform

```bash
export TF_VAR_key=tf1
export TF_VAR_value="Hello Terraform!"

# put
cd tf_put && terraform init && terraform apply -auto-approve && cd ..

# get
cd tf_get && terraform init && terraform apply -auto-approve && cd ..

# delete
cd tf_put && terraform destroy -auto-approve && cd ..
```

## Access control

Access control may be defined down to resource level using wildcards. Moreover it's possible to specify any policy. Having both, one bucket may be safely shared among different user groups to maintain the KV. Of course each group or service may use a dedicated bucket, which may simplify IAM policies.

Announcing object level granular access control for OCI Object Storage, https://blogs.oracle.com/cloud-infrastructure/object-level-granular-access-oci-object-storage

Deny policies, https://docs.oracle.com/en-us/iaas/Content/Identity/policysyntax/denypolicies.htm
