terraform {
  required_providers {
    oci = { source = "oracle/oci" }
  }
}

variable "bucket" { default = "kv_store" }
variable "key"    {}
variable "value"  { default = "" }

data "oci_objectstorage_namespace" "ns" {}

resource "oci_objectstorage_object" "kv" {
  namespace = data.oci_objectstorage_namespace.ns.namespace
  bucket    = var.bucket
  object    = var.key
  content   = var.value
}
