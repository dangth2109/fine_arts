import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Nav, Table, Badge, Modal, Form, Button, Alert, Toast } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
const now = () => new Date();

function Manager() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: '',
    password: '',
    role: '',
    avatar: null
  });
  const [changePassword, setChangePassword] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionForm, setCompetitionForm] = useState({
    name: '',
    description: '',
    start: '',
    end: '',
    awards: '',
    background: null
  });
  const [creatingCompetition, setCreatingCompetition] = useState(false);
  const [competitionError, setCompetitionError] = useState('');
  const [showEditCompetitionModal, setShowEditCompetitionModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [editCompetitionForm, setEditCompetitionForm] = useState({
    name: '',
    description: '',
    start: '',
    end: '',
    awards: '',
    background: null,
    isHide: false,
    isProcessed: false
  });
  const [updatingCompetition, setUpdatingCompetition] = useState(false);
  const [editCompetitionError, setEditCompetitionError] = useState('');
  const [showDeleteCompetitionModal, setShowDeleteCompetitionModal] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState(null);
  const [deletingCompetition, setDeletingCompetition] = useState(false);
  const [showEditExhibitionModal, setShowEditExhibitionModal] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [editExhibitionForm, setEditExhibitionForm] = useState({
    name: '',
    description: '',
    location: '',
    start: '',
    end: '',
    background: null,
    artwork: [],
    isHide: false
  });
  const [updatingExhibition, setUpdatingExhibition] = useState(false);
  const [editExhibitionError, setEditExhibitionError] = useState('');
  const [showDeleteExhibitionModal, setShowDeleteExhibitionModal] = useState(false);
  const [exhibitionToDelete, setExhibitionToDelete] = useState(null);
  const [deletingExhibition, setDeletingExhibition] = useState(false);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showEditSubmissionModal, setShowEditSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editSubmissionForm, setEditSubmissionForm] = useState({
    score: '',
  });
  const [updatingSubmission, setUpdatingSubmission] = useState(false);
  const [editSubmissionError, setEditSubmissionError] = useState('');
  const [showDeleteSubmissionModal, setShowDeleteSubmissionModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [deletingSubmission, setDeletingSubmission] = useState(false);
  const [showCreateExhibitionModal, setShowCreateExhibitionModal] = useState(false);
  const [exhibitionForm, setExhibitionForm] = useState({
    name: '',
    description: '',
    location: '',
    start: '',
    end: '',
    background: null
  });
  const [creatingExhibition, setCreatingExhibition] = useState(false);
  const [exhibitionError, setExhibitionError] = useState('');
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [tempSelectedArtwork, setTempSelectedArtwork] = useState([]);
  const [modalSubmissions, setModalSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const fileInputRef = useRef(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'exhibitions') {
      fetchAllSubmissions();
    }
  }, [activeTab]);

  useEffect(() => {
    if (showArtworkModal && modalSubmissions.length > 0) {
      const selectedIds = editExhibitionForm.artwork || [];
      const matchedArtworks = modalSubmissions
        .filter(item => selectedIds.some(selected => selected._id === item._id))
        .map(submission => submission._id);

      console.log('Setting tempSelectedArtwork:', matchedArtworks);
      setTempSelectedArtwork(matchedArtworks);
    }
  }, [showArtworkModal, modalSubmissions, editExhibitionForm.artwork]);

  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(URL.createObjectURL(previewAvatar));
      }
    };
  }, [previewAvatar]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (tab) {
        case 'users':
          response = await api.get('/users');
          setUsers(response.data.data);
          break;
        case 'competitions':
          response = await api.get('/competitions?showAll=true');
          setCompetitions(response.data.data);
          break;
        case 'exhibitions':
          response = await api.get('/exhibitions');
          setExhibitions(response.data.data);
          break;
        case 'submissions':
          response = await api.get('/submissions?showAll=true');
          setSubmissions(response.data.data);
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const response = await api.get('/submissions?showAll=true');
      setAllSubmissions(response.data.data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      password: '',
      role: user.role === 'user' ? 'other' : user.role,
      avatar: null
    });
    setPreviewAvatar(null);
    setChangePassword(false);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError('');

    try {
      const formData = new FormData();
      formData.append('email', editForm.email);

      if (changePassword && editForm.password) {
        formData.append('password', editForm.password);
      }

      const roleToSend = editForm.role === 'other' ? 'user' : editForm.role;
      formData.append('role', roleToSend);

      if (editForm.avatar) {
        formData.append('avatar', editForm.avatar);
      }

      const response = await api.put(`/users/${selectedUser._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditUserModal(false);

      if (response.data.success) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser._id === selectedUser._id) {
          try {
            const userResponse = await api.get('/users/me');
            const userData = userResponse.data.data;

            localStorage.setItem('user', JSON.stringify(userData));
            login(userData);
          } catch (err) {
            console.error('Failed to update current user info:', err);
          }
        }

        fetchData('users');
        setToastMessage('User updated successfully!');
        setToastVariant('success');
      } else {
        setToastMessage(response.data.message || 'Failed to update user');
        setToastVariant('danger');
      }
      setShowToast(true);
    } catch (err) {
      setShowEditUserModal(false);
      console.error('Update error:', err);
      setToastMessage(err.response?.data?.message || 'Failed to update user');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    setDeleting(true);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setShowDeleteModal(false);
      fetchData('users');
      setToastMessage('User deleted successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setShowDeleteModal(false);
      console.error('Delete error:', err);
      setToastMessage(err.message || 'Failed to delete user');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCompetition = async (e) => {
    e.preventDefault();
    setCreatingCompetition(true);
    setCompetitionError('');

    try {
      const formData = new FormData();
      formData.append('name', competitionForm.name);
      formData.append('description', competitionForm.description);
      formData.append('start', competitionForm.start);
      formData.append('end', competitionForm.end);
      formData.append('awards', competitionForm.awards);
      if (competitionForm.background) {
        formData.append('background', competitionForm.background);
      }

      await api.post('/competitions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowCompetitionModal(false);
      fetchData('competitions');
      setToastMessage('Competition created successfully!');
      setToastVariant('success');
      setShowToast(true);

      setCompetitionForm({
        name: '',
        description: '',
        start: '',
        end: '',
        awards: '',
        background: null
      });
    } catch (err) {
      setCompetitionError(err.message || 'Failed to create competition');
    } finally {
      setCreatingCompetition(false);
    }
  };

  const handleEditCompetition = (competition) => {
    setSelectedCompetition(competition);
    setEditCompetitionForm({
      name: competition.name,
      description: competition.description,
      start: competition.start.split('T')[0],
      end: competition.end.split('T')[0],
      awards: competition.awards,
      background: null,
      isHide: competition.isHide,
      isProcessed: competition.isProcessed
    });
    setShowEditCompetitionModal(true);
  };

  const handleUpdateCompetition = async (e) => {
    e.preventDefault();
    setUpdatingCompetition(true);
    setEditCompetitionError('');

    try {
      const formData = new FormData();

      if (editCompetitionForm.name) formData.append('name', editCompetitionForm.name);
      if (editCompetitionForm.description) formData.append('description', editCompetitionForm.description);
      if (editCompetitionForm.start) formData.append('start', editCompetitionForm.start);
      if (editCompetitionForm.end) formData.append('end', editCompetitionForm.end);
      if (editCompetitionForm.awards) formData.append('awards', editCompetitionForm.awards);
      if (editCompetitionForm.background) formData.append('background', editCompetitionForm.background);

      formData.append('isHide', editCompetitionForm.isHide);
      formData.append('isProcessed', editCompetitionForm.isProcessed);

      await api.put(`/competitions/${selectedCompetition._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditCompetitionModal(false);
      fetchData('competitions');
      setToastMessage('Competition updated successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setEditCompetitionError(err.message || 'Failed to update competition');
    } finally {
      setUpdatingCompetition(false);
    }
  };

  const handleDeleteCompetitionClick = (competition) => {
    setCompetitionToDelete(competition);
    setShowDeleteCompetitionModal(true);
  };

  const handleDeleteCompetition = async () => {
    setDeletingCompetition(true);
    try {
      await api.delete(`/competitions/${competitionToDelete._id}`);
      setShowDeleteCompetitionModal(false);
      fetchData('competitions');
      setToastMessage('Competition deleted successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setShowDeleteCompetitionModal(false)
      setToastMessage(err.message);
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingCompetition(false);
    }
  };

  const handleViewCompetition = (competition) => {
    window.open(`/competitions/${competition._id}`, '_blank');
  };

  const handleEditExhibition = (exhibition) => {
    setSelectedExhibition(exhibition);
    setEditExhibitionForm({
      name: exhibition.name,
      description: exhibition.description || '',
      location: exhibition.location || '',
      start: exhibition.start.split('T')[0],
      end: exhibition.end.split('T')[0],
      background: null,
      artwork: exhibition.artwork || [],
      isHide: exhibition.isHide || false
    });
    setShowEditExhibitionModal(true);
  };

  const handleUpdateExhibition = async (e) => {
    e.preventDefault();
    setUpdatingExhibition(true);
    setEditExhibitionError('');

    try {
      const formData = new FormData();
      formData.append('name', editExhibitionForm.name);
      formData.append('description', editExhibitionForm.description);
      formData.append('location', editExhibitionForm.location);
      formData.append('start', editExhibitionForm.start);
      formData.append('end', editExhibitionForm.end);
      formData.append('isHide', editExhibitionForm.isHide)
      if (editExhibitionForm.background) {
        formData.append('background', editExhibitionForm.background);
      }

      await api.put(`/exhibitions/${selectedExhibition._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await api.put(`/exhibitions/${selectedExhibition._id}`, {
        artwork: editExhibitionForm.artwork
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setShowEditExhibitionModal(false);
      fetchData('exhibitions');
      setToastMessage('Exhibition updated successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setEditExhibitionError(err.message);
    } finally {
      setUpdatingExhibition(false);
    }
  };

  const handleDeleteExhibitionClick = (exhibition) => {
    setExhibitionToDelete(exhibition);
    setShowDeleteExhibitionModal(true);
  };

  const handleDeleteExhibition = async () => {
    setDeletingExhibition(true);
    try {
      await api.delete(`/exhibitions/${exhibitionToDelete._id}`);
      setShowDeleteExhibitionModal(false);
      fetchData('exhibitions');
      setToastMessage('Exhibition deleted successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setShowDeleteExhibitionModal(false)
      setToastMessage(err.message);
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingExhibition(false);
    }
  };

  const handleViewExhibition = (exhibition) => {
    window.open(`/exhibitions/${exhibition._id}`, '_blank');
  };

  const handleEditSubmission = (submission) => {
    setSelectedSubmission(submission);
    setEditSubmissionForm({
      score: submission.score || '',
    });
    setShowEditSubmissionModal(true);
  };

  const handleUpdateSubmission = async (e) => {
    e.preventDefault();
    setUpdatingSubmission(true);
    setEditSubmissionError('');

    try {
      await api.put(`/submissions/${selectedSubmission._id}`, {
        score: parseInt(editSubmissionForm.score)
      });

      setShowEditSubmissionModal(false);
      fetchData('submissions');
      setToastMessage('Submission score updated successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setEditSubmissionError(err.response?.data?.message || 'Failed to update submission score');
    } finally {
      setUpdatingSubmission(false);
    }
  };

  const handleDeleteSubmissionClick = (submission) => {
    setSubmissionToDelete(submission);
    setShowDeleteSubmissionModal(true);
  };

  const handleDeleteSubmission = async () => {
    setDeletingSubmission(true);
    try {
      await api.delete(`/submissions/${submissionToDelete._id}`);

      setShowDeleteSubmissionModal(false);
      fetchData('submissions');
      setToastMessage('Submission deleted successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setShowDeleteSubmissionModal(false)
      setToastMessage(err.message);
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingSubmission(false);
      setSubmissionToDelete(null);
    }
  };

  const handleCreateExhibition = async (e) => {
    e.preventDefault();
    setCreatingExhibition(true);
    setExhibitionError('');

    try {
      const formData = new FormData();
      formData.append('name', exhibitionForm.name);
      formData.append('description', exhibitionForm.description);
      formData.append('location', exhibitionForm.location);
      formData.append('start', exhibitionForm.start);
      formData.append('end', exhibitionForm.end);
      if (exhibitionForm.background) {
        formData.append('background', exhibitionForm.background);
      }

      await api.post('/exhibitions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowCreateExhibitionModal(false);
      fetchData('exhibitions');
      setToastMessage('Exhibition created successfully!');
      setToastVariant('success');
      setShowToast(true);

      setExhibitionForm({
        name: '',
        description: '',
        location: '',
        start: '',
        end: '',
        background: null
      });
    } catch (err) {
      setExhibitionError(err.message || 'Failed to create exhibition');
    } finally {
      setCreatingExhibition(false);
    }
  };

  const handleOpenArtworkModal = async () => {
    console.log('Opening artwork modal with:', editExhibitionForm.artwork);
    setLoadingSubmissions(true);

    try {
      const response = await api.get('/submissions?showAll=true');
      setModalSubmissions(response.data.data);

      const selectedIds = editExhibitionForm.artwork || [];
      console.log('selectedIds', selectedIds)
      console.log('all', response.data.data)
      const matchedArtworks = response.data.data
        .filter(item => selectedIds.some(selected => selected._id === item._id))
        .map(submission => submission._id);


      console.log('Matched artworks:', matchedArtworks);
      setTempSelectedArtwork(matchedArtworks);
      setShowArtworkModal(true);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setToastMessage('Failed to load submissions');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleConfirmArtwork = () => {
    console.log('Selected artwork:', tempSelectedArtwork);

    setEditExhibitionForm(prev => ({
      ...prev,
      artwork: [...tempSelectedArtwork]
    }));
    setShowArtworkModal(false);
  };

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-danger">{error}</div>;

    switch (activeTab) {
      case 'users':
        return (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-primary me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditUser(user)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteClick(user)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Modal
              show={showEditUserModal}
              onHide={() => {
                setShowEditUserModal(false);
                setUpdateError('');
                setChangePassword(false);
              }}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="text-center mb-4">
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
                            : selectedUser?.avatar
                              ? `${baseURL}${selectedUser.avatar}`
                              : 'https://via.placeholder.com/100'
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `${process.env.REACT_APP_API_URL.replace('/api', '')}/images/user/default-avatar.png`;
                        }}
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
                          setEditForm(prev => ({ ...prev, avatar: file }));
                        }
                      }}
                    />
                  </div>
                </div>

                <Form onSubmit={handleUpdateUser}>
                  {updateError && (
                    <Alert variant="danger" className="mb-3">
                      {updateError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                      <option value="student">Student</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Change Password"
                      checked={changePassword}
                      onChange={(e) => setChangePassword(e.target.checked)}
                    />
                  </Form.Group>

                  {changePassword && (
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        required={changePassword}
                      />
                    </Form.Group>
                  )}

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={updating}>
                      {updating ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showDeleteModal}
              onHide={() => setShowDeleteModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete user <strong>{userToDelete?.email}</strong>?
                <br />
                This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );

      case 'competitions':
        return (
          <>
            <div className="mb-3">
              <Button
                variant="primary"
                onClick={() => setShowCompetitionModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create New Competition
              </Button>
            </div>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Submissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {competitions.map((comp, index) => (
                  <tr key={comp._id}>
                    <td>{index + 1}</td>
                    <td>{comp.name}</td>
                    <td>
                      <Badge bg={
                        now() < new Date(comp.start) ? 'info' :
                          now() > new Date(comp.end) ? 'danger' : 'success'
                      }>
                        {now() < new Date(comp.start) ? 'Upcoming' :
                          now() > new Date(comp.end) ? 'Ended' : 'In Progress'
                        }
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={comp.isHide ? 'secondary' : 'info'}>
                        {comp.isHide ? 'Hidden' : 'Visible'}
                      </Badge>
                    </td>
                    <td>{new Date(comp.start).toLocaleDateString()}</td>
                    <td>{new Date(comp.end).toLocaleDateString()}</td>
                    <td>{comp.totalSubmissions}</td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-primary me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditCompetition(comp)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteCompetitionClick(comp)}
                      ></i>
                      <i
                        className="bi bi-eye text-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewCompetition(comp)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Modal
              show={showCompetitionModal}
              onHide={() => {
                setShowCompetitionModal(false);
                setCompetitionError('');
              }}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Create New Competition</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleCreateCompetition}>
                  {competitionError && (
                    <Alert variant="danger" className="mb-3">
                      {competitionError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={competitionForm.name}
                      onChange={(e) => setCompetitionForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={competitionForm.description}
                      onChange={(e) => setCompetitionForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={competitionForm.start}
                          onChange={(e) => setCompetitionForm(prev => ({ ...prev, start: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={competitionForm.end}
                          onChange={(e) => setCompetitionForm(prev => ({ ...prev, end: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Awards</Form.Label>
                    <Form.Control
                      type="text"
                      value={competitionForm.awards}
                      onChange={(e) => setCompetitionForm(prev => ({ ...prev, awards: e.target.value }))}
                      required
                      placeholder="e.g. $1000 for each winner"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCompetitionForm(prev => ({ ...prev, background: e.target.files[0] }))}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCompetitionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={creatingCompetition}
                    >
                      {creatingCompetition ? 'Creating...' : 'Create Competition'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showEditCompetitionModal}
              onHide={() => {
                setShowEditCompetitionModal(false);
                setEditCompetitionError('');
              }}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Competition</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleUpdateCompetition}>
                  {editCompetitionError && (
                    <Alert variant="danger" className="mb-3">
                      {editCompetitionError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editCompetitionForm.name}
                      onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editCompetitionForm.description}
                      onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={editCompetitionForm.start}
                          onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, start: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={editCompetitionForm.end}
                          onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, end: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Awards</Form.Label>
                    <Form.Control
                      type="text"
                      value={editCompetitionForm.awards}
                      onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, awards: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, background: e.target.files[0] }))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to keep current background
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Hide Competition"
                          checked={editCompetitionForm.isHide}
                          onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, isHide: e.target.checked }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Mark as Processed"
                          checked={editCompetitionForm.isProcessed}
                          onChange={(e) => setEditCompetitionForm(prev => ({ ...prev, isProcessed: e.target.checked }))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowEditCompetitionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updatingCompetition}
                    >
                      {updatingCompetition ? 'Updating...' : 'Update Competition'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showDeleteCompetitionModal}
              onHide={() => setShowDeleteCompetitionModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete competition <strong>{competitionToDelete?.name}</strong>?
                <br />
                This action cannot be undone and will also delete all submissions related to this competition.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteCompetitionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteCompetition}
                  disabled={deletingCompetition}
                >
                  {deletingCompetition ? 'Deleting...' : 'Delete'}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );

      case 'exhibitions':
        return (
          <>
            <div className="mb-3">
              <Button
                variant="primary"
                onClick={() => setShowCreateExhibitionModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create New Exhibition
              </Button>
            </div>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Artwork Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.map((exhibition, index) => (
                  <tr key={exhibition._id}>
                    <td>{index + 1}</td>
                    <td>{exhibition.name}</td>
                    <td>{exhibition.location}</td>
                    <td><Badge bg={
                      now() < new Date(exhibition.start) ? 'info' :
                        now() > new Date(exhibition.end) ? 'danger' : 'success'
                    }>
                      {now() < new Date(exhibition.start) ? 'Upcoming' :
                        now() > new Date(exhibition.end) ? 'Ended' : 'In Progress'
                      }
                    </Badge></td>
                    <td>
                      <Badge bg={exhibition.isHide ? 'secondary' : 'info'}>
                        {exhibition.isHide ? 'Hidden' : 'Visible'}
                      </Badge>
                    </td>
                    <td>{new Date(exhibition.start).toLocaleDateString()}</td>
                    <td>{new Date(exhibition.end).toLocaleDateString()}</td>
                    <td>{exhibition.artwork?.length || 0}</td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-primary me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditExhibition(exhibition)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteExhibitionClick(exhibition)}
                      ></i>
                      <i
                        className="bi bi-eye text-info"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleViewExhibition(exhibition)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Modal
              show={showEditExhibitionModal}
              onHide={() => {
                setShowEditExhibitionModal(false);
                setEditExhibitionError('');
              }}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Exhibition</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleUpdateExhibition}>
                  {editExhibitionError && (
                    <Alert variant="danger" className="mb-3">
                      {editExhibitionError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editExhibitionForm.name}
                      onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editExhibitionForm.description}
                      onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={editExhibitionForm.location}
                      onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={editExhibitionForm.start}
                          onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, start: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={editExhibitionForm.end}
                          onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, end: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, background: e.target.files[0] }))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to keep current background
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Hide Exhibition"
                      checked={editExhibitionForm.isHide}
                      onChange={(e) => setEditExhibitionForm(prev => ({ ...prev, isHide: e.target.checked }))}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Artwork Submissions</Form.Label>
                    <div className="d-flex align-items-center gap-3">
                      <div className="border rounded px-3 py-2 flex-grow-1">
                        {editExhibitionForm.artwork.length} artwork(s) selected
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={handleOpenArtworkModal}
                      >
                        Change
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowEditExhibitionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updatingExhibition}
                    >
                      {updatingExhibition ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showDeleteExhibitionModal}
              onHide={() => setShowDeleteExhibitionModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete exhibition <strong>{exhibitionToDelete?.name}</strong>?
                <br />
                This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteExhibitionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteExhibition}
                  disabled={deletingExhibition}
                >
                  {deletingExhibition ? 'Deleting...' : 'Delete'}
                </Button>
              </Modal.Footer>
            </Modal>

            <Modal
              show={showCreateExhibitionModal}
              onHide={() => {
                setShowCreateExhibitionModal(false);
                setExhibitionError('');
              }}
              size="lg"
            >
              <Modal.Header closeButton>
                <Modal.Title>Create New Exhibition</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleCreateExhibition}>
                  {exhibitionError && (
                    <Alert variant="danger" className="mb-3">
                      {exhibitionError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={exhibitionForm.name}
                      onChange={(e) => setExhibitionForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={exhibitionForm.description}
                      onChange={(e) => setExhibitionForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      value={exhibitionForm.location}
                      onChange={(e) => setExhibitionForm(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={exhibitionForm.start}
                          onChange={(e) => setExhibitionForm(prev => ({ ...prev, start: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={exhibitionForm.end}
                          onChange={(e) => setExhibitionForm(prev => ({ ...prev, end: e.target.value }))}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setExhibitionForm(prev => ({ ...prev, background: e.target.files[0] }))}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCreateExhibitionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={creatingExhibition}
                    >
                      {creatingExhibition ? 'Creating...' : 'Create Exhibition'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showArtworkModal}
              onHide={() => setShowArtworkModal(false)}
              size="lg"
              className="artwork-selection-modal"
            >
              <Modal.Header closeButton>
                <Modal.Title>Select Artworks</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {loadingSubmissions ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {modalSubmissions.map(submission => (
                      <div key={submission._id} className="col-md-4 col-sm-6">
                        <div
                          className={`card h-100 ${tempSelectedArtwork.includes(submission._id) ? 'border-primary' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setTempSelectedArtwork(prev =>
                              prev.includes(submission._id)
                                ? prev.filter(id => id !== submission._id)
                                : [...prev, submission._id]
                            );
                          }}
                        >
                          <img
                            src={`${baseURL}${submission.image}`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                            }}
                            className="card-img-top"
                            alt={submission.author}
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          <div className="card-body">
                            <h6 className="card-title mb-1">{submission.author}</h6>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">
                                {submission.competitionId?.name || 'Unknown Competition'}
                              </small>
                              <Badge bg={submission.score ? 'success' : 'secondary'}>
                                {submission.score ? `Score: ${submission.score}` : 'Not scored'}
                              </Badge>
                            </div>
                            {tempSelectedArtwork.includes(submission._id) && (
                              <div className="position-absolute top-0 end-0 p-2">
                                <Badge bg="primary">
                                  <i className="bi bi-check-lg"></i>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <div className="d-flex justify-content-between w-100">
                  <span>{tempSelectedArtwork.length} artwork(s) selected</span>
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowArtworkModal(false)}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConfirmArtwork}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </Modal.Footer>
            </Modal>
          </>
        );

      case 'submissions':
        return (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Competition</th>
                  <th>Author</th>
                  <th>Score</th>
                  <th>Scored By</th>
                  <th>Scored At</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={submission._id}>
                    <td>{index + 1}</td>
                    <td>{submission.competitionId.name}</td>
                    <td>{submission.author}</td>
                    <td>{submission.score || 'Not scored'}</td>
                    <td>{submission.scoredBy || '-'}</td>
                    <td>{submission.scoredAt ? new Date(submission.scoredAt).toLocaleDateString() : '-'}</td>
                    <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-primary me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEditSubmission(submission)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleDeleteSubmissionClick(submission)}
                      ></i>
                      <a
                        href={`/competitions/${submission.competitionId._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i
                          className="bi bi-eye text-info"
                          style={{ cursor: 'pointer' }}
                        ></i>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Modal
              show={showEditSubmissionModal}
              onHide={() => {
                setShowEditSubmissionModal(false);
                setEditSubmissionError('');
              }}
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit Submission Score</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleUpdateSubmission}>
                  {editSubmissionError && (
                    <Alert variant="danger" className="mb-3">
                      {editSubmissionError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Score (0-10)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      value={editSubmissionForm.score}
                      onChange={(e) => setEditSubmissionForm(prev => ({ ...prev, score: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowEditSubmissionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updatingSubmission}
                    >
                      {updatingSubmission ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </Form>
              </Modal.Body>
            </Modal>

            <Modal
              show={showDeleteSubmissionModal}
              onHide={() => setShowDeleteSubmissionModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this submission?
                <br />
                This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteSubmissionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteSubmission}
                  disabled={deletingSubmission}
                >
                  {deletingSubmission ? 'Deleting...' : 'Delete'}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <>
      <Container fluid>
        <Row>
          <Col md={2} className="bg-light min-vh-100 p-0">
            <Nav className="flex-column">
              <Nav.Link
                className={`px-4 py-3 ${activeTab === 'users' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i>
                Users
              </Nav.Link>
              <Nav.Link
                className={`px-4 py-3 ${activeTab === 'competitions' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('competitions')}
              >
                <i className="bi bi-trophy me-2"></i>
                Competitions
              </Nav.Link>
              <Nav.Link
                className={`px-4 py-3 ${activeTab === 'exhibitions' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('exhibitions')}
              >
                <i className="bi bi-easel me-2"></i>
                Exhibitions
              </Nav.Link>
              <Nav.Link
                className={`px-4 py-3 ${activeTab === 'submissions' ? 'bg-primary text-white' : ''}`}
                onClick={() => setActiveTab('submissions')}
              >
                <i className="bi bi-images me-2"></i>
                Submissions
              </Nav.Link>
            </Nav>
          </Col>
          <Col md={10} className="p-4">
            <h2 className="mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
            {renderContent()}
          </Col>
        </Row>
      </Container>

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

export default Manager;