import { Injectable } from '@nestjs/common';

@Injectable()
export class MailTemplatesService {
  getPasswordResetEmailTemplate(userName: string, resetUrl: string): string {
    return `
      <h3>Hello ${userName},</h3>
      <p>You requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <p>
        <a href="${resetUrl}">Reset Password</a>
      </p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
  }

  getPasswordResetFormTemplate(token: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Reset Password</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; }
              .container { max-width: 500px; width: 100%; }
              h1 { color: #333; }
              .form-group { margin-bottom: 15px; }
              label { display: block; margin-bottom: 5px; }
              input[type="password"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
              button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
              .error { color: red; margin-top: 10px; }
              .success { color: green; margin-top: 10px; display: none; }
              .form-container { display: block; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Reset Your Password</h1>
              <div id="errorMessage" class="error" style="display: none;"></div>
              <div id="successMessage" class="success">
                  <h2>Password Reset Successful!</h2>
                  <p>Your password has been reset successfully.</p>
                  <p>You will also receive a confirmation email.</p>
                  <p>You can now <a href="/login">login</a> with your new password.</p>
              </div>
              <div id="formContainer" class="form-container">
                  <div class="form-group">
                      <label for="password">New Password</label>
                      <input type="password" id="password" name="password" required>
                  </div>
                  <div class="form-group">
                      <label for="confirmPassword">Confirm Password</label>
                      <input type="password" id="confirmPassword" name="confirmPassword" required>
                  </div>
                  <button onclick="resetPassword('${token}')">Reset Password</button>
              </div>
          </div>
          
          <script>
              function resetPassword(token) {
                  const password = document.getElementById('password').value;
                  const confirmPassword = document.getElementById('confirmPassword').value;
                  const errorMessage = document.getElementById('errorMessage');
                  const successMessage = document.getElementById('successMessage');
                  const formContainer = document.getElementById('formContainer');
                  
                  errorMessage.style.display = 'none';
                  
                  if (password !== confirmPassword) {
                      errorMessage.textContent = 'Passwords do not match';
                      errorMessage.style.display = 'block';
                      return;
                  }
                  
                  if (password.length < 6) {
                      errorMessage.textContent = 'Password must be at least 6 characters';
                      errorMessage.style.display = 'block';
                      return;
                  }
                  
                  fetch('/api/v1/auth/reset-password', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ token, password }),
                  })
                  .then(response => response.json())
                  .then(data => {
                      if (data.status === 200) {
                          // Show success message and hide form
                          formContainer.style.display = 'none';
                          successMessage.style.display = 'block';
                          
                          // Redirect after 5 seconds
                          setTimeout(() => {
                              window.location.href = '/login';
                          }, 5000);
                      } else {
                          errorMessage.textContent = data.message || 'An error occurred';
                          errorMessage.style.display = 'block';
                      }
                  })
                  .catch(error => {
                      errorMessage.textContent = 'An error occurred. Please try again.';
                      errorMessage.style.display = 'block';
                  });
              }
          </script>
      </body>
      </html>
    `;
  }

  getInvalidTokenTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invalid Token</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; }
              .container { max-width: 500px; width: 100%; text-align: center; }
              h1 { color: #333; }
              .error { color: red; margin-top: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Invalid or Expired Token</h1>
              <p class="error">The password reset link is invalid or has expired.</p>
              <p>Please request a new password reset link.</p>
          </div>
      </body>
      </html>
    `;
  }

  getPasswordResetSuccessTemplate(userName: string): string {
    return `
      <h3>Hello ${userName},</h3>
      <p>Your password has been successfully reset.</p>
      <p>If you did not perform this action, please contact our support team immediately.</p>
      <p>Thank you for using our service!</p>
    `;
  }
} 