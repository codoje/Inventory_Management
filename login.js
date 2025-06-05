const users = {
  "MacungieAmb": "macpass",
  "CetroniaAmb": "cetpass",
  "ToptonAmb": "toptonpass"
};

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (users[username] && users[username] === password) {
    localStorage.setItem('username', username);
    window.location.href = 'dashboard.html'; // Redirect to dashboard
  } else {
    document.getElementById('error-message').style.display = 'block';
  }
});
