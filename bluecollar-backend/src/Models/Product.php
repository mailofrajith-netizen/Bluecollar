<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;
use PDO;

/**
 * Product model — maps to the `products` and related tables.
 */
class Product
{
    // -----------------------------------------------------------------------
    // List (B-04)
    // -----------------------------------------------------------------------

    /**
     * Return a paginated, filtered, sorted list of active products.
     *
     * @param array $filters  Keys: category, size, color, min_price, max_price, search, sort
     * @param int   $page     1-based page number
     * @param int   $limit    Items per page (max 48)
     * @return array{items: array, total: int}
     */
    public static function list(array $filters, int $page, int $limit): array
    {
        $pdo = Database::getInstance();

        $where  = ['p.status = "active"', 'p.deleted_at IS NULL'];
        $params = [];

        // Category filter (by slug)
        if (!empty($filters['category'])) {
            $where[]              = 'c.slug = :category';
            $params['category']   = $filters['category'];
        }

        // Price range
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $where[]              = 'p.base_price >= :min_price';
            $params['min_price']  = (float) $filters['min_price'];
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $where[]              = 'p.base_price <= :max_price';
            $params['max_price']  = (float) $filters['max_price'];
        }

        // Search
        if (!empty($filters['search'])) {
            $where[]              = '(p.name LIKE :search OR p.description LIKE :search)';
            $params['search']     = '%' . $filters['search'] . '%';
        }

        // Size / color filters require joining to variants
        $variantJoin = '';
        if (!empty($filters['size'])) {
            $variantJoin          = 'INNER JOIN product_variants pv ON pv.product_id = p.id AND pv.stock > 0';
            $where[]              = 'pv.size = :size';
            $params['size']       = $filters['size'];
        } elseif (!empty($filters['color'])) {
            $variantJoin          = 'INNER JOIN product_variants pv ON pv.product_id = p.id AND pv.stock > 0';
        }

        if (!empty($filters['color'])) {
            if ($variantJoin === '') {
                $variantJoin      = 'INNER JOIN product_variants pv ON pv.product_id = p.id AND pv.stock > 0';
            }
            $where[]              = 'pv.color = :color';
            $params['color']      = $filters['color'];
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        // Count query
        $countSql = "SELECT COUNT(DISTINCT p.id) AS total
                     FROM products p
                     LEFT JOIN categories c ON c.id = p.category_id
                     {$variantJoin}
                     {$whereClause}";

        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) ($countStmt->fetchColumn() ?: 0);

        // Sorting
        $orderBy = match ($filters['sort'] ?? '') {
            'price_asc'  => 'p.base_price ASC',
            'price_desc' => 'p.base_price DESC',
            'featured'   => 'p.is_featured DESC, p.created_at DESC',
            default      => 'p.created_at DESC', // newest
        };

        $offset = ($page - 1) * $limit;

        // Main query — grab primary image and distinct product rows
        $sql = "SELECT DISTINCT p.id, p.name, p.slug, p.base_price, p.discount_percent, p.is_featured,
                       pi.image_path AS primary_image, pi.alt_text AS primary_image_alt
                FROM products p
                LEFT JOIN categories c ON c.id = p.category_id
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
                {$variantJoin}
                {$whereClause}
                ORDER BY {$orderBy}
                LIMIT :limit OFFSET :offset";

        $stmt = $pdo->prepare($sql);

        // Bind named params already in $params
        foreach ($params as $key => $value) {
            $type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
            $stmt->bindValue(':' . $key, $value, $type);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();

        if (empty($rows)) {
            return ['items' => [], 'total' => $total];
        }

        // Enrich with available sizes and colors from variants
        $productIds = array_column($rows, 'id');
        $inPlaceholders = implode(',', array_fill(0, count($productIds), '?'));

        $varStmt = $pdo->prepare(
            "SELECT product_id, size, color
             FROM product_variants
             WHERE product_id IN ({$inPlaceholders}) AND stock > 0
             GROUP BY product_id, size, color"
        );
        $varStmt->execute($productIds);

        $variantData = [];
        foreach ($varStmt->fetchAll() as $v) {
            $pid = (int) $v['product_id'];
            if (!isset($variantData[$pid])) {
                $variantData[$pid] = ['sizes' => [], 'colors' => []];
            }
            if (!in_array($v['size'], $variantData[$pid]['sizes'], true)) {
                $variantData[$pid]['sizes'][] = $v['size'];
            }
            if (!in_array($v['color'], $variantData[$pid]['colors'], true)) {
                $variantData[$pid]['colors'][] = $v['color'];
            }
        }

        $items = [];
        foreach ($rows as $row) {
            $pid    = (int) $row['id'];
            $items[] = [
                'id'                => $pid,
                'name'              => $row['name'],
                'slug'              => $row['slug'],
                'base_price'        => (float) $row['base_price'],
                'discount_percent'  => (float) ($row['discount_percent'] ?? 0),
                'is_featured'       => (bool) $row['is_featured'],
                'primary_image'     => $row['primary_image'],
                'primary_image_alt' => $row['primary_image_alt'],
                'available_sizes'   => $variantData[$pid]['sizes'] ?? [],
                'available_colors'  => $variantData[$pid]['colors'] ?? [],
            ];
        }

        return ['items' => $items, 'total' => $total];
    }

    // -----------------------------------------------------------------------
    // Detail (B-05)
    // -----------------------------------------------------------------------

    /**
     * Find a single active product by numeric id or slug.
     */
    public static function findByIdOrSlug(string $idOrSlug): ?array
    {
        $pdo = Database::getInstance();

        if (ctype_digit($idOrSlug)) {
            $stmt = $pdo->prepare(
                'SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.id = :val AND p.status = "active" AND p.deleted_at IS NULL
                 LIMIT 1'
            );
        } else {
            $stmt = $pdo->prepare(
                'SELECT p.*, c.name AS category_name, c.slug AS category_slug
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.slug = :val AND p.status = "active" AND p.deleted_at IS NULL
                 LIMIT 1'
            );
        }

        $stmt->execute(['val' => $idOrSlug]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Get all images for a product.
     */
    public static function getImages(int $productId): array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, image_path, alt_text, is_primary, sort_order
             FROM product_images
             WHERE product_id = ?
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    /**
     * Find a product by id (no status/deleted check — for internal use).
     */
    public static function findById(int $id): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, name, slug, base_price, description FROM products WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    // -----------------------------------------------------------------------
    // Admin methods
    // -----------------------------------------------------------------------

    public static function findByIdAdmin(int $id): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT p.*, pi.image_path AS primary_image,
                    COUNT(DISTINCT pv.id) AS variant_count
             FROM products p
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             LEFT JOIN product_variants pv ON pv.product_id = p.id
             WHERE p.id = ?
             GROUP BY p.id
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $pdo = Database::getInstance();
        if ($excludeId !== null) {
            $stmt = $pdo->prepare('SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1');
            $stmt->execute([$slug, $excludeId]);
        } else {
            $stmt = $pdo->prepare('SELECT id FROM products WHERE slug = ? LIMIT 1');
            $stmt->execute([$slug]);
        }
        return $stmt->fetch() !== false;
    }

    public static function adminList(string $search, string $status, int $page, int $limit, bool $includeDeleted = false): array
    {
        $pdo    = Database::getInstance();
        $where  = [];
        $params = [];

        if (!$includeDeleted) {
            $where[] = 'p.deleted_at IS NULL';
        }
        if ($search !== '') {
            $where[]          = 'p.name LIKE :search';
            $params['search'] = '%' . $search . '%';
        }
        if ($status !== '') {
            $where[]          = 'p.status = :status';
            $params['status'] = $status;
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $offset      = ($page - 1) * $limit;

        $cStmt = $pdo->prepare("SELECT COUNT(DISTINCT p.id) FROM products p {$whereClause}");
        $cStmt->execute($params);
        $total = (int) $cStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT p.id, p.name, p.slug, p.base_price, p.discount_percent, p.status, p.is_featured,
                    p.deleted_at, p.created_at,
                    pi.image_path AS primary_image,
                    COUNT(DISTINCT pv.id) AS variant_count, COALESCE(SUM(pv.stock), 0) AS total_stock
             FROM products p
             LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
             LEFT JOIN product_variants pv ON pv.product_id = p.id
             {$whereClause}
             GROUP BY p.id
             ORDER BY p.created_at DESC
             LIMIT :lim OFFSET :off"
        );
        foreach ($params as $key => $val) {
            $stmt->bindValue(':' . $key, $val);
        }
        $stmt->bindValue(':lim', $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['items' => $stmt->fetchAll(), 'total' => $total];
    }

    public static function create(array $data): int
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO products (name, slug, description, base_price, discount_percent, category_id, is_featured, sort_order, status, created_at, updated_at)
             VALUES (:name, :slug, :description, :base_price, :discount_percent, :category_id, :is_featured, :sort_order, :status, NOW(), NOW())'
        );
        $stmt->execute([
            'name'             => $data['name'],
            'slug'             => $data['slug'],
            'description'      => $data['description']      ?? null,
            'base_price'       => $data['base_price'],
            'discount_percent' => $data['discount_percent'] ?? 0,
            'category_id'      => $data['category_id']      ?? null,
            'is_featured'      => $data['is_featured']      ?? 0,
            'sort_order'       => $data['sort_order']       ?? 0,
            'status'           => $data['status']           ?? 'active',
        ]);
        return (int) $pdo->lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $allowed = ['name', 'slug', 'description', 'base_price', 'discount_percent', 'category_id', 'is_featured', 'sort_order', 'status'];
        $data    = array_intersect_key($data, array_flip($allowed));

        if (empty($data)) {
            return;
        }

        $pdo  = Database::getInstance();
        $sets = implode(', ', array_map(fn($k) => "{$k} = :{$k}", array_keys($data)));
        $data['id'] = $id;
        $stmt = $pdo->prepare("UPDATE products SET {$sets}, updated_at = NOW() WHERE id = :id");
        $stmt->execute($data);
    }

    public static function addImage(int $productId, string $imagePath, string $altText = '', int $sortOrder = 0): void
    {
        $pdo = Database::getInstance();
        $pdo->prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?')->execute([$productId]);
        $stmt = $pdo->prepare(
            'INSERT INTO product_images (product_id, image_path, alt_text, sort_order, is_primary)
             VALUES (:product_id, :image_path, :alt_text, :sort_order, 1)'
        );
        $stmt->execute([
            'product_id' => $productId,
            'image_path' => $imagePath,
            'alt_text'   => $altText,
            'sort_order' => $sortOrder,
        ]);
    }

    public static function deleteImage(int $productId, int $imageId): bool
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('DELETE FROM product_images WHERE id = ? AND product_id = ?');
        $stmt->execute([$imageId, $productId]);
        if ($stmt->rowCount() > 0) {
            // If we deleted the primary image, promote another
            $check = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ? AND is_primary = 1');
            $check->execute([$productId]);
            if ((int) $check->fetchColumn() === 0) {
                $pdo->prepare('UPDATE product_images SET is_primary = 1 WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1')
                    ->execute([$productId]);
            }
            return true;
        }
        return false;
    }
}
