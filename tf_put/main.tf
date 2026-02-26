terraform {
  required_providers {
    oci = { source = "oracle/oci" }
  }
}

variable "compartment_id" {}
variable "bucket" { default = "kv_store" }
variable "key"    {}
variable "value"  { default = "" }

data "oci_objectstorage_namespace" "ns" {}

resource "oci_objectstorage_bucket" "kv_store" {
  namespace  = data.oci_objectstorage_namespace.ns.namespace
  compartment_id = var.compartment_id
  name       = var.bucket
  versioning = "Enabled"
}

resource "oci_objectstorage_object" "kv" {
  namespace = data.oci_objectstorage_namespace.ns.namespace
  bucket    = oci_objectstorage_bucket.kv_store.name
  object    = var.key
  content   = var.value
}
