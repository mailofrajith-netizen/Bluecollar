<?php
declare(strict_types=1);

namespace Bluecollar\Helpers;

use Bluecollar\Bootstrap\Database;

/**
 * Generates unique order numbers in the format BC-YYYYMMDD-XXXX.
 *
 * Example: BC-20260517-4821
 *
 * The 4-digit suffix is a random number padded to 4 digits. Uniqueness is
 * verified against the database with up to 10 retries before giving up.
 */
class OrderNumber
{
    private const MAX_RETRIES = 10;

    /**
     * Generate a unique order number.
     *
     * @throws \RuntimeException if a unique number cannot be generated after MAX_RETRIES attempts
     */
    public static function generate(): string
    {
        $pdo = Database::getInstance();
        $datePart = date('Ymd');

        for ($attempt = 0; $attempt < self::MAX_RETRIES; $attempt++) {
            $suffix = str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
            $orderNumber = "BC-{$datePart}-{$suffix}";

            $stmt = $pdo->prepare('SELECT id FROM orders WHERE order_number = ? LIMIT 1');
            $stmt->execute([$orderNumber]);

            if ($stmt->fetch() === false) {
                return $orderNumber;
            }
        }

        throw new \RuntimeException('Could not generate a unique order number after ' . self::MAX_RETRIES . ' attempts.');
    }
}
