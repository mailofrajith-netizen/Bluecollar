<?php
declare(strict_types=1);

namespace Bluecollar\Middleware;

/**
 * Handles CORS headers for all requests.
 *
 * Allowed origins:
 *   - The FRONTEND_URL defined in .env
 *   - Any localhost origin in development mode
 *
 * OPTIONS preflight requests are answered with 204 No Content and execution stops.
 */
class CorsMiddleware
{
    public static function handle(): void
    {
        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigin = self::resolveAllowedOrigin($requestOrigin);

        if ($allowedOrigin !== '') {
            header('Access-Control-Allow-Origin: ' . $allowedOrigin);
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 3600');

        // Handle preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
    }

    private static function resolveAllowedOrigin(string $requestOrigin): string
    {
        if ($requestOrigin === '') {
            return '';
        }

        // Always allow the configured frontend URL
        if ($requestOrigin === FRONTEND_URL) {
            return $requestOrigin;
        }

        // In development, also allow any localhost origin
        if (APP_ENV === 'development' && self::isLocalhost($requestOrigin)) {
            return $requestOrigin;
        }

        return '';
    }

    private static function isLocalhost(string $origin): bool
    {
        $parsed = parse_url($origin);
        $host   = $parsed['host'] ?? '';
        return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    }
}
