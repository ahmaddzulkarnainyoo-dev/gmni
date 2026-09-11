import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** robots.txt — area internal dilarang diindeks mesin pencari. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dasbor/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}