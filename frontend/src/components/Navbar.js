import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Container, Nav, NavDropdown, Button, Modal, Form, Toast } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Navbar.css';

function AppNavbar() {
  const { user, logout, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Submit Artwork states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Auth Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Add avatar state
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // Profile Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: '',
    password: '',
    avatar: null
  });
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Thêm ref cho input file
  const fileInputRef = useRef(null);

  // Thêm state mới cho preview
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Check auth status on mount and refresh
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token && !user) {
        try {
          // Set token to axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user data
          const response = await api.get('/users/me');
          const userData = response.data.data;

          // Update localStorage and auth context
          localStorage.setItem('user', JSON.stringify(userData));
          login(userData);

        } catch (err) {
          console.error('Auth check failed:', err);
          // Clear invalid auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
        }
      }
    };

    checkAuth();
  }, []); // Run once on mount

  useEffect(() => {
    // Fetch available competitions when modal opens
    if (showSubmitModal) {
      fetchCompetitions();
    }
  }, [showSubmitModal]);

  const fetchCompetitions = async () => {
    try {
      const response = await api.get('/competitions');
      setCompetitions(response.data.data);
    } catch (err) {
      setSubmitError('Failed to load competitions');

      // Show error toast
      setToastMessage('Failed to load competitions');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompetition || !selectedFile) {
      setSubmitError('Please select both competition and image');
      return;
    }

    setUploading(true);
    setSubmitError('');

    const formData = new FormData();
    formData.append('competitionId', selectedCompetition);
    formData.append('image', selectedFile);

    try {
      await api.post('/submissions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowSubmitModal(false);
      setSelectedCompetition('');
      setSelectedFile(null);
      setSubmitError('');

      setToastMessage('Artwork submitted successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit artwork');

      setToastMessage(err.response?.data?.message || 'Failed to submit artwork');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    try {
      // Step 1: Login to get token
      const loginResponse = await api.post('/users/login', {
        email: loginForm.email,
        password: loginForm.password
      });

      // Save token to localStorage
      const token = loginResponse.data.token;
      localStorage.setItem('token', token);

      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Step 2: Get user info
      const userResponse = await api.get('/users/me');
      const userData = userResponse.data.data;

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Update auth context
      login(userData);

      // Close modal and reset form
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });

      // Show success toast
      setToastMessage('Logged in successfully!');
      setToastVariant('success');
      setShowToast(true);

    } catch (err) {
      setAuthError(err.message || 'Failed to login');

      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setIsAuthLoading(true);
    setAuthError('');

    const formData = new FormData();
    formData.append('email', registerForm.email);
    formData.append('password', registerForm.password);
    formData.append('role', registerForm.role === 'other' ? 'user' : registerForm.role);

    if (selectedAvatar) {
      formData.append('avatar', selectedAvatar);
    }

    try {
      await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form and states
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
      });
      setSelectedAvatar(null);
      setShowRegisterModal(false);

      // Show success toast
      setToastMessage('Registered successfully! Please login.');
      setToastVariant('success');
      setShowToast(true);

    } catch (err) {
      setAuthError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // Xóa thông tin auth
    setToastMessage('Logged out successfully!');
    setToastVariant('success');
    setShowToast(true);
    
    // Chỉ navigate về home khi đang ở trang manager
    if (location.pathname.includes('/manager')) {
      navigate('/');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileError('');

    const formData = new FormData();
    formData.append('email', profileForm.email);
    
    // Chỉ gửi password nếu checkbox được tích
    if (showPasswordField && profileForm.password) {
      formData.append('password', profileForm.password);
    }
    
    if (profileForm.avatar) {
      formData.append('avatar', profileForm.avatar);
    }

    try {
      const response = await api.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Lưu token mới
        const newToken = response.data.data.token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Lưu thông tin user mới
        const newUserData = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(newUserData));
        login(newUserData);

        setShowProfileModal(false);
        setToastMessage('Profile updated successfully!');
        setToastVariant('success');
      } else {
        setProfileError(response.data.message || 'Failed to update profile');
        setToastMessage(response.data.message || 'Failed to update profile');
        setToastVariant('danger');
      }
      setShowToast(true);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
      setToastMessage(err.response?.data?.message || 'Failed to update profile');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <>
      <Navbar expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <i className="fas fa-palette me-2"></i>
            <span className="fw-bold">Fine Art Gallery</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/competitions"
                className={location.pathname.includes('/competitions') ? 'active' : ''}
              >
                Competitions
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/exhibitions"
                className={location.pathname.includes('/exhibitions') ? 'active' : ''}
              >
                Exhibitions
              </Nav.Link>
            </Nav>

            <Nav>
              {user ? (
                <NavDropdown
                  title={
                    <div className="user-profile-menu d-inline-flex align-items-center">
                      <div className="avatar-container me-2">
                        {user.avatar ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${user.avatar}`}
                            alt="User Avatar"
                            className="avatar-img"
                          />
                        ) : (
                          <i className="fas fa-user-circle avatar-icon"></i>
                        )}
                      </div>
                      <span className="user-email">{user.email}</span>
                    </div>
                  }
                  id="user-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  {user.role === 'admin' && (
                    <NavDropdown.Item as={Link} to="/manager">
                      <i className="fas fa-cogs me-2"></i>
                      Management
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item onClick={() => setShowSubmitModal(true)}>
                    <i className="fas fa-upload me-2"></i>
                    Submit Artwork
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => {
                    const userData = JSON.parse(localStorage.getItem('user'));
                    setProfileForm({
                      email: userData.email,
                      password: '',
                      avatar: null
                    });
                    setShowProfileModal(true);
                  }}>
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link onClick={() => setShowLoginModal(true)}>Login</Nav.Link>
                  <Nav.Link onClick={() => setShowRegisterModal(true)}>Register</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </Form.Group>

            {authError && (
              <div className="alert alert-danger">{authError}</div>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <Button variant="link" onClick={() => {
                setShowLoginModal(false);
                setShowRegisterModal(true);
              }}>
                Need an account?
              </Button>
              <Button type="submit" variant="primary" disabled={isAuthLoading}>
                {isAuthLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Register Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Register</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={registerForm.role}
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="student">Student</option>
                <option value="other">Other</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Select your role in the system
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Avatar (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedAvatar(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                Choose an avatar image or leave empty for default
              </Form.Text>
            </Form.Group>

            {authError && (
              <div className="alert alert-danger">{authError}</div>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <Button variant="link" onClick={() => {
                setShowRegisterModal(false);
                setRegisterForm({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'student'
                });
                setSelectedAvatar(null);
                setAuthError('');
                setShowLoginModal(true);
              }}>
                Already have an account?
              </Button>
              <Button type="submit" variant="primary" disabled={isAuthLoading}>
                {isAuthLoading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Submit Artwork Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit Artwork</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Competition</Form.Label>
              <Form.Select
                value={selectedCompetition}
                onChange={(e) => setSelectedCompetition(e.target.value)}
                isInvalid={!!submitError && !selectedCompetition}
              >
                <option value="">Choose a competition...</option>
                {competitions.map(comp => (
                  <option key={comp._id} value={comp._id}>
                    {comp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                isInvalid={!!submitError && !selectedFile}
              />
            </Form.Group>

            {submitError && (
              <div className="alert alert-danger">{submitError}</div>
            )}

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitError('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={uploading || !selectedCompetition || !selectedFile}
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProfile}>
            <div className="text-center mb-3">
              <div 
                className="avatar-container position-relative mx-auto"
                style={{ width: '100px', height: '100px' }}
              >
                <div 
                  className="position-relative w-100 h-100"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={
                      previewAvatar 
                        ? URL.createObjectURL(previewAvatar)
                        : user?.avatar 
                          ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${user.avatar}`
                          : 'https://via.placeholder.com/100'
                    }
                    alt="Avatar"
                    className="rounded-circle w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  
                  <div className="avatar-overlay position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle">
                    <Button 
                      variant="light" 
                      size="sm"
                      className="py-1 px-2"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreviewAvatar(file);
                      setProfileForm({ ...profileForm, avatar: file });
                    }
                  }}
                />
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                value={user?.role || ''}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Change Password"
                checked={showPasswordField}
                onChange={(e) => setShowPasswordField(e.target.checked)}
              />
            </Form.Group>

            {showPasswordField && (
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  required={showPasswordField}
                />
              </Form.Group>
            )}

            {profileError && (
              <div className="alert alert-danger">{profileError}</div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Toast Notification */}
      <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1050,
        minWidth: '300px'
      }}
    >
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        bg={toastVariant}
        text={toastVariant === 'dark' ? 'white' : 'dark'}
        className="text-center"
      >
        <Toast.Header className="justify-content-between">
          <strong>
            {toastVariant === 'success' ? 'Success' : 'Error'}
          </strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </div>
    </>
  );
}

export default AppNavbar;
