import { useState, useCallback } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface InputFormProps {
  onAnalyze: (sequence: string) => Promise<void>;
  loading: boolean;
}

export default function InputForm({ onAnalyze, loading }: InputFormProps) {
  const [sequence, setSequence] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateSequence = (seq: string) => {
    const validBases = /^[ATGC]+$/i;
    if (!seq) {
      setValidationError('Please enter a sequence');
      return false;
    }
    if (!validBases.test(seq)) {
      setValidationError('Sequence contains invalid characters. Only A, T, G, C are allowed.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setFileError(null);
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = file.name.endsWith('.bam') ? '/api/upload/bam' : '/api/upload/fasta';
      const response = await axios.post(endpoint, formData);

      if (response.data.sequences?.[0]?.sequence) {
        const newSequence = response.data.sequences[0].sequence;
        if (validateSequence(newSequence)) {
          setSequence(newSequence);
        }
      } else if (response.data.variants?.[0]?.sequence) {
        const newSequence = response.data.variants[0].sequence;
        if (validateSequence(newSequence)) {
          setSequence(newSequence);
        }
      } else {
        setFileError('No valid sequence found in file');
      }
    } catch (err) {
      setFileError('Failed to process file. Please try again.');
      console.error(err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.fasta', '.fa'],
      'application/octet-stream': ['.bam']
    },
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSequence(sequence)) {
      await onAnalyze(sequence);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Upload FASTA/BAM File</Form.Label>
        <div
          {...getRootProps()}
          className={`p-3 border rounded text-center ${
            isDragActive ? 'bg-light' : ''
          }`}
          style={{ cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag and drop a file here, or click to select</p>
          )}
        </div>
        {fileError && <Alert variant="danger" className="mt-2">{fileError}</Alert>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Or Enter DNA Sequence</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={sequence}
          onChange={(e) => {
            setSequence(e.target.value);
            validateSequence(e.target.value);
          }}
          placeholder="Enter DNA sequence (e.g., ATGC...)"
          isInvalid={!!validationError}
        />
        {validationError && (
          <Form.Control.Feedback type="invalid">
            {validationError}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        disabled={!sequence || loading}
        className="w-100"
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Analyzing...
          </>
        ) : (
          'Analyze Sequence'
        )}
      </Button>
    </Form>
  );
} 