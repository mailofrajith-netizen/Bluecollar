<?php
declare(strict_types=1);

namespace Bluecollar\Services;

use Bluecollar\Bootstrap\Database;

/**
 * Provides read/write access to the settings table.
 *
 * All settings are stored as key/value strings. This service handles
 * caching within a single request and provides typed getters.
 */
class SettingsService
{
    /** @var array<string, string>|null In-request cache */
    private static ?array $cache = null;

    /** Known / allowed setting keys */
    public const KNOWN_KEYS = [
        'shipping_free_threshold',
        'shipping_charge',
        'gst_rate',
        'gstin',
        'hsn_code',
        'company_name',
        'company_address',
        'company_email',
        'company_phone',
        'announcement_text',
        'announcement_active',
        'mail_enabled',
    ];

    // -----------------------------------------------------------------------
    // Read
    // -----------------------------------------------------------------------

    /**
     * Return all settings as an associative array.
     *
     * @return array<string, string>
     */
    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->query('SELECT key_name, `value` FROM settings');
        $rows = $stmt->fetchAll();

        self::$cache = [];
        foreach ($rows as $row) {
            self::$cache[$row['key_name']] = $row['value'];
        }

        return self::$cache;
    }

    /**
     * Get a single setting value, with an optional default.
     */
    public static function get(string $key, string $default = ''): string
    {
        $all = self::all();
        return $all[$key] ?? $default;
    }

    public static function getFloat(string $key, float $default = 0.0): float
    {
        return (float) self::get($key, (string) $default);
    }

    public static function getInt(string $key, int $default = 0): int
    {
        return (int) self::get($key, (string) $default);
    }

    // -----------------------------------------------------------------------
    // Write
    // -----------------------------------------------------------------------

    /**
     * Update one or more settings by key.
     *
     * @param array<string, string> $data key => value pairs
     */
    public static function update(array $data): void
    {
        $pdo = Database::getInstance();

        $stmt = $pdo->prepare(
            'INSERT INTO settings (key_name, `value`, updated_at)
             VALUES (:key_name, :value, NOW())
             ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()'
        );

        foreach ($data as $key => $value) {
            $stmt->execute(['key_name' => $key, 'value' => (string) $value]);
        }

        // Bust the cache so subsequent reads see new values
        self::$cache = null;
    }

    // -----------------------------------------------------------------------
    // Validation helpers
    // -----------------------------------------------------------------------

    public static function isKnownKey(string $key): bool
    {
        return in_array($key, self::KNOWN_KEYS, true);
    }

    /**
     * Return keys in $data that are not in KNOWN_KEYS.
     *
     * @param array<string, mixed> $data
     * @return string[]
     */
    public static function unknownKeys(array $data): array
    {
        return array_values(array_filter(
            array_keys($data),
            static fn(string $k) => !self::isKnownKey($k)
        ));
    }
}
