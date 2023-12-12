# locals {
#     src_path = "../../src"
#     folder_path = "../dist"
#     gcs_bucket = "www-mystudiopro-com"
# }

## https://waltlabs.io/how-to-upload-folders-to-gcs-using-terraform-v-0-12-x-and-gcp/
# resource "null_resource" "upload_folder_content" {

#  triggers = {
#    file_hashes = jsonencode({
#         for fn in fileset(local.src_path, "**") : fn => filesha256("${local.src_path}/${fn}")
#    })
#  }

#  provisioner "local-exec" {
#     # delete and replace files in bucket
#     command = <<EOT
#         cd ..
#         yarn build
#         gsutil -m rm -r gs://${local.gcs_bucket}/*
#         gsutil -m cp -r ${local.folder_path}/* gs://${local.gcs_bucket}/
#         cd ./terraform
#     EOT
#     # command = "gsutil cp -r ${local.folder_path}/* gs://${local.gcs_bucket}/"
#     # command ="python ../deploy.py --bucket ${local.gcs_bucket} --dir ${local.folder_path}"
#  }

# }
 