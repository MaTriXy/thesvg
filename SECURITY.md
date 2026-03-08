# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in theSVG, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email: **hello@thesvg.org**

We will acknowledge receipt within 48 hours and provide a detailed response
within 5 business days.

## Scope

The following are in scope:

- The `@the-svg/icons` and `thesvg` npm packages
- The thesvg.org website
- The build and publish pipeline
- SVG content that contains malicious payloads (script tags, event handlers, etc.)

## Out of Scope

- Third-party integrations or extensions
- Issues in upstream icon sources

## SVG Security

All SVG files in this package are automatically scanned for:

- Embedded `<script>` tags
- Inline event handlers (`onload`, `onerror`, etc.)
- `javascript:` URIs
- `eval()` or `new Function()` in generated code

See `packages/icons/scripts/security-audit.mjs` for details.
