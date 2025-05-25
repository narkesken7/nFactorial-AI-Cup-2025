from typing import List, Dict
import os
from anthropic import Anthropic
from dotenv import load_dotenv
import json
import re

load_dotenv()

class MockAIAgent:
    def __init__(self):
        self.pam_sequence = "NGG"  # Standard PAM sequence for SpCas9
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
    def design_guide_rnas(self, sequence: str) -> List[Dict]:
        """Use Claude to analyze DNA sequence and design guide RNAs."""
        try:
            # Prepare prompt for Claude
            prompt = f"""Analyze this DNA sequence and design CRISPR guide RNAs:
            Sequence: {sequence}
            
            Please provide:
            1. Top 5 guide RNA sequences (20bp) with PAM sites
            2. Efficiency scores (0-1)
            3. Potential off-target sites
            4. Strand information
            5. Brief notes on each guide
            
            Format the response as a JSON array with these fields:
            - sequence
            - position
            - efficiency_score
            - off_target_sites
            - strand
            - notes
            
            Example format:
            [
              {{
                "sequence": "ATGCGT...",
                "position": 0,
                "efficiency_score": 0.95,
                "off_target_sites": 1,
                "strand": "+",
                "notes": "High efficiency, low off-target risk"
              }}
            ]
            """

            # Get response from Claude
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0.1,
                system="You are a CRISPR guide RNA design expert. Provide accurate, scientific analysis in JSON format.",
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Extract JSON from response
            response_text = response.content[0].text
            try:
                # Try to find JSON array in the response
                json_match = re.search(r'\[\s*\{.*\}\s*\]', response_text, re.DOTALL)
                if json_match:
                    guide_rnas = json.loads(json_match.group())
                else:
                    # If no JSON found, try to parse the entire response
                    guide_rnas = json.loads(response_text)
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {str(e)}")
                print(f"Response text: {response_text}")
                # Fallback to mock data if parsing fails
                guide_rnas = self._generate_mock_guides(sequence)

            # Validate guide RNAs format
            if not isinstance(guide_rnas, list):
                guide_rnas = [guide_rnas]
            
            # Ensure all required fields are present
            valid_guides = []
            for guide in guide_rnas:
                if all(key in guide for key in ["sequence", "position", "efficiency_score", "off_target_sites", "strand", "notes"]):
                    valid_guides.append(guide)
            
            if not valid_guides:
                return self._generate_mock_guides(sequence)
            
            return valid_guides[:5]  # Return top 5 guides

        except Exception as e:
            print(f"Error in Claude API call: {str(e)}")
            # Fallback to mock data if API call fails
            return self._generate_mock_guides(sequence)

    def _generate_mock_guides(self, sequence: str) -> List[Dict]:
        """Fallback method to generate mock guide RNAs."""
        import random
        guide_rnas = []
        for i in range(len(sequence) - 23):
            if sequence[i+20:i+23] == self.pam_sequence:
                guide_seq = sequence[i:i+20]
                score = random.uniform(0.7, 1.0)
                
                guide_rnas.append({
                    "sequence": guide_seq,
                    "position": i,
                    "efficiency_score": round(score, 2),
                    "off_target_sites": random.randint(0, 3),
                    "strand": random.choice(["+", "-"]),
                    "notes": "Mock AI-generated guide RNA"
                })
        
        guide_rnas.sort(key=lambda x: x["efficiency_score"], reverse=True)
        return guide_rnas[:5] 