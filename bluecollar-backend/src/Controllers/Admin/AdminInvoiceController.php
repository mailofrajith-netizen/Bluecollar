<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Bootstrap\Database;
use Bluecollar\Helpers\Response;
use Bluecollar\Middleware\AdminMiddleware;
use Bluecollar\Models\Order;
use Bluecollar\Models\OrderItem;
use Bluecollar\Services\PdfInvoiceService;
use Bluecollar\Services\SettingsService;
use PDO;

class AdminInvoiceController
{
    // GET /api/admin/invoices
    public function index(array $params): void
    {
        AdminMiddleware::handle();

        $page   = max(1, (int) ($_GET['page']  ?? 1));
        $limit  = min(50, max(1, (int) ($_GET['limit'] ?? 20)));
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $offset = ($page - 1) * $limit;

        $pdo   = Database::getInstance();
        $where = [];
        $binds = [];

        if ($status !== '') {
            $where[]         = 'o.status = :status';
            $binds['status'] = $status;
        }
        if ($search !== '') {
            $where[]         = 'o.order_number LIKE :search';
            $binds['search'] = '%' . $search . '%';
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $cStmt = $pdo->prepare("SELECT COUNT(*) FROM orders o {$whereClause}");
        $cStmt->execute($binds);
        $total = (int) $cStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT o.id, o.order_number,
                    COALESCE(o.guest_name,  u.name)  AS customer_name,
                    COALESCE(o.guest_email, u.email) AS customer_email,
                    o.total_amount, o.status, o.created_at
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             {$whereClause}
             ORDER BY o.created_at DESC
             LIMIT :lim OFFSET :off"
        );
        foreach ($binds as $key => $val) {
            $stmt->bindValue(':' . $key, $val);
        }
        $stmt->bindValue(':lim', $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $invoices = array_map(static function (array $row): array {
            return [
                'id'             => (int)   $row['id'],
                'order_number'   =>         $row['order_number'],
                'customer_name'  =>         $row['customer_name'],
                'customer_email' =>         $row['customer_email'],
                'total_amount'   => (float) $row['total_amount'],
                'status'         =>         $row['status'],
                'created_at'     =>         $row['created_at'],
            ];
        }, $stmt->fetchAll());

        Response::success([
            'invoices'   => $invoices,
            'pagination' => [
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil(($total ?: 1) / $limit),
            ],
        ], 'Invoices retrieved successfully.');
    }

    // GET /api/admin/invoices/{order_id}/download
    public function download(array $params): void
    {
        AdminMiddleware::handle();

        $orderId = (int) ($params['order_id'] ?? 0);
        if ($orderId <= 0) {
            Response::error('Invalid order ID.', 400);
        }

        $order = Order::findByIdAdmin($orderId);
        if ($order === null) {
            Response::error('Order not found.', 404);
        }

        if (empty($order['guest_email']) && !empty($order['user_email'])) {
            $order['guest_email'] = $order['user_email'];
        }

        $items    = OrderItem::forOrder($orderId);
        $settings = SettingsService::all();

        try {
            $pdfBinary = (new PdfInvoiceService())->generate($order, $items, $settings);
        } catch (\Throwable) {
            Response::error('Could not generate invoice. Please try again later.', 500);
        }

        $filename = 'invoice-' . $order['order_number'] . '.pdf';

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdfBinary));
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        echo $pdfBinary;
        exit();
    }
}
