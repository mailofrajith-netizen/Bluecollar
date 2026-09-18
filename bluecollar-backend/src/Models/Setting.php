<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;

/**
 * Setting model — maps to the `settings` table.
 *
 * For application-level access prefer SettingsService which adds caching.
 */
class Setting
{
    /**
     * Retrieve a single setting value by key.
     */
    public static function get(string $key): ?string
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('SELECT `value` FROM settings WHERE `key` = ? LIMIT 1');
        $stmt->execute([$key]);
        $value = $stmt->fetchColumn();
        return $value !== false ? (string) $value : null;
    }

    /**
     * Return all settings as an associative array (key => value).
     *
     * @return array<string, string>
     */
    public static function all(): array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->query('SELECT `key`, `value` FROM settings');
        $rows = $stmt->fetchAll();

        $result = [];
        foreach ($rows as $row) {
            $result[$row['key']] = $row['value'];
        }
        return $result;
    }

    /**
     * Upsert a setting value.
     */
    public static function set(string $key, string $value): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO settings (`key`, `value`, updated_at)
             VALUES (:key, :value, NOW())
             ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), updated_at = NOW()'
        );
        $stmt->execute(['key' => $key, 'value' => $value]);
    }
}
