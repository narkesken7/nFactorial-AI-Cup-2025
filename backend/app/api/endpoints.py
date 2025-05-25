from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import List, Dict
import tempfile
import os
from Bio import SeqIO
import pysam
from ..models.agent import MockAIAgent
from ..models.safety import SafetyChecker
from pydantic import BaseModel

router = APIRouter()
ai_agent = MockAIAgent()
safety_checker = SafetyChecker()

class SequenceRequest(BaseModel):
    sequence: str

@router.post("/upload/fasta")
async def upload_fasta(file: UploadFile = File(...)):
    if not file.filename.endswith(('.fasta', '.fa')):
        raise HTTPException(status_code=400, detail="Only FASTA files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.fasta') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Parse FASTA file
            sequences = []
            for record in SeqIO.parse(temp_file.name, "fasta"):
                sequences.append({
                    "id": record.id,
                    "sequence": str(record.seq),
                    "description": record.description
                })
            
            # Clean up
            os.unlink(temp_file.name)
            
            if not sequences:
                raise HTTPException(status_code=400, detail="No valid sequences found in file")
            
            return {"sequences": sequences}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing FASTA file: {str(e)}")

@router.post("/upload/bam")
async def upload_bam(file: UploadFile = File(...)):
    if not file.filename.endswith('.bam'):
        raise HTTPException(status_code=400, detail="Only BAM files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.bam') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Parse BAM file
            variants = []
            with pysam.AlignmentFile(temp_file.name, "rb") as bam:
                for read in bam:
                    if read.is_paired and read.is_proper_pair:
                        variants.append({
                            "chromosome": read.reference_name,
                            "position": read.reference_start,
                            "sequence": read.query_sequence,
                            "quality": read.mapping_quality
                        })
            
            # Clean up
            os.unlink(temp_file.name)
            
            if not variants:
                raise HTTPException(status_code=400, detail="No valid variants found in file")
            
            return {"variants": variants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing BAM file: {str(e)}")

@router.post("/analyze/sequence")
async def analyze_sequence(request: SequenceRequest):
    try:
        # Validate sequence
        sequence = request.sequence.strip().upper()
        if not sequence:
            raise HTTPException(status_code=400, detail="Empty sequence provided")
        
        valid_bases = set('ATGC')
        if not all(base in valid_bases for base in sequence):
            raise HTTPException(status_code=400, detail="Invalid sequence: only A, T, G, C are allowed")
        
        if len(sequence) < 20:
            raise HTTPException(status_code=400, detail="Sequence must be at least 20 bases long")

        # Get AI analysis
        guide_rnas = ai_agent.design_guide_rnas(sequence)
        if not guide_rnas:
            raise HTTPException(status_code=500, detail="No guide RNAs could be designed")
        
        safety_analysis = safety_checker.check_safety(guide_rnas)
        
        return {
            "guide_rnas": guide_rnas,
            "safety_analysis": safety_analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing sequence: {str(e)}") 