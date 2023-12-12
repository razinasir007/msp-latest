# https://registry.terraform.io/modules/gruntwork-io/static-assets/google/latest/submodules/http-load-balancer-website
module "static-assets_http-load-balancer-website" {
  source  = "gruntwork-io/static-assets/google//modules/http-load-balancer-website"
  version = "0.6.0"
  # insert the 2 required variables here
  project = var.projectId
  create_dns_entry = true
  website_domain_name = "www.mystudiopro.com"
  dns_managed_zone_name =  google_dns_managed_zone.mystudiopro-zone[0].name
  force_destroy_website = true
  force_destroy_access_logs_bucket = true
}
