# IGKApp

The `IGKApp` class is the central entry point for the Balafon Framework application lifecycle.

## Namespace

```
IGKApp
```

## Description

`IGKApp` provides static methods to boot the framework, manage the application state, and access global services. It is the first class instantiated when a Balafon application starts.

## Methods

### `boot(array $options = []): void`

Boots the application with the given options.

```php
IGKApp::boot([
    'env' => 'production',
    'debug' => false,
]);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `$options` | `array` | Optional boot configuration |

---

### `getApplication(): IGKApplication`

Returns the current application instance.

```php
$app = IGKApp::getApplication();
```

**Returns:** `IGKApplication`

---

### `env(string $key, mixed $default = null): mixed`

Retrieves an environment variable by key.

```php
$debug = IGKApp::env('APP_DEBUG', false);
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `$key` | `string` | Environment key |
| `$default` | `mixed` | Default value if key not found |

**Returns:** `mixed`

---

## See Also

- `IGKApplication` — Application contract
- `IGKAppConfig` — Application configuration
- `IGKAppContext` — Request context
