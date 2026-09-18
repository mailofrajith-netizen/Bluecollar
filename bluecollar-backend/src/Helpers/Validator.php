<?php
declare(strict_types=1);

namespace Bluecollar\Helpers;

/**
 * Input validation helper.
 *
 * Usage:
 *   $v = new Validator($data);
 *   $v->required('email')->email('email')->required('password')->minLength('password', 8);
 *   if ($v->fails()) Response::error('Validation failed', 422, $v->errors());
 */
class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    // -----------------------------------------------------------------------
    // Factory
    // -----------------------------------------------------------------------

    public static function make(array $data): self
    {
        return new self($data);
    }

    // -----------------------------------------------------------------------
    // Rules (fluent, chainable)
    // -----------------------------------------------------------------------

    public function required(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value === null || (is_string($value) && trim($value) === '')) {
            $this->addError($field, "The {$label} field is required.");
        }

        return $this;
    }

    public function email(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "The {$label} must be a valid email address.");
        }

        return $this;
    }

    public function minLength(string $field, int $min, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && mb_strlen((string) $value) < $min) {
            $this->addError($field, "The {$label} must be at least {$min} characters.");
        }

        return $this;
    }

    public function maxLength(string $field, int $max, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && mb_strlen((string) $value) > $max) {
            $this->addError($field, "The {$label} may not exceed {$max} characters.");
        }

        return $this;
    }

    public function numeric(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !is_numeric($value)) {
            $this->addError($field, "The {$label} must be a number.");
        }

        return $this;
    }

    public function integer(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_INT) === false) {
            $this->addError($field, "The {$label} must be an integer.");
        }

        return $this;
    }

    public function min(string $field, int|float $min, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && is_numeric($value) && (float) $value < $min) {
            $this->addError($field, "The {$label} must be at least {$min}.");
        }

        return $this;
    }

    public function max(string $field, int|float $max, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && is_numeric($value) && (float) $value > $max) {
            $this->addError($field, "The {$label} may not exceed {$max}.");
        }

        return $this;
    }

    public function in(string $field, array $allowed, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !in_array($value, $allowed, true)) {
            $this->addError($field, "The {$label} must be one of: " . implode(', ', $allowed) . '.');
        }

        return $this;
    }

    public function pincode(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '' && !preg_match('/^\d{6}$/', (string) $value)) {
            $this->addError($field, "The {$label} must be a valid 6-digit pincode.");
        }

        return $this;
    }

    public function phone(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && $value !== '') {
            // Accept 10-digit Indian phone, optionally prefixed with +91 or 0
            $cleaned = preg_replace('/[\s\-\(\)]/', '', (string) $value);
            if (!preg_match('/^(\+91|91|0)?[6-9]\d{9}$/', $cleaned)) {
                $this->addError($field, "The {$label} must be a valid 10-digit phone number.");
            }
        }

        return $this;
    }

    public function array(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if ($value !== null && !is_array($value)) {
            $this->addError($field, "The {$label} must be an array.");
        }

        return $this;
    }

    public function notEmpty(string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        $value = $this->data[$field] ?? null;

        if (is_array($value) && count($value) === 0) {
            $this->addError($field, "The {$label} must not be empty.");
        }

        return $this;
    }

    // -----------------------------------------------------------------------
    // Result inspection
    // -----------------------------------------------------------------------

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function getValue(string $field, mixed $default = null): mixed
    {
        return $this->data[$field] ?? $default;
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }
}
