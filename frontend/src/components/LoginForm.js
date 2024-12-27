import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login để lấy token
      const loginResponse = await api.post('/users/login', formData);
      const { token, user } = loginResponse.data;
      
      // 2. Lưu token
      localStorage.setItem('token', token);

      // 3. Tạo user object và lưu vào context
      const userData = {
        email: user.email,
        role: user.role
      };
      login(userData);

      // 4. Cập nhật Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 5. Truyền thông tin user lên component cha
      onSuccess('Login successful!', userData);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button type="submit" disabled={loading} className="w-100">
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading...
          </>
        ) : 'Login'}
      </Button>
    </Form>
  );
}

export default LoginForm;
