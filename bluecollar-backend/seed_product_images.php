<?php
/**
 * seed_product_images.php
 *
 * One-time script: assigns 3 demo shirt images to every product that has none.
 * Upload to public_html/api/ on Hostinger, visit it once via browser, then DELETE it.
 *
 * Usage: https://bluecollarshop.in/api/seed_product_images.php?key=bluecollar_seed_2024
 * Diagnostics: add &diag=1 to see PHP environment info before seeding
 */

declare(strict_types=1);

define('SEED_KEY', 'bluecollar_seed_2024');
if (($_GET['key'] ?? '') !== SEED_KEY) {
    http_response_code(403);
    echo '<pre>403 Forbidden. Pass ?key=bluecollar_seed_2024</pre>';
    exit;
}

echo '<pre>';

// ── Diagnostics ───────────────────────────────────────────────────────────────
if (!empty($_GET['diag'])) {
    echo "=== PHP DIAGNOSTICS ===\n";
    echo "PHP version      : " . PHP_VERSION . "\n";
    echo "allow_url_fopen  : " . (ini_get('allow_url_fopen') ? 'ON' : 'OFF') . "\n";
    echo "cURL enabled     : " . (function_exists('curl_init') ? 'YES' : 'NO') . "\n";
    echo "GD enabled       : " . (function_exists('imagecreatetruecolor') ? 'YES' : 'NO') . "\n";
    echo "Script dir       : " . __DIR__ . "\n";
    $rootGuess = file_exists(__DIR__ . '/vendor/autoload.php') ? __DIR__ : dirname(__DIR__);
    echo "ROOT_PATH guess  : " . $rootGuess . "\n";
    echo "storage path     : " . $rootGuess . "/storage/uploads/products/\n";
    echo "storage writable : " . (is_writable($rootGuess . '/storage') ? 'YES' : 'NO (or does not exist)') . "\n";
    echo "\nAdd nothing (remove &diag=1) to actually run the seeder.\n";
    echo '</pre>';
    exit;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
define('ROOT_PATH', file_exists(__DIR__ . '/vendor/autoload.php') ? __DIR__ : dirname(__DIR__));

$envFile = ROOT_PATH . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v);
    }
}

$DB_HOST = $_ENV['DB_HOST'] ?? 'localhost';
$DB_PORT = (int)($_ENV['DB_PORT'] ?? 3306);
$DB_NAME = $_ENV['DB_NAME'] ?? '';
$DB_USER = $_ENV['DB_USER'] ?? '';
$DB_PASS = $_ENV['DB_PASS'] ?? '';

// ── Connect ──────────────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER, $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    echo "DB connected: {$DB_NAME}@{$DB_HOST}\n\n";
} catch (Exception $e) {
    die("DB connection failed: " . $e->getMessage() . "\n\n"
        . "HOST={$DB_HOST} NAME={$DB_NAME} USER={$DB_USER}\n"
        . "Check .env file at: " . ROOT_PATH . "/.env\n");
}

// ── Find products with 0 images ───────────────────────────────────────────────
$stmt = $pdo->query("
    SELECT p.id, p.name
    FROM products p
    WHERE p.deleted_at IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
      )
    ORDER BY p.id ASC
    LIMIT 50
");
$products = $stmt->fetchAll();

if (empty($products)) {
    echo "No products without images found. Nothing to do.\n";
    echo "\nIf products already have images but they look broken, the issue is\n";
    echo "the image files missing from storage — not this script.\n";
    echo '</pre>';
    exit;
}

echo "Found " . count($products) . " products without images.\n\n";

// ── Image sources ─────────────────────────────────────────────────────────────
$IMAGE_GROUPS = [
    [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523381210434-271e8be8a52d?w=600&h=800&fit=crop&q=80',
        'https://picsum.photos/seed/bc-a/600/800',
    ],
    [
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578932750355-5973e6d17b1f?w=600&h=800&fit=crop&q=80',
        'https://picsum.photos/seed/bc-b/600/800',
    ],
    [
        'https://images.unsplash.com/photo-1563630423918-b58f07291d33?w=600&h=800&fit=crop&q=80',
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop&q=80',
        'https://picsum.photos/seed/bc-c/600/800',
    ],
];

// ── Download via cURL (works even when allow_url_fopen is OFF) ────────────────
function curlDownload(array $urls): ?string
{
    if (!function_exists('curl_init')) return null;

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 5,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 BluecollarSeeder/2.0',
        CURLOPT_HTTPHEADER     => ['Accept: image/jpeg, image/png, image/webp, */*'],
    ]);

    foreach ($urls as $url) {
        curl_setopt($ch, CURLOPT_URL, $url);
        $data = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $size = strlen((string)$data);

        if ($data !== false && $code === 200 && $size > 2048) {
            curl_close($ch);
            return $data;
        }
    }

    curl_close($ch);
    return null;
}

function fopenDownload(array $urls): ?string
{
    if (!ini_get('allow_url_fopen')) return null;

    $ctx = stream_context_create([
        'http' => ['timeout' => 15, 'follow_location' => true, 'user_agent' => 'Mozilla/5.0 BluecollarSeeder/2.0'],
        'ssl'  => ['verify_peer' => false],
    ]);

    foreach ($urls as $url) {
        $data = @file_get_contents($url, false, $ctx);
        if ($data !== false && strlen($data) > 2048) return $data;
    }
    return null;
}

function downloadImage(array $urls): ?string
{
    return curlDownload($urls) ?? fopenDownload($urls);
}

function detectExt(string $data): string
{
    if (str_starts_with($data, "\xFF\xD8")) return 'jpg';
    if (str_starts_with($data, "\x89PNG"))  return 'png';
    return 'jpg';
}

function makePlaceholder(int $productId, int $idx): ?string
{
    if (!function_exists('imagecreatetruecolor')) return null;

    $palettes = [
        [[26, 39, 68],    [255, 255, 255]],
        [[87, 127, 166],  [255, 255, 255]],
        [[245, 240, 235], [26, 39, 68]],
    ];
    [$bg, $fg] = $palettes[$idx % 3];

    $img  = imagecreatetruecolor(600, 800);
    $bgC  = imagecolorallocate($img, $bg[0], $bg[1], $bg[2]);
    $fgC  = imagecolorallocate($img, $fg[0], $fg[1], $fg[2]);
    $gold = imagecolorallocate($img, 200, 146, 42);

    imagefilledrectangle($img, 0, 0, 599, 799, $bgC);

    $stripe = imagecolorallocatealpha($img, 255, 255, 255, 120);
    for ($x = -800; $x < 600; $x += 40) {
        imageline($img, $x, 0, $x + 800, 800, $stripe);
    }

    imagefilledrectangle($img, 0, 792, 599, 799, $gold);
    imagestring($img, 5, 175, 355, 'BLUECOLLAR', $gold);
    imagestring($img, 3, 140, 385, 'Premium Wrinkle-Free Shirt', $fgC);

    ob_start();
    imagejpeg($img, null, 85);
    imagedestroy($img);
    return ob_get_clean() ?: null;
}

// ── Process ───────────────────────────────────────────────────────────────────
$insertStmt = $pdo->prepare("
    INSERT INTO product_images (product_id, image_path, alt_text, sort_order, is_primary)
    VALUES (:pid, :path, :alt, :sort, :primary)
");

$successCount = 0;
$failCount    = 0;

foreach ($products as $product) {
    $pid  = (int)$product['id'];
    $name = $product['name'];
    echo "── Product #{$pid}: {$name}\n";

    $dir = ROOT_PATH . '/storage/uploads/products/' . $pid . '/';
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        echo "  ERROR: Cannot create directory {$dir}\n\n";
        $failCount++;
        continue;
    }

    $productOk = true;
    for ($i = 0; $i < 3; $i++) {
        $data   = downloadImage($IMAGE_GROUPS[$i]);
        $source = 'downloaded';

        if ($data === null) {
            $data   = makePlaceholder($pid, $i);
            $source = 'GD placeholder';
        }

        if ($data === null) {
            echo "  Image " . ($i + 1) . ": SKIPPED (no cURL, no allow_url_fopen, no GD)\n";
            $productOk = false;
            continue;
        }

        $ext      = detectExt($data);
        $filename = 'img_' . uniqid('', true) . '.' . $ext;
        $dest     = $dir . $filename;

        if (file_put_contents($dest, $data) === false) {
            echo "  Image " . ($i + 1) . ": WRITE FAILED at {$dest}\n";
            $productOk = false;
            continue;
        }

        $imgPath = 'uploads/products/' . $pid . '/' . $filename;
        $insertStmt->execute([
            ':pid'     => $pid,
            ':path'    => $imgPath,
            ':alt'     => $name,
            ':sort'    => $i,
            ':primary' => ($i === 0) ? 1 : 0,
        ]);

        echo "  Image " . ($i + 1) . ": {$imgPath} [{$source}]\n";
    }

    if ($productOk) $successCount++; else $failCount++;
    echo "\n";
}

echo "==============================\n";
echo "Done.  Success: {$successCount}  Failed: {$failCount}\n";
echo "\n";

if ($failCount > 0) {
    echo "Some products failed. Try visiting:\n";
    echo "  ?key=bluecollar_seed_2024&diag=1\n";
    echo "to see which PHP extensions are available.\n\n";
}

echo "IMPORTANT: Delete this file from the server now!\n";
echo '</pre>';
