<?php
declare(strict_types=1);

namespace Bluecollar\Helpers;

/**
 * Sends JSON HTTP responses with consistent shape.
 * All methods terminate execution via exit().
 */
class Response
{
    /**
     * Send a raw JSON response.
     *
     * @param mixed $data    Payload to encode
     * @param int   $status  HTTP status code
     */
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /**
     * Send a success response.
     *
     * @param mixed       $data    Response payload
     * @param string      $message Human-readable message
     * @param int         $status  HTTP status code (default 200)
     */
    public static function success(mixed $data = null, string $message = 'OK', int $status = 200): never
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Send an error response.
     *
     * @param string      $message Error description
     * @param int         $status  HTTP status code (default 400)
     * @param array|null  $errors  Optional validation error details
     */
    public static function error(string $message, int $status = 400, ?array $errors = null): never
    {
        $body = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $body['errors'] = $errors;
        }

        self::json($body, $status);
    }
}
