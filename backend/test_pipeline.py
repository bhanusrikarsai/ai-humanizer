"""
Automated Pipeline Verification Suite
Tests all 5 stages across candidate feedback, recruiter emails, interview questions,
executive summaries, and rewrite-resistance benchmarks.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from backend.pipeline import HumanizationPipeline
from backend.presets import PRESETS
from backend.ner_module import EntityLockingModule
from backend.style_classifier import StyleClassifier
from backend.factuality_validator import FactualityValidator


def test_ner_module():
    print("\n--- Testing Phase 1: NER Module ---")
    ner = EntityLockingModule()
    sample = "Candidate Alice Chen scored 94% on October 12, 2026 using Python and Kubernetes, receiving an offer of $165,000."
    entities = ner.extract_entities(sample)
    print(f"Entities extracted: {len(entities)}")
    texts = [e["text"] for e in entities]
    print(f"Entity texts: {texts}")

    # Check key entities
    assert any("Alice Chen" in t for t in texts), "Alice Chen should be captured"
    assert any("94%" in t for t in texts), "94% should be captured"
    assert any("2026" in t for t in texts or "October" in t for t in texts), "Date should be captured"
    assert any("Python" in t for t in texts), "Python should be captured"
    assert any("$165,000" in t for t in texts), "$165,000 should be captured"

    xml = ner.tag_xml(sample, entities)
    print(f"XML tagged sample: {xml}")
    assert "<keep" in xml, "XML tags must be applied"
    print("✓ Phase 1 NER tests passed!")


def test_style_classifier():
    print("\n--- Testing Phase 2: Style Classifier ---")
    classifier = StyleClassifier(rewrite_threshold=25.0)

    # Test robotic text
    robotic_sample = PRESETS["recruiter_feedback"]["text"]
    analysis = classifier.analyze(robotic_sample)
    print(f"Robotic sample score: {analysis['robotic_score']}%, level: {analysis['robotic_level']}, flagged: {analysis['flagged_count']}")
    assert analysis["robotic_score"] > 40.0, "Robotic text should score high"
    assert analysis["bypass_rewrite"] is False, "Robotic text must NOT be bypassed"

    # Test already-human text (Rewrite Resistance)
    human_sample = PRESETS["already_human"]["text"]
    human_analysis = classifier.analyze(human_sample)
    print(f"Human sample score: {human_analysis['robotic_score']}%, bypass: {human_analysis['bypass_rewrite']}")
    assert human_analysis["robotic_score"] < 25.0, "Natural text should score low"
    assert human_analysis["bypass_rewrite"] is True, "Natural text must be bypassed per resistance principle"
    print("✓ Phase 2 Style Classifier & Rewrite Resistance tests passed!")


def test_factuality_validator():
    print("\n--- Testing Phase 4: Factuality Validator ---")
    validator = FactualityValidator()
    ner = EntityLockingModule()

    premise = "Alice Chen completed 4 out of 4 challenges in 45 minutes, scoring 94%."
    entities = ner.extract_entities(premise)

    # Valid hypothesis preserving all entities
    valid_hyp = "Alice Chen finished all 4 out of 4 challenges in 45 minutes with a solid score of 94%."
    res = validator.evaluate_nli(premise, valid_hyp, entities)
    print(f"Valid rewrite entailment: {res['entailment_score']}, verdict: {res['verdict']}")
    assert res["condition_met"] is True, "Valid rewrite must pass validation"

    # Invalid hypothesis omitting 94% and changing 45 to 30
    invalid_hyp = "Alice Chen completed some challenges in 30 minutes."
    res_bad = validator.evaluate_nli(premise, invalid_hyp, entities)
    print(f"Invalid rewrite entailment: {res_bad['entailment_score']}, verdict: {res_bad['verdict']}, reasons: {res_bad['rejection_reasons']}")
    assert res_bad["condition_met"] is False, "Mutated rewrite must be rejected"
    print("✓ Phase 4 Factuality Validator tests passed!")


def test_full_pipeline():
    print("\n--- Testing Full End-to-End Pipeline ---")
    pipeline = HumanizationPipeline()

    for preset_key, preset_data in PRESETS.items():
        print(f"\nProcessing preset: '{preset_data['title']}'...")
        res = pipeline.process(
            raw_text=preset_data["text"],
            context=preset_data["context"],
            tone=preset_data["tone"]
        )

        print(f"Status: Success={res['success']}, Bypassed={res['was_bypassed']}, Duration={res['total_duration_ms']}ms")
        print(f"Original Text snippet: {res['original_text'][:70]}...")
        print(f"Final Text snippet:    {res['final_text'][:70]}...")
        print(f"Metrics: Naturalness={res['evaluation_metrics']['naturalness_score']}, Entailment={res['evaluation_metrics']['entailment_score']}, Entity Preservation={res['evaluation_metrics']['entity_preservation_score']}%")

        if preset_key == "already_human":
            assert res["was_bypassed"] is True, "Human sample must trigger rewrite resistance bypass"
        else:
            assert res["success"] is True, f"Preset {preset_key} must succeed"
            assert res["evaluation_metrics"]["entity_preservation_score"] >= 80.0, "Entity preservation must be high"

    print("\n✓ ALL END-TO-END PIPELINE TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_ner_module()
    test_style_classifier()
    test_factuality_validator()
    test_full_pipeline()
