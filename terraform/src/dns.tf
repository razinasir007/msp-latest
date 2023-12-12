locals {
  isprod = var.env == "production" ? 1 : 0
}

resource "google_dns_managed_zone" "mystudiopro-zone" {
  count = local.isprod
  name     = "mystudiopro-zone"
  dns_name = "mystudiopro.com."
}

resource "google_dns_record_set" "a" {
  count = local.isprod
  managed_zone = google_dns_managed_zone.mystudiopro-zone[0].name
  name    = "www.${google_dns_managed_zone.mystudiopro-zone[0].dns_name}"
  type    = "A"
  rrdatas = [
    module.static-assets_http-load-balancer-website.load_balancer_ip_address
  ]
  ttl     = 300
}

resource "google_dns_record_set" "mx" {
  count = local.isprod
  name         = google_dns_managed_zone.mystudiopro-zone[0].dns_name
  managed_zone = google_dns_managed_zone.mystudiopro-zone[0].name
  type         = "MX"
  ttl          = 3600

  rrdatas = [
    "1 aspmx.l.google.com.",
    "5 alt1.aspmx.l.google.com.",
    "5 alt2.aspmx.l.google.com.",
    "10 alt3.aspmx.l.google.com.",
    "10 alt4.aspmx.l.google.com.",
  ]
}