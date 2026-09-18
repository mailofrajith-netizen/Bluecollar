<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Helpers\Response;
use Bluecollar\Middleware\AdminMiddleware;
use Bluecollar\Services\SettingsService;

/**
 * B-16: Admin Settings API.
 *
 * GET  /api/admin/settings   — returns all settings (admin auth required)
 * PUT  /api/admin/settings   — update one or more settings (admin auth required)
 * GET  /api/settings/public  — returns only public-safe settings (no auth)
 */
class AdminSettingsController
{
    // -----------------------------------------------------------------------
    // GET /api/settings/public  (no auth — only safe fields)
    // -----------------------------------------------------------------------

    public function publicIndex(array $params): void
    {
        $all = SettingsService::all();
        Response::success([
            'announcement_text'   => $all['announcement_text']   ?? '',
            'announcement_active' => $all['announcement_active'] ?? '0',
            'company_phone'       => $all['company_phone']       ?? '',
            'company_address'     => $all['company_address']     ?? '',
            'company_email'       => $all['company_email']       ?? '',
        ], 'Public settings retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // GET /api/admin/settings  (admin auth required)
    // -----------------------------------------------------------------------

    public function index(array $params): void
    {
        AdminMiddleware::handle();
        $settings = SettingsService::all();
        Response::success($settings, 'Settings retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // PUT /api/admin/settings
    // -----------------------------------------------------------------------

    public function update(array $params): void
    {
        AdminMiddleware::handle();

        $body = $this->parseJson();

        if (!is_array($body) || empty($body)) {
            Response::error('Request body must be a non-empty JSON object of key-value settings.', 400);
        }

        // Reject any unknown keys
        $unknownKeys = SettingsService::unknownKeys($body);
        if (!empty($unknownKeys)) {
            Response::error(
                'Unknown settings key(s): ' . implode(', ', $unknownKeys) . '. Allowed keys: ' . implode(', ', SettingsService::KNOWN_KEYS) . '.',
                400,
                ['unknown_keys' => $unknownKeys]
            );
        }

        // Validate numeric settings
        $numericKeys = ['shipping_free_threshold', 'shipping_charge', 'gst_rate'];
        $errors = [];

        foreach ($numericKeys as $key) {
            if (isset($body[$key]) && !is_numeric($body[$key])) {
                $errors[$key][] = "The {$key} must be a numeric value.";
            }
        }

        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        SettingsService::update($body);

        // Return updated settings
        $updated = SettingsService::all();
        Response::success($updated, 'Settings updated successfully.');
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
