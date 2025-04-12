document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/auth/user');
      const user = await response.json();
      if (user.error) throw new Error(user.error);
      document.getElementById('name').value = user.name || '';
      document.getElementById('bio').value = user.bio || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('phone').value = user.phone || '';
      document.getElementById('linkedin').value = user.linkedin || '';
      document.getElementById('twitter').value = user.twitter || '';
    } catch (error) {
      window.location.href = '/login';
    }
  });
  
  document.getElementById('cardForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cardData = {
      name: document.getElementById('name').value,
      bio: document.getElementById('bio').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      linkedin: document.getElementById('linkedin').value,
      twitter: document.getElementById('twitter').value,
    };
    try {
      const response = await fetch('/auth/update-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      alert('Card updated successfully!');
    } catch (error) {
      alert('Error saving card: ' + error.message);
    }
  });