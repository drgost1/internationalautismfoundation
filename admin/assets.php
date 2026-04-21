<?php
require __DIR__ . '/auth.php';
require_login();

$msg = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  if (!empty($_FILES['file']['name'])) {
    $name = $_FILES['file']['name'];
    $ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $allowed = ['jpg','jpeg','png','webp','gif','pdf'];
    if (!in_array($ext, $allowed, true)) {
      $msg = ['err', 'File type not allowed (jpg/png/webp/gif/pdf only).'];
    } elseif ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
      $msg = ['err', 'Upload failed.'];
    } else {
      if (!is_dir($CFG['uploads_dir'])) mkdir($CFG['uploads_dir'], 0775, true);
      $safe = preg_replace('/[^a-z0-9\-_]/i', '-', pathinfo($name, PATHINFO_FILENAME));
      $final = $safe . '-' . substr(md5(uniqid('', true)), 0, 6) . '.' . $ext;
      move_uploaded_file($_FILES['file']['tmp_name'], $CFG['uploads_dir'] . '/' . $final);
      $msg = ['ok', 'Uploaded: admin/uploads/' . $final];
    }
  }
  if (!empty($_POST['delete'])) {
    $target = basename($_POST['delete']);
    $path = $CFG['uploads_dir'] . '/' . $target;
    if (is_file($path)) { unlink($path); $msg = ['ok', 'Deleted ' . $target]; }
  }
}
$files = is_dir($CFG['uploads_dir']) ? array_values(array_filter(scandir($CFG['uploads_dir']), fn($f) => !in_array($f, ['.', '..'], true))) : [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Uploads · Admin</title>
<link rel="stylesheet" href="admin.css" />
</head>
<body>
  <?php include 'partials/header.php'; ?>
  <main class="admin-main">
    <div class="admin-hero">
      <p class="eyebrow">Files</p>
      <h1>Uploads</h1>
      <p class="muted">Add or delete images &amp; PDFs. Copy a file's path into any image field on the page editors.</p>
    </div>
    <?php if ($msg): ?><div class="alert alert-<?= $msg[0]==='ok'?'ok':'err' ?>"><?= e($msg[1]) ?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" class="editor-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <label class="editor-field">
        <span class="editor-label">New file</span>
        <input type="file" name="file" accept="image/*,application/pdf" required>
      </label>
      <div class="editor-save"><button class="btn-primary">Upload</button></div>
    </form>
    <h2 class="editor-section">In storage</h2>
    <div class="upload-grid">
      <?php foreach ($files as $f):
        $url = $CFG['uploads_url'] . '/' . $f;
        $isImg = in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), ['jpg','jpeg','png','webp','gif'], true);
      ?>
        <div class="upload-tile">
          <?php if ($isImg): ?>
            <img src="../<?= e($url) ?>" alt="">
          <?php else: ?>
            <div class="upload-doc">PDF</div>
          <?php endif; ?>
          <div class="upload-meta">
            <input type="text" readonly value="<?= e($url) ?>" onclick="this.select()">
            <form method="post" onsubmit="return confirm('Delete <?= e($f) ?>?')" style="margin:0">
              <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
              <input type="hidden" name="delete" value="<?= e($f) ?>">
              <button class="btn-ghost btn-danger">Delete</button>
            </form>
          </div>
        </div>
      <?php endforeach; ?>
      <?php if (!$files): ?><p class="muted">Nothing uploaded yet.</p><?php endif; ?>
    </div>
  </main>
</body>
</html>
