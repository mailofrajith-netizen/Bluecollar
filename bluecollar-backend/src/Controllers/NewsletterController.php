<?php
declare(strict_types=1);

namespace Bluecollar\Controllers;

use Bluecollar\Helpers\Response;
use Bluecollar\Helpers\Validator;
use Bluecollar\Models\NewsletterSubscriber;

/**
 * B-15: POST /api/newsletter — newsletter subscription.
 */
class NewsletterController
{
    public function subscribe(array $params): void
    {
        $body = $this->parseJson();

        $v = Validator::make($body)
            ->required('email', 'Email')
            ->email('email', 'Email')
            ->maxLength('email', 150, 'Email');

        if ($v->fails()) {
            Response::error('Validation failed.', 422, $v->errors());
        }

        $email      = strtolower(trim($body['email']));
        $subscriber = NewsletterSubscriber::findByEmail($email);

        if ($subscriber !== null) {
            if ((bool) $subscriber['is_active']) {
                // Already subscribed and active
                Response::success(['email' => $email], 'You are already subscribed to our newsletter.');
            }

            // Previously unsubscribed — re-activate
            NewsletterSubscriber::reactivate((int) $subscriber['id']);
            Response::success(['email' => $email], 'Welcome back! You have been re-subscribed to our newsletter.', 200);
        }

        // New subscriber
        NewsletterSubscriber::create($email);
        Response::success(['email' => $email], 'Thank you for subscribing to our newsletter!', 201);
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
}
