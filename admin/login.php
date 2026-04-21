<?php
require __DIR__ . '/auth.php';

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  $password = $_POST['password'] ?? '';
  if (password_verify($password, $CFG['password_hash'])) {
    $_SESSION['iaf_admin'] = true;
    session_regenerate_id(true);
    header('Location: index.php');
    exit;
  }
  $error = 'Wrong password.';
  usleep(600000);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin login · International Autism Foundation</title>
<link rel="stylesheet" href="admin.css" />
</head>
<body class="login-body">
  <main class="login-card">
    <a href="../index.html" class="login-home">← Back to site</a>
    <h1>Foundation Admin</h1>
    <p class="muted">Sign in to manage content.</p>
    <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>
    <form method="post" autocomplete="off">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <label>Password<input type="password" name="password" required autofocus></label>
      <button type="submit" class="btn-primary">Sign in</button>
    </form>
    <p class="hint">Default password: <code>ChangeMe!2026</code> — update in <code>admin/config.php</code>.</p>
  </main>
</body>
</html>
