fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ repoUrl: 'https://github.com/prachi-satbhai0741/cli-login-system' })
})
.then(res => res.text().then(text => console.log('Status:', res.status, 'Body:', text)))
.catch(err => console.error('Error:', err.message));
