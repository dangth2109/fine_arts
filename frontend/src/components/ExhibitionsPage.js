import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);

  const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await api.get('/exhibitions');
        setExhibitions(response.data.data.filter(comp => !comp.isHide));
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  return (
    <Container fluid className="mt-4 px-3">
      <Row>
        <Col>
          <h2 className="section-title mb-4">
            <span className="border-bottom border-3 border-dark pb-2">All Exhibitions</span>
          </h2>
        </Col>
      </Row>
      
      <Row>
        {exhibitions.map(exhibition => (
          <Col key={exhibition._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <Link 
              to={`/exhibitions/${exhibition._id}`}
              className="text-decoration-none"
            >
              <Card className="h-100 hover-shadow">
                <Card.Img 
                  variant="top" 
                  src={`${baseURL}${exhibition.background}`}
                  alt={exhibition.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title className="text-dark">{exhibition.name}</Card.Title>
                  <Card.Text className="text-secondary">
                    {exhibition.description}
                  </Card.Text>
                  <Card.Text>
                    <small className="text-muted">
                      Location: {exhibition.location}
                    </small>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ExhibitionsPage;