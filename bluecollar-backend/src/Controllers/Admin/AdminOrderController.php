<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Helpers\Response;
use Bluecollar\Middleware\AdminMiddleware;
use Bluecollar\Models\Order;
use Bluecollar\Models\OrderItem;
use Bluecollar\Services\PdfInvoiceService;
use Bluecollar\Services\SettingsService;

class AdminOrderController
{
    private const VALID_TRANSITIONS = [
        'Pending'    => ['Confirmed', 'Cancelled'],
        'Confirmed'  => ['Processing', 'Cancelled'],
        'Processing' => ['Shipped',    'Cancelled'],
        'Shipped'    => ['Delivered',  'Cancelled'],
        'Delivered'  => [],
        'Cancelled'  => [],
    ];

    // GET /api/admin/orders
    public function index(array $params): void
    {
        AdminMiddleware::handle();

        $page   = max(1, (int) ($_GET['page']  ?? 1));
        $limit  = min(50, max(1, (int) ($_GET['limit'] ?? 20)));
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');

        $result     = Order::adminList($status, $search, $page, $limit);
        $totalPages = (int) ceil(($result['total'] ?: 1) / $limit);

        Response::success([
            'orders'     => $result['items'],
            'pagination' => [
                'total'       => $result['total'],
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => $totalPages,
            ],
        ], 'Orders retrieved successfully.');
    }

    // GET /api/admin/orders/{id}
    public function show(array $params): void
    {
        AdminMiddleware::handle();

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::error('Invalid order ID.', 400);
        }

        $order = Order::findByIdAdmin($id);
        if ($order === null) {
            Response::error('Order not found.', 404);
        }

        $items   = OrderItem::forOrder($id);
        $history = Order::statusHistory($id);

        Response::success([
            'order'   => $order,
            'items'   => $items,
            'history' => $history,
        ], 'Order retrieved successfully.');
    }

    // PUT /api/admin/orders/{id}/status
    public function updateStatus(array $params): void
    {
        AdminMiddleware::handle();
        $admin = AdminMiddleware::$admin;

        $id = (int) ($params['id'] ?? 0);
        if ($id <= 0) {
            Response::error('Invalid order ID.', 400);
        }

        $order = Order::findByIdAdmin($id);
        if ($order === null) {
            Response::error('Order not found.', 404);
        }

        $raw  = file_get_contents('php://input');
        $body = json_decode($raw ?: '', true) ?: [];

        $newStatus = trim($body['status'] ?? '');
        $note      = trim($body['note']   ?? '');

        if ($newStatus === '') {
            Response::error('Validation failed.', 422, ['status' => ['Status is required.']]);
        }

        $currentStatus = $order['status'];
        $allowed       = self::VALID_TRANSITIONS[$currentStatus] ?? [];

        if (empty($allowed)) {
            Response::error("Order status '{$currentStatus}' is final and cannot be changed.", 422);
        }

        if (!in_array($newStatus, $allowed, true)) {
            Response::error(
                "Cannot transition from '{$currentStatus}' to '{$newStatus}'. Allowed next statuses: " . implode(', ', $allowed) . '.',
                422
            );
        }

        Order::updateStatus($id, $newStatus);
        Order::addStatusHistoryRecord($id, $currentStatus, $newStatus, (int) $admin['id'], $note !== '' ? $note : null);

        $updated = Order::findByIdAdmin($id);
        Response::success(['order' => $updated], 'Order status updated successfully.');
    }
}
