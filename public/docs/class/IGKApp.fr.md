# IGKApp

La classe `IGKApp` est le point d'entrée central du cycle de vie de l'application Balafon Framework.

## Espace de noms

```
IGKApp
```

## Description

`IGKApp` fournit des méthodes statiques pour démarrer le framework, gérer l'état de l'application et accéder aux services globaux. C'est la première classe instanciée au démarrage d'une application Balafon.

## Méthodes

### `boot(array $options = []): void`

Démarre l'application avec les options données.

```php
IGKApp::boot([
    'env' => 'production',
    'debug' => false,
]);
```

**Paramètres :**
| Nom | Type | Description |
|-----|------|-------------|
| `$options` | `array` | Configuration de démarrage (optionnel) |

---

### `getApplication(): IGKApplication`

Retourne l'instance courante de l'application.

```php
$app = IGKApp::getApplication();
```

**Retourne :** `IGKApplication`

---

### `env(string $key, mixed $default = null): mixed`

Récupère une variable d'environnement par sa clé.

```php
$debug = IGKApp::env('APP_DEBUG', false);
```

**Paramètres :**
| Nom | Type | Description |
|-----|------|-------------|
| `$key` | `string` | Clé de l'environnement |
| `$default` | `mixed` | Valeur par défaut si la clé n'existe pas |

**Retourne :** `mixed`

---

## Voir aussi

- `IGKApplication` — Contrat d'application
- `IGKAppConfig` — Configuration de l'application
- `IGKAppContext` — Contexte de la requête
