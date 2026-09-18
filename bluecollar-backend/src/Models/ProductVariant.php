<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;
use PDO;

/**
 * ProductVariant model — maps to the `product_variants` table.
 */
class ProductVariant
{
    /**
     * Find a variant by its id, with a SELECT FOR UPDATE lock (use inside transaction).
     */
    public static function findForUpdate(int $id): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, product_id, size, color, stock, price_override, sku
             FROM product_variants
             WHERE id = ?
             FOR UPDATE'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Find a variant by its id (no lock).
     */
    public static function findById(int $id): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, product_id, size, color, stock, price_override, sku
             FROM product_variants
             WHERE id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * All variants for a given product.
     */
    public static function forProduct(int $productId): array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, size, color, stock, price_override, sku
             FROM product_variants
             WHERE product_id = ?
             ORDER BY FIELD(size, "XS","S","M","L","XL","XXL","XXXL"), color'
        );
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    /**
     * Decrement stock by the given quantity.
     */
    public static function decrementStock(int $id, int $qty): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'UPDATE product_variants SET stock = stock - :qty WHERE id = :id'
        );
        $stmt->execute(['qty' => $qty, 'id' => $id]);
    }
}
