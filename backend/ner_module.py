"""
Phase 1: Entity & Fact Locking Module
Uses SpaCy and enhanced domain extraction patterns to extract:
- Numerical values & scores (e.g., 98%, 4 out of 4, 320ms, $165,000)
- Proprietary & technical terms (e.g., Kubernetes, Kafka, Redis, Docker)
- Specific dates, times & timeframes (e.g., October 12, 2026, Q3 2026, Monday at 3:00 PM)
- Proper names (e.g., Alice Chen, David Kumar, Sarah Lin)

Wraps entities in XML tags (<keep>...</keep>) and produces strict prompt arrays.
"""

import re
from typing import List, Dict, Any, Optional

try:
    import spacy
    NLP = spacy.load("en_core_web_sm")
except Exception:
    NLP = None

# Common technical vocabulary for entity recognition
TECH_TERMS = {
    "python", "kubernetes", "docker", "redis", "postgresql", "postgres",
    "kafka", "aws", "gcp", "azure", "fastapi", "react", "react.js", "next.js",
    "vite", "go", "golang", "rust", "typescript", "javascript", "leetcode",
    "system design", "sla", "cve", "rest api", "graphql", "ci/cd", "sql",
    "mongodb", "microservices", "elasticsearch", "airflow", "terraform"
}

# Regex patterns for high-precision capture of dates, numbers, scores, currency, and metrics
REGEX_PATTERNS = [
    (r"\b\d+(?:\.\d+)?%\b", "PERCENTAGE"),                            # 98%, 34.2%
    (r"\b\d+\s*(?:out of|\/)\s*\d+\b", "SCORE_RATIO"),                # 4 out of 4, 3/5
    (r"\$\d+(?:,\d{3})*(?:\.\d+)?[MBKmbk]?\b", "CURRENCY"),           # $165,000, $2.4M, $15,000
    (r"\b\d+(?:\.\d+)?\s*(?:ms|seconds|minutes|hours|days|years)\b", "DURATION_METRIC"), # 320ms, 45 minutes, 6 years
    (r"\b(?:Q[1-4]\s*\d{4}|Q[1-4])\b", "QUARTER_DATE"),                # Q3 2026, Q2
    (r"\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)(?:\s*[A-Z]{3,4})?\b", "TIME"), # 3:00 PM EST
    (r"\b\d{4}\b", "YEAR"),                                           # 2025, 2026
    (r"\b\d+\s+(?:critical|CVE|engineers|challenges|vulnerabilities)\b", "QUANTITY"), # 14 critical CVE, 12 engineers
    (r"\b\d+(?:\.\d+)?\s*SLA\b", "SLA_METRIC"),                       # 99.99% SLA
]


class EntityLockingModule:
    """Extracts, locks, and tags entities to prevent hallucination or distortion."""

    def __init__(self):
        self.nlp = NLP

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract entities from raw input text using SpaCy NER combined with domain regexes.
        Returns a list of entity dictionaries with text, label, start, and end offsets.
        """
        extracted = []
        seen_spans = set()

        # 1. SpaCy Extraction
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                # Include relevant entity categories, excluding generic pronouns/stopwords
                if ent.label_ in {"PERSON", "ORG", "DATE", "TIME", "MONEY", "PERCENT", "CARDINAL", "QUANTITY", "PRODUCT", "NORP"}:
                    cleaned = ent.text.strip()
                    if ent.label_ == "CARDINAL" and cleaned.lower() in {"one", "two", "three", "first", "second", "third", "each", "both"}:
                        continue
                    if cleaned and len(cleaned) > 1 and (ent.start_char, ent.end_char) not in seen_spans:
                        extracted.append({
                            "text": cleaned,
                            "label": ent.label_,
                            "start": ent.start_char,
                            "end": ent.end_char,
                            "source": "spacy"
                        })
                        seen_spans.add((ent.start_char, ent.end_char))

        # 2. High-precision Regex Patterns
        for pattern, label in REGEX_PATTERNS:
            for match in re.finditer(pattern, text, flags=re.IGNORECASE):
                span = (match.start(), match.end())
                if not any(s[0] <= span[0] and span[1] <= s[1] for s in seen_spans):
                    extracted.append({
                        "text": match.group().strip(),
                        "label": label,
                        "start": match.start(),
                        "end": match.end(),
                        "source": "regex"
                    })
                    seen_spans.add(span)

        # 3. Technical Terms Pattern
        for tech in TECH_TERMS:
            tech_pattern = rf"\b{re.escape(tech)}\b"
            for match in re.finditer(tech_pattern, text, flags=re.IGNORECASE):
                span = (match.start(), match.end())
                if not any(s[0] <= span[0] and span[1] <= s[1] for s in seen_spans):
                    # Preserve exact casing from original text
                    extracted.append({
                        "text": text[match.start():match.end()].strip(),
                        "label": "TECH_TERM",
                        "start": match.start(),
                        "end": match.end(),
                        "source": "tech_vocab"
                    })
                    seen_spans.add(span)

        # Sort entities by order of appearance
        extracted.sort(key=lambda x: x["start"])

        # Deduplicate overlapping spans (keep longer match)
        filtered = []
        for ent in extracted:
            overlap = False
            for f in filtered:
                if not (ent["end"] <= f["start"] or ent["start"] >= f["end"]):
                    overlap = True
                    break
            if not overlap:
                filtered.append(ent)

        return filtered

    def tag_xml(self, text: str, entities: List[Dict[str, Any]]) -> str:
        """
        Wrap locked entities inside XML tags: <keep label="LABEL">entity</keep>
        """
        sorted_ents = sorted(entities, key=lambda x: x["start"], reverse=True)
        xml_text = text
        for ent in sorted_ents:
            start = ent["start"]
            end = ent["end"]
            original = text[start:end]
            tag = f'<keep label="{ent["label"]}">{original}</keep>'
            xml_text = xml_text[:start] + tag + xml_text[end:]
        return xml_text

    def get_preservation_prompt_data(self, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Produces formatted array and strict prompt directives for LLM ingestion.
        """
        entity_values = [e["text"] for e in entities]
        prompt_instruction = (
            "STRICT ENTITY PRESERVATION CONSTRAINT:\n"
            "You MUST preserve all of the following exact factual entities, numerical scores, "
            "dates, names, and technical terms in your final output without altering or omitting them:\n"
            f"{entity_values}\n"
            "Do NOT invent new numbers, companies, or outcomes. Do NOT change dates or metrics."
        )
        return {
            "entity_list": entity_values,
            "entity_count": len(entity_values),
            "instruction": prompt_instruction
        }

    def verify_entities_present(self, original_entities: List[Dict[str, Any]], rewritten_text: str) -> Dict[str, Any]:
        """
        Verify that all locked entities from original text survived in rewritten text.
        """
        missing = []
        preserved = []
        lowered_output = rewritten_text.lower()

        for ent in original_entities:
            val = ent["text"].strip()
            # Check case-insensitive match or exact numeric match
            if val.lower() in lowered_output or val in rewritten_text:
                preserved.append(val)
            else:
                # Check normalized numbers if score or percent
                norm_val = re.sub(r"\s+", "", val.lower())
                norm_out = re.sub(r"\s+", "", lowered_output)
                if norm_val in norm_out:
                    preserved.append(val)
                else:
                    missing.append(val)

        total = len(original_entities)
        score = (len(preserved) / total) if total > 0 else 1.0

        return {
            "all_preserved": len(missing) == 0,
            "preservation_score": round(score, 3),
            "preserved_entities": preserved,
            "missing_entities": missing,
            "total_entities": total
        }
