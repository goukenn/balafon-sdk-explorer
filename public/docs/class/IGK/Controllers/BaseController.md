# BaseController

The base class for all Balafon controllers.

## Namespace

```
IGK\Controllers
```

## Description

`BaseController` provides the foundational functionality shared by all controllers in the Balafon framework, including request handling, view rendering, and dependency injection support.

## Inheritance

```
IGKObject
  └── IGKApplicationBase
        └── BaseController
              └── ApplicationController
                    └── (your controllers)
```

## Methods

### `render(string $view, array $data = []): string`

Render a view template with the given data.

```php
return $this->render('my-view', ['title' => 'Hello World']);
```

---

### `redirect(string $uri): void`

Redirect the client to a given URI.

```php
$this->redirect('/dashboard');
```

---

### `json(mixed $data, int $status = 200): void`

Send a JSON response.

```php
$this->json(['success' => true, 'message' => 'Done']);
```

---

### `getRequest(): array`

Returns the current HTTP request data.

**Returns:** `array`

---

## See Also

- `ApplicationController`
- `ApiController`
- `IIGKController`
