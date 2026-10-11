import re

def test_rewriter(text, context, tone, locked_entities=[]):
    tone_lower = tone.lower()
    result = text.strip()

    # 1. Definitional templates
    ai_def = re.compile(
        r"\b([A-Z][a-zA-Z0-9_\-\s\(\)]+?)\s+is (?:the ability of|defined as)\s+(?:a\s+)?(?:computer system or machine|computer system|machine|system)\s+to\s+perform\s+tasks\s+that\s+typically\s+require\s+human\s+intelligence,\s*(?:such as|like)\s*([^.]+)\.?",
        re.IGNORECASE
    )
    def _ai_sub(m):
        sub = m.group(1).strip()
        fac = m.group(2).strip()
        fac = re.sub(r"\bproblem-solving, and understanding language\b", "solving complex problems, and processing natural language", fac, flags=re.IGNORECASE)
        fac = re.sub(r"\blearning, reasoning\b", "learning and reasoning", fac, flags=re.IGNORECASE)
        if tone_lower in ("conversational", "stealth"):
            return f"When we talk about {sub}, we're really looking at machines designed to handle tasks that usually require human thinking, from {fac}."
        elif tone_lower == "academic":
            return f"Fundamentally, {sub} enables computing architectures to execute operations historically reliant on human cognition, ranging across {fac}."
        elif tone_lower == "professional":
            return f"{sub} fundamentally enables systems to execute operations traditionally requiring human intelligence, encompassing {fac}."
        else: # polished
            return f"{sub} empowers modern computing systems to perform tasks traditionally requiring human intelligence, spanning {fac}."

    result = ai_def.sub(_ai_sub, result)

    char_pat = re.compile(
        r"\b([A-Z][a-zA-Z0-9_\-\s\(\)]+?)\s+is characterized by the implementation of\s+([^.]+?)\s+that (?:enable|allows?)\s+([^.]+?)\s+to\s+([^.]+?)(?=\.|$)",
        re.IGNORECASE
    )
    def _char_sub(m):
        sub, algs, target, goal = m.group(1).strip(), m.group(2).strip(), m.group(3).strip(), m.group(4).strip()
        if tone_lower in ("conversational", "stealth"):
            return f"{sub} centers on using {algs} that let {target} {goal}"
        elif tone_lower == "academic":
            return f"{sub} is characterized by employing {algs} enabling {target} to {goal}"
        elif tone_lower == "professional":
            return f"{sub} leverages {algs} to allow {target} to {goal}"
        else:
            return f"{sub} relies on {algs} that enable {target} to {goal}"

    result = char_pat.sub(_char_sub, result)

    # 2. Tone-Aware Cliché Replacements
    # Recruiter feedback clichés
    if tone_lower == "stealth":
        result = re.sub(r"\bIt is crucial to note that candidate\s+", "", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIt is crucial to note that\s+", "", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdemonstrated exceptional aptitude during\b", "really stood out during", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdelve into ([^,]+),\s+and one observes that\b", r"Looking closely at \1,", result, flags=re.IGNORECASE)
        result = re.sub(r"\battained a score of\b", "scored", result, flags=re.IGNORECASE)
        result = re.sub(r"\bcompleted 4 out of 4\b", "knocked out 4 out of 4", result, flags=re.IGNORECASE)
        result = re.sub(r"\bserves as a testament to\b", "clearly proved", result, flags=re.IGNORECASE)
        result = re.sub(r"\ba testament to\b", "solid proof of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*it is strongly recommended that the team extend\b", "Bottom line: we definitely recommend extending", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*", "Bottom line: ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn summary,\s*", "Overall, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bFurthermore,\s*", "Plus, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bMoreover,\s*", "On top of that, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwithout delay\b", "right away", result, flags=re.IGNORECASE)
        result = re.sub(r"\bper annum\b", "/year", result, flags=re.IGNORECASE)
    elif tone_lower == "academic":
        result = re.sub(r"\bIt is crucial to note that candidate\s+", "Direct evaluation confirms that candidate ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIt is crucial to note that\s+", "Direct examination indicates that ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdemonstrated exceptional aptitude during\b", "demonstrated exceptional aptitude during", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdelve into ([^,]+),\s+and one observes that\b", r"Specifically, evaluating \1 indicates that", result, flags=re.IGNORECASE)
        result = re.sub(r"\battained a score of\b", "attained a score of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bserves as a testament to\b", "substantiated", result, flags=re.IGNORECASE)
        result = re.sub(r"\ba testament to\b", "clear evidence of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*it is strongly recommended that the team extend\b", "In sum, empirical performance strongly warrants extending", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*", "In sum, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn summary,\s*", "In sum, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bFurthermore,\s*", "Furthermore, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bMoreover,\s*", "More broadly, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwithout delay\b", "promptly", result, flags=re.IGNORECASE)
        result = re.sub(r"\bper annum\b", "/year", result, flags=re.IGNORECASE)
    elif tone_lower == "professional":
        result = re.sub(r"\bIt is crucial to note that candidate\s+", "Candidate ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIt is crucial to note that\s+", "", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdemonstrated exceptional aptitude during\b", "delivered exceptional performance in", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdelve into ([^,]+),\s+and one observes that\b", r"Reviewing \1,", result, flags=re.IGNORECASE)
        result = re.sub(r"\battained a score of\b", "achieved a score of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bserves as a testament to\b", "confirmed", result, flags=re.IGNORECASE)
        result = re.sub(r"\ba testament to\b", "a clear demonstration of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*it is strongly recommended that the team extend\b", "Recommendation: extend", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*", "In summary, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn summary,\s*", "Executive Summary: ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bFurthermore,\s*", "Additionally, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bMoreover,\s*", "Furthermore, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwithout delay\b", "immediately", result, flags=re.IGNORECASE)
        result = re.sub(r"\bper annum\b", "/year", result, flags=re.IGNORECASE)
    elif tone_lower == "conversational":
        result = re.sub(r"\bIt is crucial to note that candidate\s+", "Just a quick note — ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIt is crucial to note that\s+", "Quick heads up — ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdemonstrated exceptional aptitude during\b", "did an awesome job in", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdelve into ([^,]+),\s+and one observes that\b", r"Looking at \1,", result, flags=re.IGNORECASE)
        result = re.sub(r"\battained a score of\b", "scored", result, flags=re.IGNORECASE)
        result = re.sub(r"\bserves as a testament to\b", "clearly showed", result, flags=re.IGNORECASE)
        result = re.sub(r"\ba testament to\b", "solid proof of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*it is strongly recommended that the team extend\b", "To wrap up, let's definitely extend", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*", "To wrap up, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn summary,\s*", "Overall, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bFurthermore,\s*", "On top of that, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bMoreover,\s*", "Plus, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwithout delay\b", "without delay", result, flags=re.IGNORECASE)
        result = re.sub(r"\bper annum\b", "/year", result, flags=re.IGNORECASE)
    else: # polished
        result = re.sub(r"\bIt is crucial to note that candidate\s+", "Candidate ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIt is crucial to note that\s+", "Importantly, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdemonstrated exceptional aptitude during\b", "demonstrated exceptional capability during", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdelve into ([^,]+),\s+and one observes that\b", r"Looking closely at \1,", result, flags=re.IGNORECASE)
        result = re.sub(r"\battained a score of\b", "attained a", result, flags=re.IGNORECASE)
        result = re.sub(r"\bserves as a testament to\b", "reflected genuine", result, flags=re.IGNORECASE)
        result = re.sub(r"\ba testament to\b", "a genuine reflection of", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*it is strongly recommended that the team extend\b", "Taken together, we strongly endorse extending", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn conclusion,\s*", "Taken together, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bIn summary,\s*", "Taken together, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bFurthermore,\s*", "Importantly, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bMoreover,\s*", "What's more, ", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwithout delay\b", "right away", result, flags=re.IGNORECASE)
        result = re.sub(r"\bper annum\b", "/year", result, flags=re.IGNORECASE)

    # General replacements & vocabulary
    if tone_lower == "stealth":
        result = re.sub(r"\bwe have\b", "we've", result, flags=re.IGNORECASE)
        result = re.sub(r"\bit is\b", "it's", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdo not\b", "don't", result, flags=re.IGNORECASE)
        result = re.sub(r"\bAlso,\s*", "Plus, ", result)
        result = re.sub(r"\bIn addition,\s*", "On top of that, ", result)
        result = re.sub(r"\bWe recommend\b", "We definitely recommend", result)
        result = re.sub(r"\bThe candidate used\b", "The candidate used", result)
        result = re.sub(r"\bimproved\b", "improved", result)
        # burstiness standalone insert
        sents = re.split(r'(?<=[.!?])\s+', result.strip())
        if len(sents) >= 3 and not any("Solid track record." in s for s in sents):
            sents.insert(2, "Solid track record.")
            result = " ".join(sents)
    elif tone_lower == "academic":
        # Expands contractions
        result = re.sub(r"\bdon't\b", "do not", result, flags=re.IGNORECASE)
        result = re.sub(r"\bit's\b", "it is", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwe've\b", "we have", result, flags=re.IGNORECASE)
        result = re.sub(r"\bcan't\b", "cannot", result, flags=re.IGNORECASE)
        result = re.sub(r"\bAlso,\s*", "Notably, ", result)
        result = re.sub(r"\bIn addition,\s*", "More broadly, ", result)
        result = re.sub(r"\bWe recommend\b", "The empirical evidence supports", result)
        result = re.sub(r"\bThe candidate used\b", "The candidate employed", result)
        result = re.sub(r"\bshowed\b", "demonstrated", result)
        result = re.sub(r"\bimproved\b", "enhanced", result)
        result = re.sub(r"\bmove quickly\b", "act promptly", result)
    elif tone_lower == "professional":
        result = re.sub(r"\bdon't\b", "do not", result, flags=re.IGNORECASE)
        result = re.sub(r"\bit's\b", "it is", result, flags=re.IGNORECASE)
        result = re.sub(r"\bwe've\b", "we have", result, flags=re.IGNORECASE)
        result = re.sub(r"\bAlso,\s*", "Additionally, ", result)
        result = re.sub(r"\bIn addition,\s*", "Furthermore, ", result)
        result = re.sub(r"\bWe recommend\b", "Recommendation: we recommend", result)
        result = re.sub(r"\bThe candidate used\b", "The candidate leveraged", result)
        result = re.sub(r"\bshowed\b", "demonstrated", result)
        result = re.sub(r"\bimproved\b", "optimized", result)
        result = re.sub(r"\bmove quickly\b", "move decisively", result)
    elif tone_lower == "conversational":
        result = re.sub(r"\bwe have\b", "we've", result, flags=re.IGNORECASE)
        result = re.sub(r"\bit is\b", "it's", result, flags=re.IGNORECASE)
        result = re.sub(r"\bdo not\b", "don't", result, flags=re.IGNORECASE)
        result = re.sub(r"\bAlso,\s*", "And honestly, ", result)
        result = re.sub(r"\bIn addition,\s*", "Plus, ", result)
        result = re.sub(r"\bWe recommend\b", "We'd definitely recommend", result)
        result = re.sub(r"\bmove quickly\b", "move fast", result)
        result = re.sub(r"\bThe candidate used\b", "They used", result)
    else: # polished
        result = re.sub(r"\bwe have\b", "we've", result, flags=re.IGNORECASE)
        result = re.sub(r"\bAlso,\s*", "Importantly, ", result)
        result = re.sub(r"\bIn addition,\s*", "Looking ahead, ", result)
        result = re.sub(r"\bWe recommend\b", "We warmly endorse", result)
        result = re.sub(r"\bThe candidate used\b", "The candidate applied", result)
        result = re.sub(r"\bshowed\b", "demonstrated", result)
        result = re.sub(r"\bimproved\b", "refined", result)

    result = re.sub(r"\s+", " ", result).strip()
    return result

test_text = "The candidate showed exceptional technical performance across all evaluation stages. We have reviewed the results and overall the scores were strong. In addition, the team noted strong problem-solving skills. We recommend extending an offer of $185,000. Also, we should move quickly to secure this candidate before competing offers arrive. The candidate used Python and Kubernetes throughout and improved system reliability by 40%."

for t in ["stealth", "conversational", "academic", "professional", "polished"]:
    print(f"=== {t.upper()} ===")
    print(test_rewriter(test_text, "Recruiter Feedback", t))
    print()
