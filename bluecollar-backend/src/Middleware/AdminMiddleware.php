<?php
declare(strict_types=1);

namespace Bluecollar\Middleware;

use Bluecollar\Helpers\Response;
use Bluecollar\Services\JwtService;

/**
 * Admin JWT middleware.
 *
 * Verifies an admin Bearer token (signed with ADMIN_JWT_SECRET).
 * Decoded admin data is stored in the static $admin property.
 *
 * Usage in controllers:
 *   AdminMiddleware::handle();          // terminates with 401/403 on failure
 *   $admin = AdminMiddleware::$admin;   // array with id, email, role='admin', ...
 */
class AdminMiddleware
{
    /** @var array<string, mixed>|null  Decoded admin JWT payload */
    public static ?array $admin = null;

    /**
     * Validate the admin Bearer token.
     * Terminates with 401 if missing/invalid or 403 if token role is not 'admin'.
     */
    public static function handle(): void
    {
        $token = self::extractToken();

        if ($token === null) {
            Response::error('Admin authentication required.', 401);
        }

        try {
            $payload = JwtService::verifyAdmin($token);
        } catch (\RuntimeException $e) {
            Response::error('Invalid or expired admin token. Please log in again.', 401);
        }

        if (!isset($payload['role']) || $payload['role'] !== 'admin') {
            Response::error('Access denied. Admin role required.', 403);
        }

        self::$admin = $payload;
    }

    /**
     * Extract the raw token string from Authorization: Bearer header.
     */
    private static function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if ($header === '') {
            $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        }

        if ($header === '') {
            return null;
        }

        if (!str_starts_with($header, 'Bearer ')) {
            return null;
        }

        $token = trim(substr($header, 7));
        return $token !== '' ? $token : null;
    }
}
