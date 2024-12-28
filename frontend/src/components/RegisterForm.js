import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';

function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    avatar: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'student', label: 'Student' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);
    form.append('role', formData.role === 'other' ? 'user' : formData.role);
    if (formData.avatar) {
      form.append('avatar', formData.avatar);
    }

    try {
      await api.post('/users/register', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      setSuccess('Registration successful! Please login to continue.');
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        role: 'user',
        avatar: null
      });
      
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
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
      <Form.Group className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Avatar</Form.Label>
        <Form.Control
          type="file"
          name="avatar"
          onChange={handleChange}
          accept="image/*"
        />
      </Form.Group>
      <Button type="submit" disabled={loading} className="w-100">
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading...
          </>
        ) : 'Register'}
      </Button>
    </Form>
  );
}

export default RegisterForm;
