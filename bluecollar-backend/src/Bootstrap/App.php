<?php
declare(strict_types=1);

namespace Bluecollar\Bootstrap;

use Bluecollar\Controllers\AuthController;
use Bluecollar\Controllers\OrderController;
use Bluecollar\Controllers\ProductController;
use Bluecollar\Controllers\UserController;
use Bluecollar\Controllers\NewsletterController;
use Bluecollar\Controllers\Admin\AdminAuthController;
use Bluecollar\Controllers\Admin\AdminInvoiceController;
use Bluecollar\Controllers\Admin\AdminOrderController;
use Bluecollar\Controllers\Admin\AdminProductController;
use Bluecollar\Controllers\Admin\AdminSettingsController;
use Bluecollar\Controllers\Admin\AdminUserController;
use Bluecollar\Middleware\CorsMiddleware;
use Bluecollar\Router\Router;
use Bluecollar\Helpers\Response;
use Dotenv\Dotenv;

/**
 * Application bootstrap class.
 *
 * Responsibilities:
 *  1. Load .env via phpdotenv
 *  2. Load configuration constants
 *  3. Apply CORS headers / handle preflight
 *  4. Register all routes
 *  5. Dispatch the request
 */
class App
{
    private Router $router;

    public function __construct()
    {
        // 1. Load .env file
        $dotenv = Dotenv::createImmutable(ROOT_PATH);
        $dotenv->load();

        // 2. Load app constants
        require ROOT_PATH . '/src/Config/config.php';

        // Abort early if critical secrets are missing
        if (strlen(JWT_SECRET) < 32 || strlen(ADMIN_JWT_SECRET) < 32) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Server configuration error.']);
            exit();
        }

        // 3. CORS
        CorsMiddleware::handle();

        // 4. Set up router
        $this->router = new Router();
        $this->registerRoutes();
    }

    public function run(): void
    {
        // 5. Dispatch
        $this->router->dispatch();
    }

    // -----------------------------------------------------------------------
    // Route definitions
    // -----------------------------------------------------------------------

    private function registerRoutes(): void
    {
        // ----- Health check -----
        $this->router->get('/api/health', function (): void {
            Response::success([
                'brand'   => 'Bluecollar',
                'version' => '1.0.0',
                'status'  => 'ok',
            ], 'Service is healthy');
        });

        // ----- Auth (customer) — B-01, B-02, B-03, B-04 -----
        $this->router->post('/api/auth/register',             [AuthController::class, 'register']);
        $this->router->post('/api/auth/login',                [AuthController::class, 'login']);
        $this->router->get('/api/auth/verify-email',          [AuthController::class, 'verifyEmail']);
        $this->router->post('/api/auth/resend-verification',  [AuthController::class, 'resendVerification']);

        // ----- Products (public) — B-04, B-05 -----
        $this->router->get('/api/products',       [ProductController::class, 'index']);
        $this->router->get('/api/products/{id}',  [ProductController::class, 'show']);

        // ----- Orders -----
        // B-09: Track must be registered BEFORE /api/orders/{id} to avoid being captured as {id}='track'
        $this->router->get('/api/orders/track',        [OrderController::class, 'track']);

        // B-06: Place order (guest or authenticated)
        $this->router->post('/api/orders',             [OrderController::class, 'store']);

        // B-08: Authenticated order list
        $this->router->get('/api/orders',              [OrderController::class, 'index']);

        // B-10: Invoice PDF — must be registered before /api/orders/{id}
        $this->router->get('/api/orders/{id}/invoice', [OrderController::class, 'invoice']);

        // B-07: Order detail (authenticated)
        $this->router->get('/api/orders/{id}',         [OrderController::class, 'show']);

        // ----- User profile — B-13, B-14 -----
        $this->router->get('/api/user/profile', [UserController::class, 'profile']);
        $this->router->put('/api/user/profile', [UserController::class, 'updateProfile']);

        // ----- Newsletter — B-15 -----
        $this->router->post('/api/newsletter', [NewsletterController::class, 'subscribe']);

        // ----- Public settings (announcement bar only) -----
        $this->router->get('/api/settings/public', [AdminSettingsController::class, 'publicIndex']);

        // ----- Admin Auth -----
        $this->router->post('/api/admin/auth/login', [AdminAuthController::class, 'login']);

        // ----- Admin Settings — B-16 -----
        $this->router->get('/api/admin/settings', [AdminSettingsController::class, 'index']);
        $this->router->put('/api/admin/settings', [AdminSettingsController::class, 'update']);

        // ----- Admin Orders (Phase 3 stubs) -----
        $this->router->get('/api/admin/orders',              [AdminOrderController::class, 'index']);
        $this->router->get('/api/admin/orders/{id}',         [AdminOrderController::class, 'show']);
        $this->router->put('/api/admin/orders/{id}/status',  [AdminOrderController::class, 'updateStatus']);

        // ----- Admin Products (Phase 3 stubs) -----
        $this->router->get('/api/admin/products',                          [AdminProductController::class, 'index']);
        $this->router->post('/api/admin/products',                         [AdminProductController::class, 'store']);
        $this->router->put('/api/admin/products/{id}',                     [AdminProductController::class, 'update']);
        $this->router->delete('/api/admin/products/{id}',                  [AdminProductController::class, 'destroy']);
        $this->router->post('/api/admin/products/{id}/variants',           [AdminProductController::class, 'addVariant']);
        $this->router->put('/api/admin/products/{id}/variants/{vid}',      [AdminProductController::class, 'updateVariant']);
        $this->router->delete('/api/admin/products/{id}/variants/{vid}',   [AdminProductController::class, 'deleteVariant']);
        $this->router->post('/api/admin/products/{id}/images',             [AdminProductController::class, 'addImage']);
        $this->router->delete('/api/admin/products/{id}/images/{imageId}', [AdminProductController::class, 'deleteImage']);

        // ----- Admin Users (Phase 3 stub) -----
        $this->router->get('/api/admin/users', [AdminUserController::class, 'index']);

        // ----- Admin Invoices (Phase 3 stubs) -----
        $this->router->get('/api/admin/invoices',                   [AdminInvoiceController::class, 'index']);
        $this->router->get('/api/admin/invoices/{order_id}/download', [AdminInvoiceController::class, 'download']);
    }
}
