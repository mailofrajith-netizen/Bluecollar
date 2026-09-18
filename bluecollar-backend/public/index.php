<?php
declare(strict_types=1);

// Development layout:  bluecollar-backend/public/index.php  → ROOT_PATH = bluecollar-backend/
// Production layout:   public_html/api/index.php             → ROOT_PATH = public_html/api/
// Detected by whether vendor/ lives beside index.php (production) or one level up (dev).
define('ROOT_PATH', file_exists(__DIR__ . '/vendor/autoload.php') ? __DIR__ : dirname(__DIR__));

require ROOT_PATH . '/vendor/autoload.php';
$app = new \Bluecollar\Bootstrap\App();
$app->run();
