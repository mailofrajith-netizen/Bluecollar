<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Bootstrap\Database;
use Bluecollar\Helpers\Response;
use Bluecollar\Middleware\AdminMiddleware;
use Bluecollar\Models\Product;
use Bluecollar\Models\ProductVariant;
use Bluecollar\Services\ImageUploadService;
use PDO;

class AdminProductController
{
    // GET /api/admin/products
    public function index(array $params): void
    {
        AdminMiddleware::handle();

        $page           = max(1, (int) ($_GET['page']           ?? 1));
        $limit          = min(50, max(1, (int) ($_GET['limit']  ?? 20)));
        $search         = trim($_GET['search']                  ?? '');
        $status         = trim($_GET['status']                  ?? '');
        $includeDeleted = (($_GET['include_deleted'] ?? '0') === '1');

        $result     = Product::adminList($search, $status, $page, $limit, $includeDeleted);
        $totalPages = (int) ceil(($result['total'] ?: 1) / $limit);

        Response::success([
            'products'   => $result['items'],
            'pagination' => [
                'total'       => $result['total'],
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => $totalPages,
            ],
        ], 'Products retrieved successfully.');
    }

    // POST /api/admin/products
    public function store(array $params): void
    {
        AdminMiddleware::handle();

        $body = $_POST;

        $errors = [];
        if (empty($body['name'])) {
            $errors['name'][] = 'Product name is required.';
        }
        if (!isset($body['base_price']) || !is_numeric($body['base_price']) || (float) $body['base_price'] <= 0) {
            $errors['base_price'][] = 'Base price must be a positive number.';
        }
        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        $slug = $this->generateSlug(trim($body['name']));

        $data = [
            'name'             => trim($body['name']),
            'slug'             => $slug,
            'description'      => $body['description'] ?? null,
            'base_price'       => (float) $body['base_price'],
            'discount_percent' => isset($body['discount_percent']) && is_numeric($body['discount_percent']) ? max(0, min(90, (float) $body['discount_percent'])) : 0,
            'category_id'      => isset($body['category_id']) && is_numeric($body['category_id']) ? (int) $body['category_id'] : null,
            'is_featured'      => ($body['is_featured'] ?? '0') === '1' ? 1 : 0,
            'sort_order'       => isset($body['sort_order']) ? (int) $body['sort_order'] : 0,
            'status'           => in_array($body['status'] ?? '', ['active', 'inactive'], true) ? $body['status'] : 'active',
        ];

        $productId = Product::create($data);

        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $imagePath = (new ImageUploadService())->handleUpload('image', $productId);
                Product::addImage($productId, $imagePath, $data['name'], 0);
            } catch (\RuntimeException $e) {
                Response::error($e->getMessage(), 422);
            }
        }

        $product = Product::findByIdAdmin($productId);
        Response::success(['product' => $product], 'Product created successfully.', 201);
    }

    // PUT /api/admin/products/{id}
    public function update(array $params): void
    {
        AdminMiddleware::handle();

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::error('Invalid product ID.', 400);
        }

        $product = Product::findByIdAdmin($id);
        if ($product === null) {
            Response::error('Product not found.', 404);
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'multipart/form-data') || str_contains($contentType, 'application/x-www-form-urlencoded')) {
            $body = $_POST;
        } else {
            $raw  = file_get_contents('php://input');
            $body = json_decode($raw ?: '', true) ?: [];
        }

        $updates = [];
        if (isset($body['name']) && trim($body['name']) !== '') {
            $updates['name'] = trim($body['name']);
            $updates['slug'] = $this->generateSlug($updates['name'], $id);
        }
        if (array_key_exists('description', $body))  $updates['description']  = $body['description'];
        if (isset($body['base_price']) && is_numeric($body['base_price'])) $updates['base_price'] = (float) $body['base_price'];
        if (array_key_exists('category_id', $body))  $updates['category_id']  = is_numeric($body['category_id']) ? (int) $body['category_id'] : null;
        if (isset($body['is_featured']))              $updates['is_featured']  = ($body['is_featured'] == '1') ? 1 : 0;
        if (isset($body['sort_order']))               $updates['sort_order']   = (int) $body['sort_order'];
        if (isset($body['status']) && in_array($body['status'], ['active', 'inactive'], true)) {
            $updates['status'] = $body['status'];
        }
        if (isset($body['discount_percent']) && is_numeric($body['discount_percent'])) {
            $updates['discount_percent'] = max(0, min(90, (float) $body['discount_percent']));
        }

        if (!empty($updates)) {
            Product::update($id, $updates);
        }

        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
            try {
                $imagePath = (new ImageUploadService())->handleUpload('image', $id);
                Product::addImage($id, $imagePath, $updates['name'] ?? $product['name'], 0);
            } catch (\RuntimeException $e) {
                Response::error($e->getMessage(), 422);
            }
        }

        $updated = Product::findByIdAdmin($id);
        Response::success(['product' => $updated], 'Product updated successfully.');
    }

    // DELETE /api/admin/products/{id}
    public function destroy(array $params): void
    {
        AdminMiddleware::handle();

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::error('Invalid product ID.', 400);
        }

        if (Product::findByIdAdmin($id) === null) {
            Response::error('Product not found.', 404);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('UPDATE products SET deleted_at = NOW(), status = "inactive" WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Product deleted successfully.');
    }

    // POST /api/admin/products/{id}/variants
    public function addVariant(array $params): void
    {
        AdminMiddleware::handle();

        $productId = (int) ($params['id'] ?? 0);
        if ($productId <= 0 || Product::findByIdAdmin($productId) === null) {
            Response::error('Product not found.', 404);
        }

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw ?: '', true) ?: [];

        $allowedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        $errors       = [];

        if (empty($body['size']) || !in_array($body['size'], $allowedSizes, true)) {
            $errors['size'][] = 'Size must be one of: ' . implode(', ', $allowedSizes) . '.';
        }
        if (empty($body['color'])) {
            $errors['color'][] = 'Color is required.';
        }
        if (!isset($body['stock']) || !is_numeric($body['stock']) || (int) $body['stock'] < 0) {
            $errors['stock'][] = 'Stock must be a non-negative integer.';
        }
        if (!empty($errors)) {
            Response::error('Validation failed.', 422, $errors);
        }

        $pdo = Database::getInstance();
        $dup = $pdo->prepare('SELECT id FROM product_variants WHERE product_id = ? AND size = ? AND color = ? LIMIT 1');
        $dup->execute([$productId, $body['size'], $body['color']]);
        if ($dup->fetch()) {
            Response::error('A variant with this size and color already exists for this product.', 422);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO product_variants (product_id, size, color, color_hex, stock, price_override, sku)
             VALUES (:product_id, :size, :color, :color_hex, :stock, :price_override, :sku)'
        );
        $stmt->execute([
            'product_id'     => $productId,
            'size'           => $body['size'],
            'color'          => $body['color'],
            'color_hex'      => $body['color_hex']      ?? null,
            'stock'          => (int) $body['stock'],
            'price_override' => isset($body['price_override']) && is_numeric($body['price_override']) ? (float) $body['price_override'] : null,
            'sku'            => $body['sku']            ?? null,
        ]);

        $variantId = (int) $pdo->lastInsertId();
        $variant   = ProductVariant::findById($variantId);

        Response::success(['variant' => $variant], 'Variant added successfully.', 201);
    }

    // PUT /api/admin/products/{id}/variants/{vid}
    public function updateVariant(array $params): void
    {
        AdminMiddleware::handle();

        $productId = (int) ($params['id']  ?? 0);
        $variantId = (int) ($params['vid'] ?? 0);

        $variant = ProductVariant::findById($variantId);
        if ($variant === null || (int) $variant['product_id'] !== $productId) {
            Response::error('Variant not found.', 404);
        }

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw ?: '', true) ?: [];

        $allowedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        $updates      = [];

        if (isset($body['size'])) {
            if (!in_array($body['size'], $allowedSizes, true)) {
                Response::error('Validation failed.', 422, ['size' => ['Invalid size value.']]);
            }
            $updates['size'] = $body['size'];
        }
        if (isset($body['color']))          $updates['color']          = $body['color'];
        if (isset($body['color_hex']))       $updates['color_hex']      = $body['color_hex'];
        if (isset($body['stock']))           $updates['stock']          = max(0, (int) $body['stock']);
        if (array_key_exists('price_override', $body)) {
            $updates['price_override'] = ($body['price_override'] !== null && is_numeric($body['price_override']))
                ? (float) $body['price_override'] : null;
        }
        if (isset($body['sku']))             $updates['sku']            = $body['sku'];

        if (!empty($updates)) {
            $sets = implode(', ', array_map(fn($k) => "{$k} = :{$k}", array_keys($updates)));
            $updates['id'] = $variantId;
            $pdo  = Database::getInstance();
            $stmt = $pdo->prepare("UPDATE product_variants SET {$sets} WHERE id = :id");
            $stmt->execute($updates);
        }

        $updated = ProductVariant::findById($variantId);
        Response::success(['variant' => $updated], 'Variant updated successfully.');
    }

    // DELETE /api/admin/products/{id}/variants/{vid}
    public function deleteVariant(array $params): void
    {
        AdminMiddleware::handle();

        $productId = (int) ($params['id']  ?? 0);
        $variantId = (int) ($params['vid'] ?? 0);

        $variant = ProductVariant::findById($variantId);
        if ($variant === null || (int) $variant['product_id'] !== $productId) {
            Response::error('Variant not found.', 404);
        }

        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('DELETE FROM product_variants WHERE id = ?');
        $stmt->execute([$variantId]);

        Response::success(null, 'Variant deleted successfully.');
    }

    // -------------------------------------------------------------------------

    // POST /api/admin/products/{id}/images
    public function addImage(array $params): void
    {
        AdminMiddleware::handle();

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::error('Invalid product ID.', 400);
        }

        $product = Product::findByIdAdmin($id);
        if ($product === null) {
            Response::error('Product not found.', 404);
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
            Response::error('No image file provided.', 422);
        }

        try {
            $imagePath = (new ImageUploadService())->handleUpload('image', $id);
            $isPrimary = (int) ($_POST['is_primary'] ?? 0);
            $altText   = trim($_POST['alt_text'] ?? $product['name'] ?? '');
            $sortOrder = (int) ($_POST['sort_order'] ?? 0);

            $pdo = \Bluecollar\Bootstrap\Database::getInstance();

            if ($isPrimary) {
                // Demote all existing primary images
                $pdo->prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?')->execute([$id]);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO product_images (product_id, image_path, alt_text, sort_order, is_primary)
                 VALUES (:product_id, :image_path, :alt_text, :sort_order, :is_primary)'
            );
            $stmt->execute([
                'product_id' => $id,
                'image_path' => $imagePath,
                'alt_text'   => $altText,
                'sort_order' => $sortOrder,
                'is_primary' => $isPrimary ? 1 : 0,
            ]);

            $imageId = (int) $pdo->lastInsertId();
            $image   = $pdo->prepare('SELECT * FROM product_images WHERE id = ?');
            $image->execute([$imageId]);

            Response::success(['image' => $image->fetch()], 'Image added successfully.', 201);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }
    }

    // DELETE /api/admin/products/{id}/images/{imageId}
    public function deleteImage(array $params): void
    {
        AdminMiddleware::handle();

        $productId = (int) ($params['id']      ?? 0);
        $imageId   = (int) ($params['imageId'] ?? 0);

        if ($productId <= 0 || $imageId <= 0) {
            Response::error('Invalid ID.', 400);
        }

        if (Product::findByIdAdmin($productId) === null) {
            Response::error('Product not found.', 404);
        }

        $deleted = Product::deleteImage($productId, $imageId);
        if (!$deleted) {
            Response::error('Image not found.', 404);
        }

        Response::success(null, 'Image deleted successfully.');
    }

    // -------------------------------------------------------------------------

    private function generateSlug(string $name, ?int $excludeId = null): string
    {
        $base = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $name), '-'));
        $slug = $base;
        $n    = 2;

        while (Product::slugExists($slug, $excludeId)) {
            $slug = $base . '-' . $n++;
        }

        return $slug;
    }
}
