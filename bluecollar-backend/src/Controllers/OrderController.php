<?php
declare(strict_types=1);

namespace Bluecollar\Controllers;

use Bluecollar\Helpers\Response;
use Bluecollar\Helpers\Validator;
use Bluecollar\Middleware\AuthMiddleware;
use Bluecollar\Models\Order;
use Bluecollar\Models\OrderItem;
use Bluecollar\Models\User;
use Bluecollar\Services\MailerService;
use Bluecollar\Services\OrderService;
use Bluecollar\Services\PdfInvoiceService;
use Bluecollar\Services\SettingsService;

/**
 * Customer order endpoints.
 *
 * B-06: POST /api/orders            — place order (guest or authenticated)
 * B-07: GET  /api/orders/{id}       — order detail (authenticated)
 * B-08: GET  /api/orders            — order list (authenticated)
 * B-09: GET  /api/orders/track      — track by order_number + email (public)
 * B-10: GET  /api/orders/{id}/invoice — stream PDF
 */
class OrderController
{
    // -----------------------------------------------------------------------
    // B-06: Place order
    // -----------------------------------------------------------------------

    public function store(array $params): void
    {
        $body = $this->parseJson();

        // Determine if the user is authenticated (token optional here)
        $userId    = null;
        $authUser  = null;

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
        if (str_starts_with($authHeader, 'Bearer ')) {
            try {
                AuthMiddleware::handle();
                $authUser = AuthMiddleware::$user;
                $userId   = (int) $authUser['id'];
            } catch (\Throwable) {
                // Token invalid — treat as guest
                $userId   = null;
                $authUser = null;
            }
        }

        $isGuest = ($userId === null);

        // Validate common fields
        $v = Validator::make($body)
            ->required('items', 'Items')
            ->array('items', 'Items')
            ->notEmpty('items', 'Items')
            ->required('shipping_address', 'Shipping address')
            ->maxLength('shipping_address', 255, 'Shipping address')
            ->maxLength('shipping_line2', 255, 'Address line 2')
            ->required('shipping_city', 'City')
            ->maxLength('shipping_city', 100, 'City')
            ->required('shipping_state', 'State')
            ->maxLength('shipping_state', 100, 'State')
            ->required('shipping_pincode', 'Pincode')
            ->pincode('shipping_pincode', 'Pincode');

        // Guest-only required fields
        if ($isGuest) {
            $v->required('name', 'Name')
              ->maxLength('name', 100, 'Name')
              ->required('email', 'Email')
              ->email('email', 'Email')
              ->required('phone', 'Phone')
              ->phone('phone', 'Phone');
        }

        if ($v->fails()) {
            Response::error('Validation failed.', 422, $v->errors());
        }

        // Validate items array structure
        $itemErrors = [];
        foreach ($body['items'] as $idx => $item) {
            if (!isset($item['variant_id']) || !is_numeric($item['variant_id']) || (int) $item['variant_id'] <= 0) {
                $itemErrors["items.{$idx}.variant_id"][] = 'variant_id must be a positive integer.';
            }
            if (!isset($item['quantity']) || !is_numeric($item['quantity']) || (int) $item['quantity'] < 1) {
                $itemErrors["items.{$idx}.quantity"][] = 'quantity must be at least 1.';
            }
        }
        if (!empty($itemErrors)) {
            Response::error('Validation failed.', 422, $itemErrors);
        }

        // For authenticated users, fill name/email/phone from their profile if not overridden
        if (!$isGuest && $authUser !== null) {
            $profile = User::findById($userId);
            if (!isset($body['name']) || trim($body['name']) === '') {
                $body['name'] = $profile['name'] ?? '';
            }
            if (!isset($body['email']) || trim($body['email']) === '') {
                $body['email'] = $authUser['email'] ?? '';
            }
            if (!isset($body['phone']) || trim($body['phone']) === '') {
                $body['phone'] = $profile['phone'] ?? '';
            }
        }

        try {
            $result = (new OrderService())->place($body, $userId);
        } catch (\RuntimeException $e) {
            Response::error($e->getMessage(), 422);
        }

        // Fire order confirmation email (non-blocking)
        try {
            (new MailerService())->sendOrderConfirmation($result['order'], $result['items']);
        } catch (\Throwable) {
            // Intentionally swallowed — email failure must not break order placement
        }

        Response::success([
            'order' => $this->formatOrder($result['order']),
            'items' => $result['items'],
        ], 'Order placed successfully.', 201);
    }

    // -----------------------------------------------------------------------
    // B-07: Order detail (authenticated)
    // -----------------------------------------------------------------------

    public function show(array $params): void
    {
        AuthMiddleware::handle();
        $user    = AuthMiddleware::$user;
        $orderId = (int) ($params['id'] ?? 0);

        if ($orderId <= 0) {
            Response::error('Invalid order ID.', 400);
        }

        $order = Order::findByIdForUser($orderId, (int) $user['id']);

        if ($order === null) {
            Response::error('Order not found.', 404);
        }

        $items = OrderItem::forOrder((int) $order['id']);

        Response::success([
            'order' => $this->formatOrder($order),
            'items' => $items,
        ], 'Order retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // B-08: Order list (authenticated)
    // -----------------------------------------------------------------------

    public function index(array $params): void
    {
        AuthMiddleware::handle();
        $user  = AuthMiddleware::$user;

        $page  = max(1, (int) ($_GET['page']  ?? 1));
        $limit = min(48, max(1, (int) ($_GET['limit'] ?? 10)));

        $result     = Order::listForUser((int) $user['id'], $page, $limit);
        $totalPages = (int) ceil($result['total'] / $limit);

        // Cast numeric fields
        $items = array_map(function (array $o) {
            return [
                'id'           => (int) $o['id'],
                'order_number' => $o['order_number'],
                'status'       => $o['status'],
                'total_amount' => (float) $o['total_amount'],
                'item_count'   => (int) $o['item_count'],
                'created_at'   => $o['created_at'],
            ];
        }, $result['items']);

        Response::success([
            'orders'     => $items,
            'pagination' => [
                'total'       => $result['total'],
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => $totalPages,
            ],
        ], 'Orders retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // B-09: Track order (public)
    // -----------------------------------------------------------------------

    public function track(array $params): void
    {
        $orderNumber = trim($_GET['order_number'] ?? '');
        $email       = strtolower(trim($_GET['email'] ?? ''));

        if ($orderNumber === '' || $email === '') {
            Response::error('Both order_number and email are required.', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('A valid email address is required.', 422);
        }

        $order = Order::findByNumberAndEmail($orderNumber, $email);

        if ($order === null) {
            Response::error('Order not found. Please check your order number and email.', 404);
        }

        $items = OrderItem::forOrder((int) $order['id']);

        Response::success([
            'order_number'    => $order['order_number'],
            'status'          => $order['status'],
            'payment_method'  => $order['payment_method'],
            'subtotal'        => (float) $order['subtotal'],
            'shipping_charge' => (float) $order['shipping_charge'],
            'tax_amount'      => (float) $order['tax_amount'],
            'total_amount'    => (float) $order['total_amount'],
            'shipping_city'   => $order['shipping_city'],
            'shipping_state'  => $order['shipping_state'],
            'created_at'      => $order['created_at'],
            'items'           => $items,
        ], 'Order found.');
    }

    // -----------------------------------------------------------------------
    // B-10: Invoice PDF (public — auth via invoice_token)
    // -----------------------------------------------------------------------

    public function invoice(array $params): void
    {
        $idOrToken = trim($params['id'] ?? '');

        if ($idOrToken === '') {
            Response::error('Invoice token is required.', 400);
        }

        if (ctype_digit($idOrToken)) {
            // Numeric ID — require authenticated user who owns this order
            AuthMiddleware::handle();
            $user  = AuthMiddleware::$user;
            $order = Order::findByIdWithEmail((int) $idOrToken, (int) $user['id']);
        } else {
            // Invoice token — public access (token validated with expiry check)
            $order = Order::findByToken($idOrToken);
        }

        if ($order === null) {
            Response::error('Invoice not found.', 404);
        }

        $items    = OrderItem::forOrder((int) $order['id']);
        $settings = SettingsService::all();

        // Resolve customer email for invoice (registered user OR guest)
        if (empty($order['guest_email']) && !empty($order['user_email'])) {
            $order['guest_email'] = $order['user_email'];
        }

        try {
            $pdfBinary = (new PdfInvoiceService())->generate($order, $items, $settings);
        } catch (\Throwable $e) {
            Response::error('Could not generate invoice. Please try again later.', 500);
        }

        $filename = 'invoice-' . $order['order_number'] . '.pdf';

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($pdfBinary));
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        echo $pdfBinary;
        exit();
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function parseJson(): array
    {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        return is_array($data) ? $data : [];
    }

    private function formatOrder(array $order): array
    {
        return [
            'id'              => (int) $order['id'],
            'order_number'    => $order['order_number'],
            'status'          => $order['status'],
            'payment_method'  => $order['payment_method'],
            'shipping_address' => $order['shipping_address'],
            'shipping_city'   => $order['shipping_city'],
            'shipping_state'  => $order['shipping_state'],
            'shipping_pincode' => $order['shipping_pincode'],
            'subtotal'        => (float) $order['subtotal'],
            'shipping_charge' => (float) $order['shipping_charge'],
            'tax_amount'      => (float) $order['tax_amount'],
            'total_amount'    => (float) $order['total_amount'],
            'notes'           => $order['notes'],
            'created_at'      => $order['created_at'],
        ];
    }
}
