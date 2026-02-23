# IGKApp

De klasse `IGKApp` is het centrale toegangspunt voor de levenscyclus van de Balafon Framework applicatie.

## Naamruimte

```
IGKApp
```

## Beschrijving

`IGKApp` biedt statische methoden om het framework op te starten, de applicatiestatus te beheren en toegang te krijgen tot globale services. Het is de eerste klasse die wordt geïnstantieerd wanneer een Balafon-applicatie start.

## Methoden

### `boot(array $options = []): void`

Start de applicatie met de opgegeven opties.

```php
IGKApp::boot([
    'env' => 'production',
    'debug' => false,
]);
```

**Parameters:**
| Naam | Type | Beschrijving |
|------|------|--------------|
| `$options` | `array` | Optionele opstartconfiguratie |

---

### `getApplication(): IGKApplication`

Geeft de huidige applicatie-instantie terug.

```php
$app = IGKApp::getApplication();
```

**Geeft terug:** `IGKApplication`

---

### `env(string $key, mixed $default = null): mixed`

Haalt een omgevingsvariabele op via de sleutel.

```php
$debug = IGKApp::env('APP_DEBUG', false);
```

**Parameters:**
| Naam | Type | Beschrijving |
|------|------|--------------|
| `$key` | `string` | Omgevingssleutel |
| `$default` | `mixed` | Standaardwaarde als de sleutel niet bestaat |

**Geeft terug:** `mixed`

---

## Zie ook

- `IGKApplication` — Applicatiecontract
- `IGKAppConfig` — Applicatieconfiguratie
- `IGKAppContext` — Verzoekcontext
