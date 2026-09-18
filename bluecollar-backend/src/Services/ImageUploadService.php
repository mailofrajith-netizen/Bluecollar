<?php
declare(strict_types=1);

namespace Bluecollar\Services;

class ImageUploadService
{
    private const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
    private const MAX_BYTES    = 2097152; // 2 MB

    public function handleUpload(string $inputName, int $productId): string
    {
        if (!isset($_FILES[$inputName]) || $_FILES[$inputName]['error'] === UPLOAD_ERR_NO_FILE) {
            throw new \RuntimeException('No file uploaded.');
        }

        $file = $_FILES[$inputName];

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Upload error code: ' . $file['error']);
        }

        if ($file['size'] > self::MAX_BYTES) {
            throw new \RuntimeException('File exceeds the 2 MB limit.');
        }

        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, self::ALLOWED_MIME, true)) {
            throw new \RuntimeException('Only JPEG, PNG, and WebP images are allowed.');
        }

        $ext = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
        };

        $filename = uniqid('img_', true) . '.' . $ext;
        $dir      = ROOT_PATH . '/storage/uploads/products/' . $productId . '/';

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $dest = $dir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new \RuntimeException('Failed to save the uploaded file.');
        }

        return 'uploads/products/' . $productId . '/' . $filename;
    }
}
