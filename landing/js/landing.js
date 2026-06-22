document.addEventListener('DOMContentLoaded', function() {
  // Mobile nav toggle
  var toggle = document.getElementById('mobile-toggle');
  var navLinks = document.getElementById('nav-links');
  var navActions = document.getElementById('nav-actions');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      if (navActions) navActions.classList.toggle('mobile');
    });
  }

  // Highlight current page in nav
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
    if (currentPage === 'index.html' && (href === 'index.html' || href === './')) a.classList.add('active');
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(q) {
    q.addEventListener('click', function() {
      var answer = this.nextElementSibling;
      var isOpen = answer.classList.contains('open');
      answer.classList.toggle('open');
      this.classList.toggle('open');
      answer.style.display = isOpen ? 'none' : 'block';
    });
  });
});
