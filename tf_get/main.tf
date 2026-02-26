terraform {
  required_providers {
    oci = { source = "oracle/oci" }
  }
}

variable "bucket" { default = "kv_store" }
variable "key"    {}

data "oci_objectstorage_namespace" "ns" {}

data "oci_objectstorage_object" "kv" {
  namespace = data.oci_objectstorage_namespace.ns.namespace
  bucket    = var.bucket
  object    = var.key
}

output "value" {
  value = data.oci_objectstorage_object.kv.content
}
