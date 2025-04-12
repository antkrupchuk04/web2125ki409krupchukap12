document.getElementById('whatsappForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    try {
      const response = await fetch('/auth/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      document.getElementById('whatsappForm').style.display = 'none';
      document.getElementById('otpForm').style.display = 'block';
    } catch (error) {
      alert('Error sending OTP: ' + error.message);
    }
  });
  
  document.getElementById('otpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const otp = document.getElementById('otp').value;
    try {
      const response = await fetch('/auth/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error verifying OTP: ' + error.message);
    }
  });