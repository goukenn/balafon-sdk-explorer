# igk_app

Retourne l'instance courante de l'application Balafon.

## Signature

```php
function igk_app(): IGKApplication
```

## Description

`igk_app()` est la fonction d'aide globale pour accéder au conteneur d'application. Elle est équivalente à l'appel `IGKApp::getApplication()`.

## Exemple

```php
$app = igk_app();
$controller = $app->getController('mon-controller');
```

## Retourne

`IGKApplication` — L'instance active de l'application.

## Voir aussi

- [`IGKApp`](#/class/IGKApp) — Classe d'application statique
- [`igk_app_version()`](#/function/igk_app_version) — Obtenir la version du framework
- [`igk_app_destroy()`](#/function/igk_app_destroy) — Détruire l'instance de l'application
