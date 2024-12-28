import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import api from '../services/api';
import './MainLayout.css';
import { Link, useNavigate } from 'react-router-dom';

function MainLayout() {
  const [exhibitions, setExhibitions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ITEMS_PER_SLIDE = 4;
  const ITEM_WIDTH = `${100 / ITEMS_PER_SLIDE - 2}%`;

  const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exhibitionsRes, competitionsRes] = await Promise.all([
          api.get('/exhibitions'),
          api.get('/competitions')
        ]);
        setExhibitions(exhibitionsRes.data.data.filter(comp => !comp.isHide));
        setCompetitions(competitionsRes.data.data.filter(comp => !comp.isHide));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chunkArrayWithPadding = (arr, size) => {
    const chunks = Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

    const lastChunk = chunks[chunks.length - 1];
    if (lastChunk.length < size) {
      const remainingCount = size - lastChunk.length;
      const paddingItems = arr.slice(0, remainingCount);
      chunks[chunks.length - 1] = [...lastChunk, ...paddingItems];
    }

    return chunks;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-5 bg-light">
      {/* Exhibitions Section */}
      <Container>
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title mb-0">
                <span className="border-bottom border-3 border-primary pb-2">
                  Latest Exhibitions
                </span>
              </h2>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/exhibitions')}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col>
            {exhibitions.length > 0 ? (
              <Carousel 
                interval={3000} 
                indicators={true} 
                controls={false}
                className="custom-carousel"
              >
                {chunkArrayWithPadding(exhibitions, ITEMS_PER_SLIDE).map((group, idx) => (
                  <Carousel.Item key={idx}>
                    <div className="d-flex justify-content-between">
                      {group.map((exhibition, index) => (
                        <Link 
                          to={`/exhibitions/${exhibition._id}`}
                          key={`${exhibition._id}-${index}`}
                          className="text-decoration-none"
                          style={{ width: ITEM_WIDTH }}
                        >
                          <Card className="h-100 shadow-sm">
                            <div className="card-img-wrapper">
                              <Card.Img 
                                variant="top" 
                                src={`${baseURL}${exhibition.background}`}
                                alt={exhibition.name}
                                className="card-img"
                              />
                            </div>
                            <Card.Body className="d-flex flex-column">
                              <Card.Title className="text-truncate fw-bold">{exhibition.name}</Card.Title>
                              <Card.Text className="description flex-grow-1">
                                {exhibition.description}
                              </Card.Text>
                              <div className="mt-auto">
                                <small className="text-muted d-flex align-items-center">
                                  <i className="bi bi-geo-alt me-2"></i>
                                  {exhibition.location}
                                </small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No exhibitions available at the moment.</p>
              </div>
            )}
          </Col>
        </Row>

        {/* Competitions Section */}
        <Row className="mt-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title mb-0">
                <span className="border-bottom border-3 border-primary pb-2">
                  Latest Competitions
                </span>
              </h2>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/competitions')}
              >
                View All <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            {competitions.length > 0 ? (
              <Carousel 
                interval={3000} 
                indicators={true} 
                controls={false}
                className="custom-carousel"
              >
                {chunkArrayWithPadding(competitions, ITEMS_PER_SLIDE).map((group, idx) => (
                  <Carousel.Item key={idx}>
                    <div className="d-flex justify-content-between">
                      {group.map((competition, index) => (
                        <Link 
                          to={`/competitions/${competition._id}`}
                          key={`${competition._id}-${index}`}
                          className="text-decoration-none"
                          style={{ width: ITEM_WIDTH }}
                        >
                          <Card className="h-100 shadow-sm">
                            <div className="card-img-wrapper">
                              <Card.Img 
                                variant="top" 
                                src={`${baseURL}${competition.background}`}
                                alt={competition.name}
                                className="card-img"
                              />
                            </div>
                            <Card.Body className="d-flex flex-column">
                              <Card.Title className="text-truncate fw-bold">{competition.name}</Card.Title>
                              <Card.Text className="description flex-grow-1">
                                {competition.description}
                              </Card.Text>
                              <div className="mt-auto">
                                <small className="text-muted d-flex align-items-center">
                                  <i className="bi bi-calendar me-2"></i>
                                  Deadline: {new Date(competition.end).toLocaleDateString()}
                                </small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No competitions available at the moment.</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default MainLayout;
