# GeneCraft

GeneCraft is an AI-driven web application for CRISPR guide RNA design and analysis. It provides a modern, user-friendly interface for analyzing DNA sequences and designing guide RNAs for CRISPR-based gene editing.

## Features

- Upload and analyze FASTA/BAM files
- AI-driven guide RNA design
- Interactive 3D molecular visualization
- Safety analysis and recommendations
- Modern, responsive UI with Bootstrap 5

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

## Setup

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at http://localhost:8000

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at http://localhost:3000

## Usage

1. Open http://localhost:3000 in your web browser
2. Upload a FASTA/BAM file or enter a DNA sequence
3. Click "Analyze Sequence" to get guide RNA recommendations
4. View the 3D molecular visualization
5. Review safety analysis and recommendations

## Disclaimer

This tool is for research purposes only. Not for clinical use.

## License

MIT 