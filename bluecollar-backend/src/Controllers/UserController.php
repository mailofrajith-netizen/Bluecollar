<?php
declare(strict_types=1);

namespace Bluecollar\Controllers;

use Bluecollar\Helpers\Response;
use Bluecollar\Helpers\Validator;
use Bluecollar\Middleware\AuthMiddleware;
use Bluecollar\Models\User;

/**
 * Authenticated customer profile endpoints.
 *
 * B-13: GET /api/user/profile
 * B-14: PUT /api/user/profile
 */
class UserController
{
    // -----------------------------------------------------------------------
    // B-13: Get profile
    // -----------------------------------------------------------------------

    public function profile(array $params): void
    {
        AuthMiddleware::handle();
        $authUser = AuthMiddleware::$user;

        $user = User::findById((int) $authUser['id']);

        if ($user === null) {
            Response::error('User not found.', 404);
        }

        Response::success($this->sanitizeUser($user), 'Profile retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // B-14: Update profile
    // -----------------------------------------------------------------------

    public function updateProfile(array $params): void
    {
        AuthMiddleware::handle();
        $authUser = AuthMiddleware::$user;
        $userId   = (int) $authUser['id'];

        $body = $this->parseJson();

        $v = Validator::make($body)
            ->required('name', 'Name')
            ->maxLength('name', 100, 'Name')
            ->required('phone', 'Phone')
            ->phone('phone', 'Phone');

        if ($v->fails()) {
            Response::error('Validation failed.', 422, $v->errors());
        }

        // Password change is optional — only validate if provided
        $passwordHash = null;

        $hasNewPassword = !empty($body['new_password']);
        $hasCurrentPassword = !empty($body['current_password']);

        if ($hasNewPassword || $hasCurrentPassword) {
            // Both fields are required together
            if (!$hasCurrentPassword) {
                Response::error('Validation failed.', 422, [
                    'current_password' => ['Current password is required to set a new password.'],
                ]);
            }
            if (!$hasNewPassword) {
                Response::error('Validation failed.', 422, [
                    'new_password' => ['New password cannot be empty.'],
                ]);
            }
            if (mb_strlen($body['new_password']) < 8) {
                Response::error('Validation failed.', 422, [
                    'new_password' => ['New password must be at least 8 characters.'],
                ]);
            }

            // Verify current password against the stored hash
            // Need the full user row with password_hash
            $fullUser = User::findByEmail($authUser['email']);
            if ($fullUser === null || !password_verify($body['current_password'], $fullUser['password_hash'])) {
                Response::error('Current password is incorrect.', 422, [
                    'current_password' => ['The current password you entered is incorrect.'],
                ]);
            }

            $passwordHash = password_hash($body['new_password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }

        User::updateProfile($userId, trim($body['name']), trim($body['phone']), $passwordHash);

        $updated = User::findById($userId);

        Response::success($this->sanitizeUser($updated), 'Profile updated successfully.');
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

    private function sanitizeUser(?array $user): array
    {
        if ($user === null) {
            return [];
        }
        return [
            'id'         => (int) $user['id'],
            'name'       => $user['name'],
            'email'      => $user['email'],
            'phone'      => $user['phone'],
            'created_at' => $user['created_at'],
        ];
    }
}
