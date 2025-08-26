<?php

return [

    'default' => env('MAIL_MAILER', 'smtp'),

    'mailers' => [
    'smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', ''),
        'port' => env('MAIL_PORT', ''),
        'encryption' => env('MAIL_ENCRYPTION', null),
        'username' => env('MAIL_USERNAME', null),
        'password' => env('MAIL_PASSWORD', null),
        'timeout' => null,
        'auth_mode' => null,
    ],
],




    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', ''),
        'name' => env('MAIL_FROM_NAME', ''),
    ],

    'markdown' => [
        'theme' => 'default',
        'paths' => [
            resource_path('views/vendor/mail'),
        ],
    ],

];
