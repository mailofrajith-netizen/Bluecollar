<?php
declare(strict_types=1);

namespace Bluecollar\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;

/**
 * Thin wrapper around firebase/php-jwt for issuing and verifying JWTs.
 *
 * Customer tokens use JWT_SECRET / JWT_EXPIRY_HOURS.
 * Admin tokens  use ADMIN_JWT_SECRET / ADMIN_JWT_EXPIRY_HOURS.
 */
class JwtService
{
    private const ALGORITHM = 'HS256';

    // -----------------------------------------------------------------------
    // Customer tokens
    // -----------------------------------------------------------------------

    /**
     * Issue a customer JWT.
     *
     * @param array $payload Must contain at least: id, email, role
     */
    public static function issue(array $payload): string
    {
        $now = time();
        $claims = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + (JWT_EXPIRY_HOURS * 3600),
            'iss' => 'bluecollar',
        ]);

        return JWT::encode($claims, JWT_SECRET, self::ALGORITHM);
    }

    /**
     * Verify and decode a customer JWT.
     *
     * @return array Decoded payload as associative array
     * @throws \RuntimeException on invalid/expired token
     */
    public static function verify(string $token): array
    {
        return self::decode($token, JWT_SECRET);
    }

    // -----------------------------------------------------------------------
    // Admin tokens
    // -----------------------------------------------------------------------

    /**
     * Issue an admin JWT.
     *
     * @param array $payload Must contain at least: id, email, role='admin'
     */
    public static function issueAdmin(array $payload): string
    {
        $now = time();
        $claims = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + (ADMIN_JWT_EXPIRY_HOURS * 3600),
            'iss' => 'bluecollar-admin',
        ]);

        return JWT::encode($claims, ADMIN_JWT_SECRET, self::ALGORITHM);
    }

    /**
     * Verify and decode an admin JWT.
     *
     * @return array Decoded payload as associative array
     * @throws \RuntimeException on invalid/expired token
     */
    public static function verifyAdmin(string $token): array
    {
        return self::decode($token, ADMIN_JWT_SECRET);
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    private static function decode(string $token, string $secret): array
    {
        try {
            $decoded = JWT::decode($token, new Key($secret, self::ALGORITHM));
            return (array) $decoded;
        } catch (ExpiredException $e) {
            throw new \RuntimeException('Token has expired.', 401);
        } catch (SignatureInvalidException $e) {
            throw new \RuntimeException('Token signature is invalid.', 401);
        } catch (\Exception $e) {
            throw new \RuntimeException('Invalid token: ' . $e->getMessage(), 401);
        }
    }
}
