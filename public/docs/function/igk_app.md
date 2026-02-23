# igk_app

Returns the current Balafon application instance.

## Signature

```php
function igk_app(): IGKApplication
```

## Description

`igk_app()` is the global helper to access the application container. It is equivalent to calling `IGKApp::getApplication()`.

## Example

```php
$app = igk_app();
$controller = $app->getController('my-controller');
```

## Returns

`IGKApplication` — The active application instance.

## See Also

- [`IGKApp`](#/class/IGKApp) — Static application class
- [`igk_app_version()`](#/function/igk_app_version) — Get the framework version
- [`igk_app_destroy()`](#/function/igk_app_destroy) — Destroy the application instance
