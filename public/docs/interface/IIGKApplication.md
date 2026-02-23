# IIGKApplication

Contract for all Balafon application implementations.

## Description

`IIGKApplication` defines the minimum set of methods that every Balafon application must implement. It is implemented by `IGKApplicationBase` and all derived application classes.

## Methods

### `boot(array $options = []): void`

Boot the application.

---

### `getController(string $name): IIGKController|null`

Resolve a registered controller by name.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `$name` | `string` | Controller identifier |

**Returns:** `IIGKController|null`

---

### `getServices(): array`

Returns all registered services.

**Returns:** `array`

---

### `terminate(): void`

Gracefully terminate the application.

---

## Implemented By

- `IGKApplicationBase`
- `IGKApplication`
- `IGK\Framework\Application`

## See Also

- `IIGKController` — Controller contract
- `IGKApp` — Static application helper
