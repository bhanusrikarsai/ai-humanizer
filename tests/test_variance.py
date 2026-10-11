import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.contextual_rewriter import ContextualRewriter
from backend.ner_module import EntityLockingModule
from backend.factuality_validator import FactualityValidator
from backend.presets import PRESETS

cr = ContextualRewriter()
ner = EntityLockingModule()
validator = FactualityValidator()

print("Validating current output variance across tones...")
modes = ["stealth", "academic", "professional", "conversational", "polished"]

for name, data in list(PRESETS.items())[:3]:
    print(f"\n================ PRESET: {name} ================")
    text = data["text"]
    context = data["context"]
    ents = ner.extract_entities(text)
    locked = [e["text"] for e in ents]
    
    outputs = {}
    for m in modes:
        out = cr.rewrite_local_engine(text, context, m, locked, [])
        outputs[m] = out
        val = validator.evaluate_nli(text, out, ents)
        print(f"[{m.upper():<14}] Valid: {val['condition_met']} | Entailment: {val['entailment_score']}")
        print(f"  {out[:120]}...")
    
    # Check if outputs are identical
    unique_count = len(set(outputs.values()))
    print(f"Unique variations among 5 modes: {unique_count}/5")
