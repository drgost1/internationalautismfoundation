<header class="admin-bar">
  <a href="index.php" class="brand">
    <img src="../assets/images/logo-nav.webp" alt="IAF">
    <span>International Autism Foundation <em>Admin</em></span>
  </a>
  <nav>
    <a href="index.php">Dashboard</a>
    <?php foreach ($CFG['pages'] as $slug => $label): ?>
      <a href="edit.php?page=<?= e($slug) ?>"><?= e($label) ?></a>
    <?php endforeach; ?>
    <a href="assets.php">Uploads</a>
    <a href="../index.html" target="_blank">View site ↗</a>
    <a href="logout.php" class="logout">Log out</a>
  </nav>
</header>
