<?php
// Admin configuration
// NOTE: change the password hash below. Generate a new one with:
//   php -r "echo password_hash('YOUR_PASSWORD', PASSWORD_DEFAULT).PHP_EOL;"
// Default password: ChangeMe!2026
return [
  'password_hash' => '$2y$12$XH30fxvzIJhE/9i0sL5Xsu0MfUgLan0iCnXue8L0w1JOBt.0EL9WK',
  'session_name'  => 'iaf_admin',
  'data_dir'      => __DIR__ . '/data',
  'uploads_dir'   => __DIR__ . '/uploads',
  'uploads_url'   => 'admin/uploads',
  'pages'         => [
    'publications' => 'Publications',
    'autism'       => 'Understanding Autism',
  ],
];
