<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;

/**
 * NewsletterSubscriber model — maps to the `newsletter_subscribers` table.
 */
class NewsletterSubscriber
{
    /**
     * Find a subscriber by email.
     */
    public static function findByEmail(string $email): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, email, is_active, subscribed_at
             FROM newsletter_subscribers
             WHERE email = ?
             LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Insert a new subscriber.
     */
    public static function create(string $email): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO newsletter_subscribers (email, is_active, subscribed_at)
             VALUES (:email, 1, NOW())'
        );
        $stmt->execute(['email' => $email]);
    }

    /**
     * Re-activate a previously unsubscribed email.
     */
    public static function reactivate(int $id): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'UPDATE newsletter_subscribers SET is_active = 1, subscribed_at = NOW() WHERE id = ?'
        );
        $stmt->execute([$id]);
    }
}
