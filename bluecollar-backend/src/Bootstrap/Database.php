<?php
declare(strict_types=1);

namespace Bluecollar\Bootstrap;

use PDO;
use PDOException;

/**
 * PDO singleton for MySQL connections.
 * Uses utf8mb4 charset, ERRMODE_EXCEPTION, and FETCH_ASSOC defaults.
 */
class Database
{
    private static ?PDO $instance = null;

    /** Prevent direct instantiation. */
    private function __construct() {}

    /** Prevent cloning. */
    private function __clone() {}

    /**
     * Return the shared PDO instance, creating it on first call.
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                DB_HOST,
                DB_PORT,
                DB_NAME
            );

            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                ]);
            } catch (PDOException $e) {
                // Never expose connection details in production.
                $message = (APP_ENV === 'development')
                    ? 'Database connection failed: ' . $e->getMessage()
                    : 'Database connection failed.';

                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['success' => false, 'message' => $message]);
                exit();
            }
        }

        return self::$instance;
    }
}
