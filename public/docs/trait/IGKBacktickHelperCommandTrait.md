# IGKBacktickHelperCommandTrait

Provides backtick-style shell command execution helpers for CLI commands.

## Description

`IGKBacktickHelperCommandTrait` is used by console command classes to easily run shell commands and capture their output. It wraps PHP's `exec()` / `shell_exec()` functions with error handling.

## Methods

### `runCommand(string $cmd): string`

Executes a shell command and returns the output as a string.

```php
$output = $this->runCommand('php artisan migrate');
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `$cmd` | `string` | The shell command to execute |

**Returns:** `string` — Command output

---

### `runCommandLines(string $cmd): array`

Executes a shell command and returns output as an array of lines.

```php
$lines = $this->runCommandLines('ls -la');
foreach ($lines as $line) {
    echo $line . PHP_EOL;
}
```

**Returns:** `array<string>`

---

## Used By

- `IGK\System\Console\BalafonCommand`
- `IGK\System\Console\Commands\*`

## See Also

- `IGK\System\Console\BalafonCommand`
- `IGK\System\Console\App`
