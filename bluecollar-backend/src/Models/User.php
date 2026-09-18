<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;
use PDO;

/**
 * User model — maps to the `users` table.
 */
class User
{
    // -----------------------------------------------------------------------
    // Read
    // -----------------------------------------------------------------------

    public static function findByEmail(string $email): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, phone, password_hash, role, status, login_attempts, locked_until, created_at, email_verified_at
             FROM users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function findById(int $id): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, phone, role, created_at
             FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function emailExists(string $email): bool
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return $stmt->fetch() !== false;
    }

    // -----------------------------------------------------------------------
    // Write
    // -----------------------------------------------------------------------

    /**
     * Create a new customer account.
     *
     * @return int Newly inserted user id
     */
    public static function create(string $name, string $email, string $phone, string $passwordHash): int
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, phone, password_hash, role, status, login_attempts, created_at)
             VALUES (:name, :email, :phone, :password_hash, "customer", "inactive", 0, NOW())'
        );
        $stmt->execute([
            'name'          => $name,
            'email'         => $email,
            'phone'         => $phone,
            'password_hash' => $passwordHash,
        ]);
        return (int) $pdo->lastInsertId();
    }

    /**
     * Increment failed login attempts and optionally lock the account.
     */
    public static function incrementLoginAttempts(int $id): void
    {
        $pdo  = Database::getInstance();
        // Increment attempts; if it reaches 5, set lock_until = NOW() + 15 min
        $stmt = $pdo->prepare(
            'UPDATE users
             SET login_attempts = login_attempts + 1,
                 locked_until = CASE
                     WHEN login_attempts + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                     ELSE locked_until
                 END
             WHERE id = ?'
        );
        $stmt->execute([$id]);
    }

    /**
     * Reset login attempts and remove lock after a successful login.
     */
    public static function resetLoginAttempts(int $id): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?'
        );
        $stmt->execute([$id]);
    }

    // -----------------------------------------------------------------------
    // Email verification
    // -----------------------------------------------------------------------

    public static function storeVerificationToken(int $id, string $token, string $expires): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'UPDATE users SET email_verification_token = :token, email_verification_expires_at = :expires WHERE id = :id'
        );
        $stmt->execute(['token' => $token, 'expires' => $expires, 'id' => $id]);
    }

    public static function findByVerificationToken(string $token): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, phone, role, email_verified_at, email_verification_expires_at
             FROM users WHERE email_verification_token = ? LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function markEmailVerified(int $id): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'UPDATE users SET email_verified_at = NOW(), status = "active", email_verification_token = NULL,
             email_verification_expires_at = NULL WHERE id = :id'
        );
        $stmt->execute(['id' => $id]);
    }

    /**
     * Update profile fields (name, phone, and optionally password).
     */
    public static function updateProfile(int $id, string $name, string $phone, ?string $passwordHash = null): void
    {
        $pdo = Database::getInstance();

        if ($passwordHash !== null) {
            $stmt = $pdo->prepare(
                'UPDATE users SET name = :name, phone = :phone, password_hash = :password_hash WHERE id = :id'
            );
            $stmt->execute([
                'name'          => $name,
                'phone'         => $phone,
                'password_hash' => $passwordHash,
                'id'            => $id,
            ]);
        } else {
            $stmt = $pdo->prepare(
                'UPDATE users SET name = :name, phone = :phone WHERE id = :id'
            );
            $stmt->execute(['name' => $name, 'phone' => $phone, 'id' => $id]);
        }
    }
}
