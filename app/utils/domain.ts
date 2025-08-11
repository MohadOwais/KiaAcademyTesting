// app/utils/domain.ts
"use client";

let isSubdomain = false;
let subdomain: string | null = null;
let domain: string | null = null;

if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const parts = host.split(".");

  if (host.endsWith("localhost")) {
    if (parts.length === 2 && parts[0] !== "localhost") {
      isSubdomain = true;
      subdomain = parts[0];
      domain = "localhost";
    } else if (parts.length > 2) {
      isSubdomain = true;
      subdomain = parts.slice(0, parts.length - 1).join(".");
      domain = "localhost";
    } else {
      isSubdomain = false;
      domain = "localhost";
    }
  } else {
    if (parts.length > 2 && parts[0] !== "www") {
      isSubdomain = true;
      subdomain = parts.slice(0, parts.length - 2).join(".");
      domain = parts.slice(-2).join(".");
    } else {
      isSubdomain = false;
      domain = parts.slice(-2).join(".");
    }
  }
}

console.log("isSubdomain:", isSubdomain);

// ✅ Export as constants
export { isSubdomain, subdomain, domain };
