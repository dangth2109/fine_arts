import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Table, Badge, Modal, Form, Button, Alert, Toast } from 'react-bootstrap';
import api from '../services/api';

function Manager() {
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
    background: null,
    artwork: []
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

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'exhibitions') {
      fetchAllSubmissions();
    }
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch(tab) {
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

      await api.put(`/users/${selectedUser._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowEditUserModal(false);
      fetchData('users');
      setToastMessage('User updated successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update user');
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
      setError(err.response?.data?.message || 'Failed to delete user');
      setToastMessage('Failed to delete user');
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
      setCompetitionError(err.response?.data?.message || 'Failed to create competition');
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
      setEditCompetitionError(err.response?.data?.message || 'Failed to update competition');
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
      setError(err.response?.data?.message || 'Failed to delete competition');
      setToastMessage('Failed to delete competition');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingCompetition(false);
    }
  };

  const handleViewCompetition = (competition) => {
    window.location.href = `/competitions/${competition._id}`;
  };

  const handleEditExhibition = (exhibition) => {
    setSelectedExhibition(exhibition);
    setEditExhibitionForm({
      name: exhibition.name,
      background: null,
      artwork: exhibition.artwork || []
    });
    setShowEditExhibitionModal(true);
  };

  const handleUpdateExhibition = async (e) => {
    e.preventDefault();
    setUpdatingExhibition(true);
    setEditExhibitionError('');

    try {
      if (editExhibitionForm.name !== selectedExhibition.name || editExhibitionForm.background) {
        const formData = new FormData();
        if (editExhibitionForm.name !== selectedExhibition.name) {
          formData.append('name', editExhibitionForm.name);
        }
        if (editExhibitionForm.background) {
          formData.append('background', editExhibitionForm.background);
        }

        await api.put(`/exhibitions/${selectedExhibition._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (JSON.stringify(editExhibitionForm.artwork) !== JSON.stringify(selectedExhibition.artwork)) {
        await api.put(`/exhibitions/${selectedExhibition._id}`, {
          artwork: editExhibitionForm.artwork
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      setShowEditExhibitionModal(false);
      fetchData('exhibitions');
      setToastMessage('Exhibition updated successfully!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      setEditExhibitionError(err.response?.data?.message || 'Failed to update exhibition');
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
      setError(err.response?.data?.message || 'Failed to delete exhibition');
      setToastMessage('Failed to delete exhibition');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingExhibition(false);
    }
  };

  const handleViewExhibition = (exhibition) => {
    window.location.href = `/exhibitions/${exhibition._id}`;
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
      setToastMessage(err.response?.data?.message || 'Failed to delete submission');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setDeletingSubmission(false);
      setSubmissionToDelete(null);
    }
  };

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-danger">{error}</div>;

    switch(activeTab) {
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
                        style={{cursor: 'pointer'}}
                        onClick={() => handleEditUser(user)}
                      ></i>
                      <i 
                        className="bi bi-trash text-danger" 
                        style={{cursor: 'pointer'}}
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
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
              </Modal.Header>
              <Modal.Body>
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
                      onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({...prev, role: e.target.value}))}
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
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
                        onChange={(e) => setEditForm(prev => ({...prev, password: e.target.value}))}
                        required={changePassword}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Avatar</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditForm(prev => ({...prev, avatar: e.target.files[0]}))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to keep current avatar
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowEditUserModal(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      type="submit"
                      variant="primary"
                      disabled={updating}
                    >
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
                      <Badge bg={comp.isProcessed ? 'success' : 'warning'}>
                        {comp.isProcessed ? 'Processed' : 'In Progress'}
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
                        style={{cursor: 'pointer'}}
                        onClick={() => handleEditCompetition(comp)}
                      ></i>
                      <i 
                        className="bi bi-trash text-danger me-2" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleDeleteCompetitionClick(comp)}
                      ></i>
                      <i 
                        className="bi bi-eye text-info" 
                        style={{cursor: 'pointer'}}
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
                      onChange={(e) => setCompetitionForm(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={competitionForm.description}
                      onChange={(e) => setCompetitionForm(prev => ({...prev, description: e.target.value}))}
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
                          onChange={(e) => setCompetitionForm(prev => ({...prev, start: e.target.value}))}
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
                          onChange={(e) => setCompetitionForm(prev => ({...prev, end: e.target.value}))}
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
                      onChange={(e) => setCompetitionForm(prev => ({...prev, awards: e.target.value}))}
                      required
                      placeholder="e.g. $1000 for each winner"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCompetitionForm(prev => ({...prev, background: e.target.files[0]}))}
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
                      onChange={(e) => setEditCompetitionForm(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={editCompetitionForm.description}
                      onChange={(e) => setEditCompetitionForm(prev => ({...prev, description: e.target.value}))}
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
                          onChange={(e) => setEditCompetitionForm(prev => ({...prev, start: e.target.value}))}
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
                          onChange={(e) => setEditCompetitionForm(prev => ({...prev, end: e.target.value}))}
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
                      onChange={(e) => setEditCompetitionForm(prev => ({...prev, awards: e.target.value}))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditCompetitionForm(prev => ({...prev, background: e.target.files[0]}))}
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
                          onChange={(e) => setEditCompetitionForm(prev => ({...prev, isHide: e.target.checked}))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Mark as Processed"
                          checked={editCompetitionForm.isProcessed}
                          onChange={(e) => setEditCompetitionForm(prev => ({...prev, isProcessed: e.target.checked}))}
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
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Location</th>
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
                    <td>{exhibition.artwork?.length || 0}</td>
                    <td>
                      <i 
                        className="bi bi-pencil-square text-primary me-2" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleEditExhibition(exhibition)}
                      ></i>
                      <i 
                        className="bi bi-trash text-danger me-2" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleDeleteExhibitionClick(exhibition)}
                      ></i>
                      <i 
                        className="bi bi-eye text-info" 
                        style={{cursor: 'pointer'}}
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
                      onChange={(e) => setEditExhibitionForm(prev => ({...prev, name: e.target.value}))}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Background Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditExhibitionForm(prev => ({...prev, background: e.target.files[0]}))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to keep current background
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Artwork Submissions</Form.Label>
                    <Form.Select 
                      multiple
                      value={editExhibitionForm.artwork}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setEditExhibitionForm(prev => ({...prev, artwork: selectedOptions}));
                      }}
                      style={{ height: '200px' }}
                    >
                      {allSubmissions.map(submission => (
                        <option 
                          key={submission._id} 
                          value={submission._id}
                        >
                          {`${submission.competitionId.name} - ${submission.author}`}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Hold Ctrl (Windows) or Command (Mac) to select multiple artworks
                    </Form.Text>
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
                        style={{cursor: 'pointer'}}
                        onClick={() => handleEditSubmission(submission)}
                      ></i>
                      <i 
                        className="bi bi-trash text-danger me-2" 
                        style={{cursor: 'pointer'}}
                        onClick={() => handleDeleteSubmissionClick(submission)}
                      ></i>
                      <a 
                        href={`/competitions/${submission.competitionId._id}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <i 
                          className="bi bi-eye text-info" 
                          style={{cursor: 'pointer'}}
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
                      onChange={(e) => setEditSubmissionForm(prev => ({...prev, score: e.target.value}))}
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