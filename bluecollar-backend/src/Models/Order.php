<?php
declare(strict_types=1);

namespace Bluecollar\Models;

use Bluecollar\Bootstrap\Database;
use PDO;

/**
 * Order model — maps to the `orders` and related tables.
 */
class Order
{
    // Safe columns to return in public-facing responses (no sensitive data)
    private const PUBLIC_COLUMNS = [
        'id', 'order_number', 'user_id',
        'guest_name', 'guest_email', 'guest_phone',
        'shipping_address', 'shipping_city', 'shipping_state', 'shipping_pincode',
        'subtotal', 'shipping_charge', 'tax_amount', 'total_amount',
        'payment_method', 'status', 'notes', 'created_at',
    ];

    // -----------------------------------------------------------------------
    // Create
    // -----------------------------------------------------------------------

    /**
     * Insert a new order row.
     *
     * @return int New order id
     */
    public static function create(array $data): int
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO orders (
                order_number, user_id,
                guest_name, guest_email, guest_phone,
                shipping_name, shipping_phone, shipping_email,
                shipping_address, shipping_line2, shipping_city, shipping_state, shipping_pincode,
                subtotal, shipping_charge, tax_amount, total_amount,
                payment_method, status, invoice_token, invoice_token_expires_at, notes, created_at
             ) VALUES (
                :order_number, :user_id,
                :guest_name, :guest_email, :guest_phone,
                :shipping_name, :shipping_phone, :shipping_email,
                :shipping_address, :shipping_line2, :shipping_city, :shipping_state, :shipping_pincode,
                :subtotal, :shipping_charge, :tax_amount, :total_amount,
                :payment_method, :status, :invoice_token, :invoice_token_expires_at, :notes, NOW()
             )'
        );

        $stmt->execute([
            'order_number'    => $data['order_number'],
            'user_id'         => $data['user_id'] ?? null,
            'guest_name'      => $data['guest_name'] ?? null,
            'guest_email'     => $data['guest_email'] ?? null,
            'guest_phone'     => $data['guest_phone'] ?? null,
            'shipping_name'   => $data['guest_name'] ?? null,
            'shipping_phone'  => $data['guest_phone'] ?? null,
            'shipping_email'  => $data['guest_email'] ?? null,
            'shipping_address' => $data['shipping_address'],
            'shipping_line2'  => $data['shipping_line2'] ?? null,
            'shipping_city'   => $data['shipping_city'],
            'shipping_state'  => $data['shipping_state'],
            'shipping_pincode' => $data['shipping_pincode'],
            'subtotal'        => $data['subtotal'],
            'shipping_charge' => $data['shipping_charge'],
            'tax_amount'      => $data['tax_amount'],
            'total_amount'    => $data['total_amount'],
            'payment_method'  => 'COD',
            'status'          => 'Pending',
            'invoice_token'            => $data['invoice_token'],
            'invoice_token_expires_at' => $data['invoice_token_expires_at'] ?? null,
            'notes'                    => $data['notes'] ?? null,
        ]);

        return (int) $pdo->lastInsertId();
    }

    /**
     * Insert the initial order status history entry.
     */
    public static function addStatusHistory(int $orderId, string $status, ?string $changedBy = null, ?string $notes = null): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note, changed_at)
             VALUES (:order_id, NULL, :to_status, NULL, :note, NOW())'
        );
        $stmt->execute([
            'order_id'  => $orderId,
            'to_status' => $status,
            'note'      => $notes,
        ]);
    }

    // -----------------------------------------------------------------------
    // Read
    // -----------------------------------------------------------------------

    /**
     * Find an order by id — for authenticated user (checks user_id).
     */
    public static function findByIdForUser(int $orderId, int $userId): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT id, order_number, user_id,
                    guest_name, guest_email, guest_phone,
                    shipping_address, shipping_city, shipping_state, shipping_pincode,
                    subtotal, shipping_charge, tax_amount, total_amount,
                    payment_method, status, notes, created_at
             FROM orders
             WHERE id = :id AND user_id = :user_id
             LIMIT 1'
        );
        $stmt->execute(['id' => $orderId, 'user_id' => $userId]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Find an order by invoice_token only (token-based public access with expiry check).
     * Used for PDF invoice download without authentication.
     */
    public static function findByToken(string $token): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT o.*, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.invoice_token = ?
               AND (o.invoice_token_expires_at IS NULL OR o.invoice_token_expires_at > NOW())
             LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Find an order by id for invoice generation (authenticated user must own the order).
     * Includes user_email for PDF generation.
     */
    public static function findByIdWithEmail(int $orderId, int $userId): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT o.*, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ? AND o.user_id = ?
             LIMIT 1'
        );
        $stmt->execute([$orderId, $userId]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * @deprecated Use findByToken() or findByIdWithEmail() instead.
     * Kept for internal use by OrderService after order creation.
     */
    public static function findByIdOrToken(string $idOrToken): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT o.*, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ?
             LIMIT 1'
        );
        $stmt->execute([$idOrToken]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /**
     * Paginated order list for an authenticated user.
     *
     * @return array{items: array, total: int}
     */
    public static function listForUser(int $userId, int $page, int $limit): array
    {
        $pdo    = Database::getInstance();
        $offset = ($page - 1) * $limit;

        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM orders WHERE user_id = ?');
        $countStmt->execute([$userId]);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            'SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
                    COUNT(oi.id) AS item_count
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             WHERE o.user_id = :user_id
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['items' => $stmt->fetchAll(), 'total' => $total];
    }

    /**
     * Track an order by order_number + email (guest or registered user email).
     */
    public static function findByNumberAndEmail(string $orderNumber, string $email): ?array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT o.id, o.order_number, o.status,
                    o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_pincode,
                    o.subtotal, o.shipping_charge, o.tax_amount, o.total_amount,
                    o.payment_method, o.created_at
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.order_number = :order_number
               AND (o.guest_email = :email OR u.email = :email2)
             LIMIT 1'
        );
        $stmt->execute([
            'order_number' => $orderNumber,
            'email'        => $email,
            'email2'       => $email,
        ]);
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
            'SELECT o.*, u.name AS user_name, u.email AS user_email
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             WHERE o.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    public static function adminList(string $status, string $search, int $page, int $limit): array
    {
        $pdo    = Database::getInstance();
        $where  = [];
        $params = [];
        $offset = ($page - 1) * $limit;

        if ($status !== '') {
            $where[]          = 'o.status = :status';
            $params['status'] = $status;
        }
        if ($search !== '') {
            $where[]           = '(o.order_number LIKE :s1 OR o.guest_email LIKE :s2 OR u.email LIKE :s3)';
            $params['s1']      = '%' . $search . '%';
            $params['s2']      = '%' . $search . '%';
            $params['s3']      = '%' . $search . '%';
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $cStmt = $pdo->prepare(
            "SELECT COUNT(DISTINCT o.id) FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             {$whereClause}"
        );
        $cStmt->execute($params);
        $total = (int) $cStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT o.id, o.order_number, o.status, o.total_amount, o.payment_method,
                    o.shipping_city, o.created_at,
                    COALESCE(o.guest_name,  u.name)  AS customer_name,
                    COALESCE(o.guest_email, u.email) AS customer_email,
                    COUNT(oi.id) AS item_count
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             LEFT JOIN order_items oi ON oi.order_id = o.id
             {$whereClause}
             GROUP BY o.id
             ORDER BY o.created_at DESC
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

    public static function statusHistory(int $orderId): array
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'SELECT h.from_status, h.to_status, h.note, h.changed_at,
                    u.name AS changed_by_name
             FROM order_status_history h
             LEFT JOIN users u ON u.id = h.changed_by
             WHERE h.order_id = ?
             ORDER BY h.changed_at ASC'
        );
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }

    public static function updateStatus(int $id, string $status): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);
    }

    public static function addStatusHistoryRecord(int $orderId, string $fromStatus, string $toStatus, int $changedBy, ?string $note): void
    {
        $pdo  = Database::getInstance();
        $stmt = $pdo->prepare(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note, changed_at)
             VALUES (:order_id, :from_status, :to_status, :changed_by, :note, NOW())'
        );
        $stmt->execute([
            'order_id'    => $orderId,
            'from_status' => $fromStatus,
            'to_status'   => $toStatus,
            'changed_by'  => $changedBy,
            'note'        => $note,
        ]);
    }
}
