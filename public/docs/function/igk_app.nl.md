# igk_app

Geeft de huidige Balafon applicatie-instantie terug.

## Signatuur

```php
function igk_app(): IGKApplication
```

## Beschrijving

`igk_app()` is de globale helperfunctie voor toegang tot de applicatiecontainer. Het is equivalent aan het aanroepen van `IGKApp::getApplication()`.

## Voorbeeld

```php
$app = igk_app();
$controller = $app->getController('mijn-controller');
```

## Geeft terug

`IGKApplication` — De actieve applicatie-instantie.

## Zie ook

- [`IGKApp`](#/class/IGKApp) — Statische applicatieklasse
- [`igk_app_version()`](#/function/igk_app_version) — Frameworkversie opvragen
- [`igk_app_destroy()`](#/function/igk_app_destroy) — De applicatie-instantie vernietigen
