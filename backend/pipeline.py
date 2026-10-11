"""
Pipeline Orchestrator: End-to-End Humanization & Factuality Pipeline
Coordinates all 5 stages and executes the automated validation loop.
"""

import time
from typing import Dict, Any, List, Optional
from backend.ner_module import EntityLockingModule
from backend.style_classifier import StyleClassifier
from backend.contextual_rewriter import ContextualRewriter
from backend.factuality_validator import FactualityValidator


class HumanizationPipeline:
    """End-to-End Pipeline implementing the technical workflow."""

    def __init__(self, rewrite_threshold: float = 25.0, default_engine: str = "local"):
        self.ner_module = EntityLockingModule()
        self.style_classifier = StyleClassifier(rewrite_threshold=rewrite_threshold)
        self.contextual_rewriter = ContextualRewriter(default_engine=default_engine)
        self.factuality_validator = FactualityValidator()

    def process(
        self,
        raw_text: str,
        context: str = "Recruiter Feedback",
        tone: str = "conversational",
        engine: str = "local",
        api_key: Optional[str] = None,
        max_retries: int = 2,
        force_humanize: bool = False,
        aggressiveness: str = "balanced"
    ) -> Dict[str, Any]:
        """
        Executes the full pipeline:
        Stage 1: Raw Input ingestion
        Stage 2: NER Module (SpaCy) -> Extract & Lock entities, wrap in XML
        Stage 3: Style Classifier -> Calculate Robotic Score & check rewrite bypass
        Stage 4: Contextual Rewriter -> Generate rewrite with locked entities
        Stage 5: Factuality Validator (NLI Model) -> Verify entailment & entity preservation
        Loop: If condition not met, feed corrective feedback back to Stage 4 until valid or max retries.
        """
        start_time = time.time()
        pipeline_log = []

        # -------------------------------------------------------------
        # Stage 1: Raw Input
        # -------------------------------------------------------------
        pipeline_log.append({
            "stage": 1,
            "name": "Raw Input Ingestion",
            "status": "COMPLETED",
            "details": f"Received {len(raw_text.split())} words."
        })

        # -------------------------------------------------------------
        # Stage 2: NER Module (SpaCy + Domain Patterns)
        # -------------------------------------------------------------
        stage2_start = time.time()
        extracted_entities = self.ner_module.extract_entities(raw_text)
        xml_tagged_text = self.ner_module.tag_xml(raw_text, extracted_entities)
        prompt_data = self.ner_module.get_preservation_prompt_data(extracted_entities)
        locked_values = prompt_data["entity_list"]
        stage2_duration = round((time.time() - stage2_start) * 1000, 2)

        pipeline_log.append({
            "stage": 2,
            "name": "NER Module (SpaCy/Domain)",
            "status": "COMPLETED",
            "duration_ms": stage2_duration,
            "entities_found": len(extracted_entities),
            "locked_entities": locked_values
        })

        # -------------------------------------------------------------
        # Stage 3: Style Classifier (Robotic Language Detection)
        # -------------------------------------------------------------
        stage3_start = time.time()
        style_analysis = self.style_classifier.analyze(raw_text)
        stage3_duration = round((time.time() - stage3_start) * 1000, 2)

        pipeline_log.append({
            "stage": 3,
            "name": "Style Classifier",
            "status": "COMPLETED",
            "duration_ms": stage3_duration,
            "robotic_score": style_analysis["robotic_score"],
            "robotic_level": style_analysis["robotic_level"],
            "bypass_rewrite": style_analysis["bypass_rewrite"]
        })

        # Check resistance to unnecessary rewriting (skipped if force_humanize is requested)
        if not force_humanize and style_analysis["bypass_rewrite"]:
            total_duration = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "original_text": raw_text,
                "final_text": raw_text,
                "was_bypassed": True,
                "bypass_reason": style_analysis["bypass_reason"],
                "context": context,
                "tone": tone,
                "pipeline_stages": {
                    "raw_input": raw_text,
                    "entities": extracted_entities,
                    "xml_tagged": xml_tagged_text,
                    "style_analysis": style_analysis,
                    "iterations": [],
                    "final_validation": {
                        "condition_met": True,
                        "verdict": "PASSED (AUTHENTIC HUMAN TEXT)",
                        "entailment_score": 1.0,
                        "contradiction_score": 0.0,
                        "neutral_score": 0.0,
                        "entity_preservation_score": 100.0,
                        "missing_entities": []
                    }
                },
                "evaluation_metrics": {
                    "naturalness_score": style_analysis["naturalness_score"],
                    "robotic_reduction": 0.0,
                    "meaning_preservation_score": 100.0,
                    "entailment_score": 1.0,
                    "entity_preservation_score": 100.0,
                    "resistance_to_unnecessary_rewriting": "SUCCESSFUL (BYPASSED)"
                },
                "pipeline_log": pipeline_log,
                "total_duration_ms": total_duration
            }

        # -------------------------------------------------------------
        # Stages 4 & 5: Contextual Rewriting + Factuality Validation Loop
        # -------------------------------------------------------------
        iterations = []
        current_attempt = 0
        corrective_feedback = None
        final_rewrite_text = ""
        final_validation = None
        condition_met = False

        flagged_phrases_list = [p["phrase"] for p in style_analysis["flagged_phrases"]]

        while current_attempt <= max_retries and not condition_met:
            current_attempt += 1
            iter_start = time.time()

            # Stage 4: Rewriter
            rewrite_res = self.contextual_rewriter.rewrite(
                text=raw_text,
                context=context,
                tone=tone,
                locked_entities=locked_values,
                flagged_phrases=flagged_phrases_list,
                engine=engine,
                api_key=api_key,
                corrective_feedback=corrective_feedback,
                aggressiveness=aggressiveness
            )
            candidate_text = rewrite_res["rewritten_text"]

            # Stage 5: Validator
            validation_res = self.factuality_validator.evaluate_nli(
                premise=raw_text,
                hypothesis=candidate_text,
                locked_entities=extracted_entities
            )

            condition_met = validation_res["condition_met"]
            final_rewrite_text = candidate_text
            final_validation = validation_res

            iter_duration = round((time.time() - iter_start) * 1000, 2)
            iterations.append({
                "iteration": current_attempt,
                "duration_ms": iter_duration,
                "engine": rewrite_res["engine_used"],
                "candidate_text": candidate_text,
                "validation": validation_res,
                "condition_met": condition_met,
                "had_corrective_feedback": corrective_feedback is not None
            })

            pipeline_log.append({
                "stage": 4 if current_attempt == 1 else "4_retry",
                "name": f"Rewriter (Iter {current_attempt})",
                "status": "COMPLETED",
                "engine": rewrite_res["engine_used"]
            })

            pipeline_log.append({
                "stage": 5 if current_attempt == 1 else "5_retry",
                "name": f"NLI Validator (Iter {current_attempt})",
                "status": "PASSED" if condition_met else "LOOPING_BACK",
                "entailment": validation_res["entailment_score"],
                "verdict": validation_res["verdict"]
            })

            if not condition_met:
                corrective_feedback = validation_res["corrective_feedback"]

        # Run post-rewrite style analysis on final text to measure improvement
        final_style = self.style_classifier.analyze(final_rewrite_text)
        robotic_reduction = round(max(0.0, style_analysis["robotic_score"] - final_style["robotic_score"]), 1)

        total_duration = round((time.time() - start_time) * 1000, 2)

        return {
            "success": condition_met or current_attempt > max_retries,
            "original_text": raw_text,
            "final_text": final_rewrite_text,
            "was_bypassed": False,
            "bypass_reason": None,
            "context": context,
            "tone": tone,
            "pipeline_stages": {
                "raw_input": raw_text,
                "entities": extracted_entities,
                "xml_tagged": xml_tagged_text,
                "style_analysis": style_analysis,
                "post_style_analysis": final_style,
                "iterations": iterations,
                "total_iterations": current_attempt,
                "final_validation": final_validation
            },
            "evaluation_metrics": {
                "initial_robotic_score": style_analysis["robotic_score"],
                "final_robotic_score": final_style["robotic_score"],
                "robotic_reduction": robotic_reduction,
                "naturalness_score": final_style["naturalness_score"],
                "meaning_preservation_score": round(final_validation["entailment_score"] * 100.0, 1),
                "entailment_score": final_validation["entailment_score"],
                "contradiction_score": final_validation["contradiction_score"],
                "neutral_score": final_validation["neutral_score"],
                "entity_preservation_score": final_validation["entity_preservation_score"],
                "resistance_to_unnecessary_rewriting": "ACTIVE (THRESHOLD 25%)",
                "condition_met": condition_met
            },
            "pipeline_log": pipeline_log,
            "total_duration_ms": total_duration
        }
