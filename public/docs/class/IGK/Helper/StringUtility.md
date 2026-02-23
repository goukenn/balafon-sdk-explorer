# StringUtility

Static utility class for common string operations.

## Namespace

```
IGK\Helper
```

## Description

`StringUtility` provides a collection of static helper methods for string manipulation — useful for formatting, sanitization, and transformation tasks throughout the framework.

## Methods

### `camelCase(string $str): string`

Converts a string to camelCase.

```php
echo StringUtility::camelCase('hello_world'); // "helloWorld"
```

---

### `snakeCase(string $str): string`

Converts a string to snake_case.

```php
echo StringUtility::snakeCase('HelloWorld'); // "hello_world"
```

---

### `truncate(string $str, int $length, string $suffix = '...'): string`

Truncates a string to the given length.

```php
echo StringUtility::truncate('Hello World', 5); // "Hello..."
```

---

### `slugify(string $str): string`

Creates a URL-safe slug from a string.

```php
echo StringUtility::slugify('Hello World!'); // "hello-world"
```

---

## See Also

- `IGK\Helper\IO`
- `IGK\Helper\UriHelper`
- Global function `igk_str_escape()`
