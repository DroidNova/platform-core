# Module Groups

Modules are grouped by product boundary so the reusable platform foundation stays separate from future domain-specific code.

## `platform-core/`

Contains the reusable modules that belong to this backend foundation:

- `auth/`
- `admin/`
- `users/`
- `roles/`
- `permissions/`
- `sessions/`
- `health/`
- `settings/`

## Future domain groups

When this repository is reused for a domain website or product, create a sibling folder under `src/modules/`, for example:

```text
src/modules/
  platform-core/
  domain/
    orders/
    products/
    reports/
```

Keep domain-specific modules in the domain folder and wire them into `AppModule` separately from the platform-core modules.
