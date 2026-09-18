<?php
declare(strict_types=1);

namespace Bluecollar\Controllers\Admin;

use Bluecollar\Bootstrap\Database;
use Bluecollar\Helpers\Response;
use Bluecollar\Middleware\AdminMiddleware;
use PDO;

class AdminUserController
{
    // GET /api/admin/users
    public function index(array $params): void
    {
        AdminMiddleware::handle();

        $page   = max(1, (int) ($_GET['page']  ?? 1));
        $limit  = min(50, max(1, (int) ($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');
        $offset = ($page - 1) * $limit;
        $pdo    = Database::getInstance();
        $like   = '%' . $search . '%';

        // --- Registered customers ---
        if ($search !== '') {
            $cStmt = $pdo->prepare(
                'SELECT COUNT(*) FROM users WHERE role = "customer" AND (name LIKE :s OR email LIKE :s2)'
            );
            $cStmt->execute(['s' => $like, 's2' => $like]);
        } else {
            $cStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE role = "customer"');
            $cStmt->execute();
        }
        $totalRegistered = (int) $cStmt->fetchColumn();

        if ($search !== '') {
            $rStmt = $pdo->prepare(
                'SELECT id, name, email, phone, status, created_at FROM users
                 WHERE role = "customer" AND (name LIKE :s OR email LIKE :s2)
                 ORDER BY created_at DESC LIMIT :lim OFFSET :off'
            );
            $rStmt->bindValue(':s',  $like);
            $rStmt->bindValue(':s2', $like);
        } else {
            $rStmt = $pdo->prepare(
                'SELECT id, name, email, phone, status, created_at FROM users
                 WHERE role = "customer"
                 ORDER BY created_at DESC LIMIT :lim OFFSET :off'
            );
        }
        $rStmt->bindValue(':lim', $limit,  PDO::PARAM_INT);
        $rStmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $rStmt->execute();
        $registered = $rStmt->fetchAll();

        // --- Guest users (unique email from orders) ---
        if ($search !== '') {
            $gcStmt = $pdo->prepare(
                'SELECT COUNT(DISTINCT guest_email) FROM orders
                 WHERE guest_email IS NOT NULL AND (guest_email LIKE :s OR guest_name LIKE :s2)'
            );
            $gcStmt->execute(['s' => $like, 's2' => $like]);
        } else {
            $gcStmt = $pdo->prepare('SELECT COUNT(DISTINCT guest_email) FROM orders WHERE guest_email IS NOT NULL');
            $gcStmt->execute();
        }
        $totalGuests = (int) $gcStmt->fetchColumn();

        if ($search !== '') {
            $gStmt = $pdo->prepare(
                'SELECT guest_name, guest_email, guest_phone,
                        COUNT(*) AS order_count, MAX(created_at) AS last_order_at
                 FROM orders
                 WHERE guest_email IS NOT NULL AND (guest_email LIKE :s OR guest_name LIKE :s2)
                 GROUP BY guest_email, guest_name, guest_phone
                 ORDER BY last_order_at DESC LIMIT :lim OFFSET :off'
            );
            $gStmt->bindValue(':s',  $like);
            $gStmt->bindValue(':s2', $like);
        } else {
            $gStmt = $pdo->prepare(
                'SELECT guest_name, guest_email, guest_phone,
                        COUNT(*) AS order_count, MAX(created_at) AS last_order_at
                 FROM orders
                 WHERE guest_email IS NOT NULL
                 GROUP BY guest_email, guest_name, guest_phone
                 ORDER BY last_order_at DESC LIMIT :lim OFFSET :off'
            );
        }
        $gStmt->bindValue(':lim', $limit,  PDO::PARAM_INT);
        $gStmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $gStmt->execute();
        $guests = $gStmt->fetchAll();

        Response::success([
            'registered'       => $registered,
            'guests'           => $guests,
            'total_registered' => $totalRegistered,
            'total_guests'     => $totalGuests,
            'pagination'       => ['page' => $page, 'limit' => $limit],
        ], 'Users retrieved successfully.');
    }
}
