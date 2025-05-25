import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import InputForm from '../components/InputForm';
import MolecularViewer from '../components/MolecularViewer';
import { analyzeSequence } from '../lib/api';

export default function Home() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);

  const handleAnalyze = async (sequence: string) => {
    try {
      setLoading(true);
      setError(null);
      setShow3D(false);
      const result = await analyzeSequence(sequence);
      setAnalysis(result);
      // Show 3D visualization after a short delay
      setTimeout(() => {
        setShow3D(true);
      }, 1000);
    } catch (err) {
      setError('Failed to analyze sequence. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Alert variant="warning" className="mb-4">
        <strong>Disclaimer:</strong> This tool is for research purposes only. Not for clinical use.
      </Alert>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h2>GeneCraft</h2>
              <p className="text-muted">AI-driven CRISPR guide RNA design</p>
            </Card.Header>
            <Card.Body>
              <InputForm onAnalyze={handleAnalyze} loading={loading} />
            </Card.Body>
          </Card>

          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Analyzing sequence...</p>
            </div>
          )}

          {analysis && !loading && (
            <Card>
              <Card.Header>Analysis Results</Card.Header>
              <Card.Body>
                <h5>Guide RNAs</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Sequence</th>
                        <th>Score</th>
                        <th>Safety</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.guide_rnas?.map((guide: any, index: number) => (
                        <tr key={index}>
                          <td>{guide.sequence}</td>
                          <td>{guide.efficiency_score}</td>
                          <td>{guide.safety_analysis?.recommendation}</td>
                          <td>{guide.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>3D Molecular Viewer</Card.Header>
            <Card.Body style={{ height: '600px' }}>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : !show3D ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p className="text-muted">3D visualization will appear after analysis...</p>
                </div>
              ) : (
                <MolecularViewer sequence={analysis?.guide_rnas?.[0]?.sequence} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </Container>
  );
} 