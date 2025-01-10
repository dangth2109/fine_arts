import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Modal, Badge } from 'react-bootstrap';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../services/api';
import '../assets/css/ExhibitionDetail.css';

function ExhibitionDetail() {
  const { id } = useParams();
  const [exhibition, setExhibition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/exhibitions/${id}`);
        setExhibition(response.data.data);
        if (response.data.data.artwork) {
          setSubmissions(response.data.data.artwork);
        }
      } catch (error) {
        console.error('Error fetching exhibition:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (!exhibition) return <div className="text-center p-5">Exhibition not found</div>;

  return (
    <Container fluid className="exhibition-detail py-5">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="exhibition-header border-0 shadow-sm">
            <div className="position-relative">
              <Card.Img 
                variant="top" 
                src={`${baseURL}${exhibition.background}`}
                onError={(e) => {
                  e.target.onerror = null;
                    e.target.src = `${baseURL}/images/exhibitions/default-background.jpg`;
                }}
                alt={exhibition.name}
                className="exhibition-banner"
              />
              <div className="overlay-gradient"></div>
            </div>
            <Card.Body className="p-4">
              <div className="exhibition-info">
                <div className="text-center mb-4">
                  <h1 className="display-4 fw-bold mb-3">{exhibition.name}</h1>
                  {exhibition.description && (
                    <p className="lead text-muted">{exhibition.description}</p>
                  )}
                </div>

                <Row className="exhibition-stats text-center g-4">
                  <Col md={4}>
                    <div className="stat-card p-4 rounded bg-light d-flex flex-column" 
                         style={{ height: '180px' }}>
                      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                        <i className="fas fa-images text-primary fa-2x mb-3"></i>
                        <h3 className="fw-bold mb-0">{submissions.length}</h3>
                      </div>
                      <p className="text-muted mb-0 mt-2">Total Artworks</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-card p-4 rounded bg-light d-flex flex-column"
                         style={{ height: '180px' }}>
                      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                        <i className="fas fa-map-marker-alt text-danger fa-2x mb-3"></i>
                        <h3 className="fw-bold mb-0" style={{ 
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: '3',
                          WebkitBoxOrient: 'vertical',
                          fontSize: exhibition.location?.length > 30 
                            ? exhibition.location.length > 50 
                              ? '16px' 
                              : '20px'
                            : '24px'
                        }}>
                          {exhibition.location || 'Online'}
                        </h3>
                      </div>
                      <p className="text-muted mb-0 mt-2">Location</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-card p-4 rounded bg-light d-flex flex-column"
                         style={{ height: '180px' }}>
                      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                        <i className="fas fa-calendar-alt text-success fa-2x mb-3"></i>
                        <div className="duration-display">
                          <h3 className="fw-bold mb-0">
                            <div className="d-flex flex-column align-items-center">
                              <span style={{ fontSize: '16px' }}>
                                {new Date(exhibition.start).toLocaleDateString()}
                              </span>
                              <span className="text-muted" style={{ fontSize: '14px', margin: '10px 0' }}>
                                to
                              </span>
                              <span style={{ fontSize: '16px' }}>
                                {new Date(exhibition.end).toLocaleDateString()}
                              </span>
                            </div>
                          </h3>
                        </div>
                      </div>
                      <p className="text-muted mb-0 mt-2">Duration</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Artworks Section */}
      <Row className="mb-4">
        <Col className="text-center">
          <h2 className="display-6 mb-5">Featured Artworks</h2>
        </Col>
      </Row>

      <Row className="g-4">
        {submissions.map(submission => (
          <Col key={submission._id} xs={12} md={6} lg={4}>
            <Card 
              className="artwork-card h-100 border-0 shadow-sm hover-effect"
              onClick={() => {
                setSelectedSubmission(submission);
                setShowImageModal(true);
              }}
            >
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={`${baseURL}${submission.image}`}
                  onError={(e) => {
                    e.target.onerror = null;
                      e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                  }}
                  alt={`Artwork by ${submission.author}`}
                  className="artwork-image"
                />
                <div className="overlay">
                  <i className="fas fa-search-plus fa-2x text-white"></i>
                </div>
              </div>
              <Card.Body className="p-4">
                <div className="artwork-info">
                  <h5 className="fw-bold mb-2">{submission.author}</h5>
                  {submission.competitionId && (
                    <div className="d-flex align-items-center">
                      <Badge bg="primary" className="me-2">
                        <i className="fas fa-trophy me-1"></i>
                        Competition
                      </Badge>
                      <span className="text-muted small">
                        {submission.competitionId.name}
                      </span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal with Zoom Feature */}
      <Modal 
        show={showImageModal} 
        onHide={() => {
          setShowImageModal(false);
          setSelectedSubmission(null);
        }}
        size="xl"
        centered
      >
        {selectedSubmission && (
          <>
            <Modal.Header closeButton className="bg-white text-white" style={{borderBottom: '10px solid #cbe1f7 !important', padding: '1rem'}}>
              <Modal.Title>
                <div>
                  <h5 className="mb-2">
                    <i className="fas fa-user-circle me-2"></i>
                    {selectedSubmission.author}
                  </h5>
                  {selectedSubmission.competitionId && (
                    <div className="d-flex align-items-center">
                      <Badge bg="warning" text="dark" className="me-2">
                        <i className="fas fa-trophy me-1"></i>
                        {selectedSubmission.competitionId.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-dark">
              <TransformWrapper>
                <TransformComponent>
                  <img
                    src={`${baseURL}${selectedSubmission.image}`}
                    onError={(e) => {
                      e.target.onerror = null;
                        e.target.src = `${baseURL}/images/submissions/default-image.jpg`;
                    }} 
                    alt={`Artwork by ${selectedSubmission.author}`}
                    className="artwork-detail-image w-100"
                  />
                </TransformComponent>
              </TransformWrapper>
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* Empty State */}
      {submissions.length === 0 && (
        <Row className="mt-5">
          <Col className="text-center">
            <div className="empty-state p-5">
              <i className="fas fa-images fa-4x text-muted mb-4"></i>
              <h3 className="fw-bold">No Artworks Yet</h3>
              <p className="text-muted">This exhibition is currently empty.</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default ExhibitionDetail;