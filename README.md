# OCI Key Value

Key-Value is a fundamental paradigm in configuration. OCI provides two services that may be used to build a KV interface. First is an OCI Secret that stores values associated with keys, the second is the OCI Object Storage service, which ideally fits KV requirements. Both services support an IAM access layer that controls access to the granularity of an object and object versioning.

## Example

The example below demonstrates how to use OCI Object Storage for KV purposes. It creates a KV bucket to execute a series of put, get, and delete operations using OCI CLI, bash, Node.js, and Terraform. It's assumed that the user has full access to the tenancy; if not, set `compartment_ocid` to a proper value.

Exemplary code assumes that [OCI CLI is installed](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm) and an [access profile is defined](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliconfigure.htm).

### Create bucket

```bash
tenancy_ocid=$(oci iam availability-domain list --query 'data[0]."compartment-id"' --raw-output)

# change here to your compartment
compartment_ocid=$tenancy_ocid
oci os bucket create --compartment-id $compartment_ocid --name kv_store --versioning Enabled
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
export TF_VAR_compartment_id=$(oci iam availability-domain list --query 'data[0]."compartment-id"' --raw-output)
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

Access control may be defined down to the resource level using wildcards. Moreover it's possible to specify any policy. Having both options, one bucket may be safely shared among different user groups to maintain the KV. Of course each group or service may use a dedicated bucket, which may simplify IAM policies.

Announcing object level granular access control for OCI Object Storage: [Object-level granular access](https://blogs.oracle.com/cloud-infrastructure/object-level-granular-access-oci-object-storage)

Deny policies: [IAM deny policy syntax](https://docs.oracle.com/en-us/iaas/Content/Identity/policysyntax/denypolicies.htm)

## Encryption

Each bucket may be encrypted using a customer managed encryption key (MEK), which makes Object Storage equivalent to OCI Secret at a security level.

## Versioning

Object Storage may version objects, meaning that when a new object is written with an existing key name, the previous value is preserved as a prior version. Users may access any historical version of a key's value by providing its version identifier.

```bash
# write and save the version id
echo -n "version 1" | ./oci_kv_put ver1
version_id=$(oci os object list-object-versions --bucket-name kv_store --prefix ver1 \
  --query 'data[?name==`ver1`]|[-1]."version-id"' --raw-output)

echo -n "version 2" | ./oci_kv_put ver1

# get latest version
./oci_kv_get ver1

# list versions
oci os object list-object-versions --bucket-name kv_store --prefix ver1 \
  --query 'data[?name==`ver1`].{version:"version-id", modified:"time-modified"}'

# get intended version
oci os object get --bucket-name kv_store --name ver1 --version-id "$version_id" --file /dev/stdout
```

The above requires a little effort, but it is intended to be used in special situations.

## Cloud events

OCI Object Storage emits events for every object operation. These events can trigger OCI Functions, Notifications, or Streaming pipelines, enabling reactive architectures on top of the KV store.

Relevant event types:

- `com.oraclecloud.objectstorage.createobject` — fired on `put` (key created or updated)
- `com.oraclecloud.objectstorage.updateobject` — fired on metadata update
- `com.oraclecloud.objectstorage.deleteobject` — fired on `delete`

Each event payload includes the bucket name, object name, namespace, and event time, making it straightforward to route events by key prefix using OCI Events rule conditions.

OCI Events service documentation: [Events Overview](https://docs.oracle.com/en-us/iaas/Content/Events/Concepts/eventsoverview.htm)

## Replication

OCI Object Storage supports automatic cross-region replication at the bucket level. Once a replication policy is set on the source bucket, every object put or delete is asynchronously replicated to the target bucket in another region. One target is supported.

```bash
# enable replication to a target region
oci os replication create-replication-policy \
  --bucket-name kv_store \
  --name kv_store_replication \
  --destination-region eu-frankfurt-1 \
  --destination-bucket kv_store
```

Objects in the destination bucket are read-only — writes must go to the source bucket. Replication is useful for disaster recovery and read-latency reduction in multi-region deployments.

OCI Object Storage replication documentation: [Using Replication](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/usingreplication.htm)

## OCI Vault Secrets considerations

OCI Vault Secrets is the native OCI service for storing sensitive values. The table below compares it with the Object Storage KV approach described in this document.

| Feature | OCI Object Storage KV | OCI Vault Secrets |
| --- | --- | --- |
| **Primary purpose** | General-purpose KV store | Secrets management (credentials, keys, tokens) |
| **Value size** | Up to 10 GiB per object | Up to 25 KiB per secret |
| **Versioning** | Built-in, unlimited versions | Built-in, up to 100 versions per secret |
| **Access control** | IAM policy down to object name (wildcard) | IAM policy down to individual secret |
| **Encryption** | Oracle-managed or customer-managed key (MEK) | Always encrypted; customer-managed key via Vault |
| **Secret rotation** | Manual (put new value) | Automated rotation via functions |
| **Expiry / lifecycle** | Object lifecycle rules (time-based deletion) | Secret expiry date, auto-disable/delete |
| **Audit** | OCI Audit log | OCI Audit log |
| **Cloud Events** | Object create/update/delete via OCI Events service | Secret create/update/delete and expiry events via OCI Events service |
| **CLI put** | `oci os object put` | `oci vault secret create-base64` |
| **CLI get** | `oci os object get` | `oci secrets secret-bundle get` |
| **Replication** | Cross-region replication via replication policies to one region | Per-secret cross-region replication to up to 3 regions; replicas are read-only |
| **Cost** | Object Storage pricing (per GiB + requests) | Vault pricing (per secret version per month) |

## When to use Object Storage KV

- Values are large (configs, certificates, binary blobs)
- Many keys with wildcard-based access control per key prefix
- Simple put/get interface without secret lifecycle overhead
- Cost-sensitive workloads with many keys

## When to use OCI Vault Secrets

- Storing credentials, API keys, passwords, or tokens
- Automated secret rotation is required
- Strict expiry and lifecycle management is needed
- Compliance requirements mandate a dedicated secrets manager
