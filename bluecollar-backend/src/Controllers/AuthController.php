<?php
declare(strict_types=1);

namespace Bluecollar\Controllers;

use Bluecollar\Helpers\Response;
use Bluecollar\Helpers\Validator;
use Bluecollar\Models\User;
use Bluecollar\Services\JwtService;
use Bluecollar\Services\MailerService;
use Bluecollar\Services\SettingsService;

/**
 * Handles customer registration and login.
 *
 * B-01: POST /api/auth/register
 * B-02: POST /api/auth/login
 */
class AuthController
{
    // -----------------------------------------------------------------------
    // B-01: Register
    // -----------------------------------------------------------------------

    public function register(array $params): void
    {
        $body = $this->parseJson();

        $v = Validator::make($body)
            ->required('name', 'Name')
            ->maxLength('name', 100, 'Name')
            ->required('email', 'Email')
            ->email('email', 'Email')
            ->maxLength('email', 150, 'Email')
            ->required('phone', 'Phone')
            ->phone('phone', 'Phone')
            ->required('password', 'Password')
            ->minLength('password', 8, 'Password')
            ->maxLength('password', 128, 'Password');

        if ($v->fails()) {
            Response::error('Validation failed.', 422, $v->errors());
        }

        $email = strtolower(trim($body['email']));

        if (User::emailExists($email)) {
            Response::error('An account with this email address already exists.', 409);
        }

        $passwordHash = password_hash($body['password'], PASSWORD_BCRYPT, ['cost' => 12]);

        $userId = User::create(
            trim($body['name']),
            $email,
            trim($body['phone']),
            $passwordHash
        );

        $user = User::findById($userId);

        // Require email verification only when mail is enabled
        $mailEnabled = SettingsService::get('mail_enabled', '0') === '1';

        if ($mailEnabled) {
            $verifyToken = bin2hex(random_bytes(32));
            $expires     = date('Y-m-d H:i:s', strtotime('+24 hours'));
            User::storeVerificationToken($userId, $verifyToken, $expires);

            $verifyLink = $this->getFrontendUrl() . '/verify-email?token=' . $verifyToken;
            try {
                (new MailerService())->sendEmailVerification($user, $verifyLink);
            } catch (\Throwable) {
                // Swallow mail errors — account is still created
            }

            Response::success([
                'requires_verification' => true,
            ], 'Account created. Please check your email to verify your address.', 201);
        }

        // Mail not enabled — auto-verify and log user in directly
        User::markEmailVerified($userId);

        $token = JwtService::issue([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => 'customer',
        ]);

        Response::success([
            'token' => $token,
            'user'  => $this->sanitizeUser($user),
        ], 'Account created successfully.', 201);
    }

    // -----------------------------------------------------------------------
    // B-02: Login (with 5-attempt lockout)
    // -----------------------------------------------------------------------

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
        $user  = User::findByEmail($email);

        if ($user === null) {
            // Do NOT reveal whether email is registered
            Response::error('Invalid email or password.', 401);
        }

        // Check account status
        if (($user['status'] ?? 'inactive') !== 'active') {
            Response::error('Your account is not yet active. Please verify your email address.', 403, [
                'email_not_verified' => true,
                'email' => $email,
            ]);
        }

        // Check lockout
        if (!empty($user['locked_until'])) {
            $lockUntil = strtotime($user['locked_until']);
            if ($lockUntil > time()) {
                $unlockAt = date('Y-m-d H:i:s', $lockUntil);
                Response::error(
                    'Account temporarily locked due to too many failed attempts. Try again after ' . $unlockAt . '.',
                    423,
                    ['locked_until' => $unlockAt]
                );
            }
        }

        if (!password_verify($body['password'], $user['password_hash'])) {
            User::incrementLoginAttempts((int) $user['id']);
            Response::error('Invalid email or password.', 401);
        }

        // Successful login
        User::resetLoginAttempts((int) $user['id']);

        $token = JwtService::issue([
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        Response::success([
            'token' => $token,
            'user'  => $this->sanitizeUser($user),
        ], 'Login successful.');
    }

    // -----------------------------------------------------------------------
    // B-03: Verify email via token
    // -----------------------------------------------------------------------

    public function verifyEmail(array $params): void
    {
        $token = trim($_GET['token'] ?? '');

        if ($token === '') {
            Response::error('Verification token is required.', 400);
        }

        $user = User::findByVerificationToken($token);

        if ($user === null) {
            Response::error('Invalid or already-used verification link.', 400);
        }

        if (!empty($user['email_verified_at'])) {
            Response::success([], 'Email already verified. You can log in.');
        }

        if (strtotime($user['email_verification_expires_at']) < time()) {
            Response::error('This verification link has expired. Please request a new one.', 400, ['expired' => true]);
        }

        User::markEmailVerified((int) $user['id']);

        Response::success([], 'Email verified successfully. You can now log in.');
    }

    // -----------------------------------------------------------------------
    // B-04: Resend verification email
    // -----------------------------------------------------------------------

    public function resendVerification(array $params): void
    {
        $body  = $this->parseJson();
        $email = strtolower(trim($body['email'] ?? ''));

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required.', 422);
        }

        $user = User::findByEmail($email);

        // Always return 200 to avoid leaking whether email exists
        if ($user === null || !empty($user['email_verified_at'])) {
            Response::success([], 'If that email is registered and unverified, a new link has been sent.');
        }

        $verifyToken = bin2hex(random_bytes(32));
        $expires     = date('Y-m-d H:i:s', strtotime('+24 hours'));
        User::storeVerificationToken((int) $user['id'], $verifyToken, $expires);

        $verifyLink = $this->getFrontendUrl() . '/verify-email?token=' . $verifyToken;
        try {
            (new MailerService())->sendEmailVerification($user, $verifyLink);
        } catch (\Throwable) {
            // Swallow mail errors
        }

        Response::success([], 'If that email is registered and unverified, a new link has been sent.');
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function getFrontendUrl(): string
    {
        if (defined('FRONTEND_URL') && FRONTEND_URL !== '') {
            return rtrim(FRONTEND_URL, '/');
        }
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return $scheme . '://' . $host;
    }

    private function parseJson(): array
    {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        return is_array($data) ? $data : [];
    }

    private function sanitizeUser(array $user): array
    {
        return [
            'id'         => (int) $user['id'],
            'name'       => $user['name'],
            'email'      => $user['email'],
            'phone'      => $user['phone'],
            'role'       => $user['role'],
            'created_at' => $user['created_at'],
        ];
    }
}
