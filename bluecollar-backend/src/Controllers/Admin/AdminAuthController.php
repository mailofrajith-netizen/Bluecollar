<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Helpers\Response;
use Bluecollar\Helpers\Validator;
use Bluecollar\Models\User;
use Bluecollar\Services\JwtService;

/**
 * Admin authentication controller.
 *
 * Note: This stub is included in Phase 2 as a foundation.
 * Full admin login route (A-01) is promoted to Phase 3 in ROADMAP.md.
 * The endpoint is wired here so the admin front-end can start integration.
 *
 * POST /api/admin/auth/login
 */
class AdminAuthController
{
    public function login(array $params): void
    {
        $body = $this->parseJson();

        $v = Validator::make($body)
            ->required('email', 'Email')
            ->email('email', 'Email')
            ->required('password', 'Password');

        if ($v->fails()) {
            Response::error('Validation failed.', 422, $v->errors());
        }

        $email = strtolower(trim($body['email']));

        // Use the full user row (contains password_hash)
        $user = User::findByEmail($email);

        if ($user === null || $user['role'] !== 'admin') {
            Response::error('Invalid credentials.', 401);
        }

        // Check lockout
        if (!empty($user['locked_until'])) {
            $lockUntil = strtotime($user['locked_until']);
            if ($lockUntil > time()) {
                $unlockAt = date('Y-m-d H:i:s', $lockUntil);
                Response::error(
                    'Account temporarily locked. Try again after ' . $unlockAt . '.',
                    423,
                    ['lock_until' => $unlockAt]
                );
            }
        }

        if (!password_verify($body['password'], $user['password_hash'])) {
            User::incrementLoginAttempts((int) $user['id']);
            Response::error('Invalid credentials.', 401);
        }

        User::resetLoginAttempts((int) $user['id']);

        // Issue admin-specific JWT (signed with ADMIN_JWT_SECRET, 8h expiry)
        $token = JwtService::issueAdmin([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => 'admin',
        ]);

        Response::success([
            'token' => $token,
            'admin' => [
                'id'    => (int) $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ], 'Admin login successful.');
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function parseJson(): array
    {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        return is_array($data) ? $data : [];
    }
}
