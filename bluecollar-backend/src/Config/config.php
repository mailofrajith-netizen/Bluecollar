<?php
declare(strict_types=1);

// Define application constants from environment variables.
// This file is loaded after phpdotenv has parsed .env.

define('APP_ENV',    $_ENV['APP_ENV']    ?? 'production');
define('APP_URL',    $_ENV['APP_URL']    ?? '');
define('FRONTEND_URL', $_ENV['FRONTEND_URL'] ?? '');

define('DB_HOST',    $_ENV['DB_HOST']    ?? '127.0.0.1');
define('DB_PORT',    (int)($_ENV['DB_PORT'] ?? 3306));
define('DB_NAME',    $_ENV['DB_NAME']    ?? '');
define('DB_USER',    $_ENV['DB_USER']    ?? 'root');
define('DB_PASS',    $_ENV['DB_PASS']    ?? '');

define('JWT_SECRET',          $_ENV['JWT_SECRET']          ?? '');
define('JWT_EXPIRY_HOURS',    (int)($_ENV['JWT_EXPIRY_HOURS'] ?? 72));
define('ADMIN_JWT_SECRET',    $_ENV['ADMIN_JWT_SECRET']    ?? '');
define('ADMIN_JWT_EXPIRY_HOURS', (int)($_ENV['ADMIN_JWT_EXPIRY_HOURS'] ?? 8));

define('UPLOAD_MAX_SIZE_MB',  (int)($_ENV['UPLOAD_MAX_SIZE_MB'] ?? 2));
define('UPLOAD_PATH',         $_ENV['UPLOAD_PATH'] ?? 'storage/uploads/products');

// Mail configuration
define('MAIL_HOST',         $_ENV['MAIL_HOST']         ?? '');
define('MAIL_PORT',         (int)($_ENV['MAIL_PORT']   ?? 587));
define('MAIL_USERNAME',     $_ENV['MAIL_USERNAME']     ?? '');
define('MAIL_PASSWORD',     $_ENV['MAIL_PASSWORD']     ?? '');
define('MAIL_FROM_ADDRESS', $_ENV['MAIL_FROM_ADDRESS'] ?? 'orders@bluecollar.in');
define('MAIL_FROM_NAME',    $_ENV['MAIL_FROM_NAME']    ?? 'Bluecollar');
