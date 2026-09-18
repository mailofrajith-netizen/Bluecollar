<?php
declare(strict_types=1);

namespace Bluecollar\Middleware;

use Bluecollar\Helpers\Response;
use Bluecollar\Services\JwtService;

/**
 * Customer JWT middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * Decoded user data is stored in the static $user property so controllers
 * can retrieve it after calling AuthMiddleware::handle().
 *
 * Usage in controllers:
 *   AuthMiddleware::handle();            // terminates with 401/403 on failure
 *   $user = AuthMiddleware::$user;       // array with id, email, role, ...
 */
class AuthMiddleware
{
    /** @var array<string, mixed>|null  Decoded JWT payload set after successful verification */
    public static ?array $user = null;

    /**
     * Validate the Bearer token from Authorization header.
     * Terminates the request with 401 if missing/invalid or 403 if admin token used on customer route.
     */
    public static function handle(): void
    {
        $token = self::extractToken();

        if ($token === null) {
            Response::error('Authentication required. Please provide a valid Bearer token.', 401);
        }

        try {
            $payload = JwtService::verify($token);
        } catch (\RuntimeException $e) {
            Response::error('Invalid or expired token. Please log in again.', 401);
        }

        // Admin-panel tokens are signed with ADMIN_JWT_SECRET and will have already
        // failed JwtService::verify() (which uses JWT_SECRET) above.
        // Admin users who log in via the customer login endpoint receive a customer
        // JWT and are allowed to access customer endpoints (e.g., placing orders).

        self::$user = $payload;
    }

    /**
     * Extract the raw token string from the Authorization: Bearer <token> header.
     */
    private static function extractToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        // Some SAPI set it under REDIRECT_HTTP_AUTHORIZATION
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
