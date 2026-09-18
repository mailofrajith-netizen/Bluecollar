<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;

/**
 * OrderItem model — maps to the `order_items` table.
 */
class OrderItem
{
    /**
     * Insert a single order item.
     */
    public static function create(int $orderId, array $item): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO order_items
                (order_id, product_id, variant_id, product_name, variant_details,
                 quantity, unit_price, line_total, hsn_code)
             VALUES
                (:order_id, :product_id, :variant_id, :product_name, :variant_details,
                 :quantity, :unit_price, :line_total, :hsn_code)'
        );
        $stmt->execute([
            'order_id'       => $orderId,
            'product_id'     => $item['product_id'],
            'variant_id'     => $item['variant_id'],
            'product_name'   => $item['product_name'],
            'variant_details' => $item['variant_details'],
            'quantity'       => $item['quantity'],
            'unit_price'     => $item['unit_price'],
            'line_total'     => $item['line_total'],
            'hsn_code'       => $item['hsn_code'] ?? null,
        ]);
    }

    /**
     * Fetch all items for a given order.
     */
    public static function forOrder(int $orderId): array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, product_id, variant_id, product_name, variant_details,
                    quantity, unit_price, line_total, hsn_code
             FROM order_items
             WHERE order_id = ?
             ORDER BY id ASC'
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }
}
