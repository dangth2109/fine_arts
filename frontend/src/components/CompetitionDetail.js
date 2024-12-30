import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Modal, Form, Button } from 'react-bootstrap';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../services/api';
import './CompetitionDetail.css';
import { useAuth } from '../contexts/AuthContext';

function CompetitionDetail() {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [score, setScore] = useState('');
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const { user } = useAuth();

  const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  // Helper function to determine competition status
  const getCompetitionStatus = (competition) => {
    const now = new Date();
    const startDate = new Date(competition.start);
    const endDate = new Date(competition.end);

    if (competition.isProcessed || now > endDate) {
      return { text: 'Ended', color: 'danger' };
    }
    if (now < startDate) {
      return { text: 'Upcoming', color: 'info' };
    }
    return { text: 'In Progress', color: 'success' };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [competitionRes, submissionsRes] = await Promise.all([
          api.get(`/competitions/${id}`),
          api.get(`/submissions/competition/${id}`)
        ]);

        setCompetition(competitionRes.data.data);
        setSubmissions(submissionsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleScore = async () => {
    // Validate score
    const scoreNum = Number(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      setScoreError('Score must be between 0 and 10');
      return;
    }

    setScoring(true);
    setScoreError('');

    try {
      await api.put(`/submissions/${selectedSubmission._id}`, {
        score: scoreNum
      });

      // Update the submission in the local state
      const updatedSubmissions = submissions.map(sub =>
        sub._id === selectedSubmission._id
          ? {
            ...sub,
            score: scoreNum,
            scoredBy: user.email,
            scoredAt: new Date().toISOString()
          }
          : sub
      );

      setSubmissions(updatedSubmissions);
      setSelectedSubmission({
        ...selectedSubmission,
        score: scoreNum,
        scoredBy: user.email,
        scoredAt: new Date().toISOString()
      });

      if (new Date(competition.end) <= new Date()) { 
        const {data } = await api.get(`/competitions/${id}`)
        setCompetition(data.data)
      }

      setScore('');
    } catch (error) {
      console.error('Error scoring submission:', error);
      setScoreError(error.message);
    } finally {
      setScoring(false);
    }
  };

  // Log để debug
  console.log('Current user:', user);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (!competition) return <div className="text-center p-5">Competition not found</div>;

  const status = getCompetitionStatus(competition);

  return (
    <Container fluid className="competition-detail py-4">
      <Row className="mb-4">
        {/* Competition Details - 8 columns */}
        <Col lg={8}>
          <Card className="competition-header h-100">
            <Card.Img
              variant="top"
              src={`${baseURL}${competition.background}`}
              onError={(e) => {
                e.target.onerror = null;
                  e.target.src = `${baseURL}/images/competitions/default-background.jpg`;
              }}
              alt={competition.name}
              className="competition-banner"
            />
            <Card.Body>
              <div className="competition-info">
                <div className="d-flex justify-content-between align-items-start flex-wrap mb-4">
                  <div>
                    <h2 className="mb-2">{competition.name}</h2>
                    <p className="text-muted mb-3">{competition.description}</p>
                  </div>
                  <Badge bg={status.color} className="status-badge">
                    {status.text}
                  </Badge>
                </div>

                {/* Simplified Awards Section */}
                <div className="awards-section p-3 mb-4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="awards-icon me-3">
                        <i className="fas fa-award text-warning" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <div>
                        <h5 className="mb-1 text-primary">Awards & Prizes</h5>
                        {competition?.awards ? (
                          <div className="award-text">
                            <i className="fas fa-trophy text-warning me-2"></i>
                            {competition.awards}
                          </div>
                        ) : (
                          <div className="text-muted">
                            <i className="fas fa-info-circle me-2"></i>
                            No awards information available
                          </div>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>

                <div className="competition-details mt-4">
                  <Row>
                    <Col md={6}>
                      <div className="detail-item">
                        <i className="fas fa-calendar-alt text-primary me-2"></i>
                        <div>
                          <small className="text-muted d-block">Start Date</small>
                          <strong>{new Date(competition.start).toLocaleDateString()}</strong>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="detail-item">
                        <i className="fas fa-flag-checkered text-danger me-2"></i>
                        <div>
                          <small className="text-muted d-block">End Date</small>
                          <strong>{new Date(competition.end).toLocaleDateString()}</strong>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div className="detail-item mt-3">
                    <i className="fas fa-users text-success me-2"></i>
                    <div>
                      <small className="text-muted d-block">Total Submissions</small>
                      <strong>{submissions.length}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Winners Section - 3 columns */}
        <Col lg={4}>
          {competition.winners && competition.winners.length > 0 ? (
            <Card className="winners-card h-100">
              <Card.Body>
                <h4 className="winners-title mb-3">
                  <i className="fas fa-trophy text-warning me-2"></i>
                  Winners
                </h4>
                <div className="winners-list">
                  {competition.winners.map((winner, index) => (
                    <div
                      key={winner._id || index}
                      className="winner-item d-flex justify-content-between align-items-center"
                    >
                      <div className="winner-rank">
                        {index === 0 && <span className="rank-badge gold">1st</span>}
                        {index === 1 && <span className="rank-badge silver">2nd</span>}
                        {index === 2 && <span className="rank-badge bronze">3rd</span>}
                        {index > 2 && <span className="rank-badge">#{index + 1}</span>}
                      </div>
                      <div className="winner-info">
                        <button
                          className="winner-email-btn"
                          onClick={() => {
                            setSelectedWinner(winner);
                            setShowImageModal(true);
                          }}
                        >
                          {winner.email}
                        </button>
                      </div>
                      <div className="winner-score">
                        <Badge bg="info">Score: {winner.score}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="winners-card h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <i className="fas fa-trophy mb-2" style={{ fontSize: '2rem' }}></i>
                  <p className="mb-0">No winners announced yet</p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Winner Image Modal */}
      <Modal
        show={showImageModal}
        onHide={() => {
          setShowImageModal(false);
          setIsFullscreen(false);
        }}
        dialogClassName={`winner-modal-lg ${isFullscreen ? 'fullscreen-modal' : ''}`}
        contentClassName="winner-modal-content"
      >
        <Modal.Header closeButton className="winner-modal-header">
          <Modal.Title>
            <i className="fas fa-trophy text-warning me-2"></i>
            Winner's Submission - {selectedWinner?.email}
          </Modal.Title>
          <div className="modal-controls ms-auto me-3">

          </div>
        </Modal.Header>
        <Modal.Body className="modal-body p-0">
          {selectedWinner && (
            <div className={`winner-image-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
              <div className="winner-image-container">
                <img
                  src={`${baseURL}${selectedWinner.image}`}
                  onError={(e) => {
                    e.target.onerror = null;
                      e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                  }}
                  alt={`Submission by ${selectedWinner.email}`}
                  className="winner-submission-image"
                />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Submissions Grid */}
      <Row>
        <Col>
          <h3 className="mb-4">Submissions</h3>
        </Col>
      </Row>
      <Row>
        {submissions.map(submission => (
          <Col key={submission._id} xs={12} md={6} lg={4} className="mb-4">
            <Card
              className="submission-card h-100 cursor-pointer"
              onClick={() => {
                setSelectedSubmission(submission);
                setShowSubmissionModal(true);
              }}
            >
              <Card.Img
                variant="top"
                src={`${baseURL}${submission.image}`}
                onError={(e) => {
                  e.target.onerror = null;
                    e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                }}
                alt={`Submission by ${submission.author}`}
                className="submission-image"
              />
              <Card.Body>
                <div className="submission-info">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">{submission.author}</h5>
                    {user?.role === 'admin' ? (
                      <Badge
                        bg={submission.score ? 'success' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowSubmissionModal(true);
                        }}
                      >
                        Score: {submission.score || 'Not scored'}
                      </Badge>
                    ) : (
                      <Badge bg={submission.score ? 'success' : 'secondary'} >
                        Score: {submission.score || 'Not scored'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Submission Detail Modal */}
      <Modal
        show={showSubmissionModal}
        onHide={() => {
          setShowSubmissionModal(false);
          setSelectedSubmission(null);
          setScore('');
          setScoreError('');
        }}
        dialogClassName="submission-modal"
        contentClassName="submission-modal-content"
      >
        {selectedSubmission && (
          <>
            <Modal.Header closeButton className="submission-modal-header">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="submission-info d-flex align-items-center">
                  <i className="fas fa-user-circle fs-4 me-2 text-primary"></i>
                  <div>
                    <h6 className="mb-0">{selectedSubmission.author}</h6>
                    <small className="text-muted">
                      Submitted on {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>

                <Badge
                  bg={selectedSubmission.score ? 'success' : 'secondary'}
                  className="score-badge"
                >
                  Score: {selectedSubmission.score || 'Not scored'}
                </Badge>
              </div>
            </Modal.Header>

            <Modal.Body className="p-0 submission-modal-body">
              <div className="image-container">
                <TransformWrapper>
                  <TransformComponent>
                    <img
                      src={`${baseURL}${selectedSubmission.image}`}
                      onError={(e) => {
                        e.target.onerror = null;
                          e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                      }}
                      alt={`Submission by ${selectedSubmission.author}`}
                      className="submission-detail-image"
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            </Modal.Body>

            {/* Only show for admin, manager, staff */}
            {['admin', 'manager', 'staff'].includes(user?.role) && (
              <div className="scoring-panel">
                <Form className="d-flex align-items-center p-3">
                  <Form.Group className="score-input-group me-3 mb-0 flex-grow-1">
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      step="1"
                      value={score}
                      onChange={(e) => {
                        setScore(e.target.value);
                        setScoreError('');
                      }}
                      placeholder="Score (0-10)"
                      isInvalid={!!scoreError}
                    />
                    <Form.Control.Feedback type="invalid">
                      {scoreError}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleScore}
                    disabled={scoring || !score}
                  >
                    {scoring ? 'Submitting...' : 'Submit Score'}
                  </Button>
                </Form>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* No Submissions Message */}
      {submissions.length === 0 && (
        <Row>
          <Col>
            <div className="text-center p-5">
              <h3>No submissions yet</h3>
              <p className="text-muted">Be the first to submit your work!</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default CompetitionDetail;