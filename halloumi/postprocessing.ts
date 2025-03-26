
/**
 * Represents a claim object with all relevant information.
 */
export interface GenerativeClaim {
    claimId: number;
    claimString: string;
    subclaims: string[];
    citations: number[];
    explanation: string;
    supported: boolean;
    probabilties: Map<string, number>;
}

export interface OpenAITokenLogProb {
    token: string;
    bytes: number[];
    logprob: number;
}

export interface OpenAILogProb {
    token: string;
    bytes: number[];
    logprob: number;
    top_logprobs: OpenAITokenLogProb[];
}

/**
 * Gets the claim id from a subsegment.
 * @param subsegment A subsegment string of the form "<|r1|".
 * @returns The numeric claim id.
 */
function getClaimIdFromSubsegment(subsegment: string): number {
    const textClaimId = subsegment.split("|")[1];
    const integerClaimId = parseInt(textClaimId.split("r")[1]);
    return integerClaimId;
}

/**
 * Gets the citations from a subsegment.
 * @param subsegment A subsegment string of the form "|s1|,|s2|,|s3|,|s4|".
 * @returns The list of numeric citations.
 */
function getClaimCitationsFromSubsegment(subsegment: string): number[] {
    const citationSegments = subsegment.split(",");
    const citations: number[] = [];
    for (const citationSegment of citationSegments) {
        const citation = citationSegment.replaceAll("|", "").replaceAll("s", "");
        if (citation.includes("-")) {
            const citationRange = citation.split("-");
            for (let i = parseInt(citationRange[0].trim()); i <= parseInt(citationRange[1].trim()); i++) {
                citations.push(i);
            }
        }
        else if (citation.includes("to")) {
            const citationRange = citation.split("to");
            for (let i = parseInt(citationRange[0].trim()); i <= parseInt(citationRange[1].trim()); i++) {
                citations.push(i);
            }
        }
        else {
            const citationInt = parseInt(citation);
            if (!isNaN(citationInt)) {
                citations.push(parseInt(citation));
            }
        }
    }
    return citations
}

/**
 * Gets the support status from a subsegment.
 * @param subsegment A subsegment string of the form "|supported|" or "|unsupported|".
 * @returns True if the claim is supported, false otherwise.
 */
function getSupportStatusFromSubsegment(subsegment: string): boolean {
    return subsegment.startsWith("|supported|");
}

/**
 * Gets a claim from a segment string.
 * @param segment A segment string containing all information for claim verification.
 * @returns The claim object with all relevant information.
 */
function getClaimFromSegment(segment: string): GenerativeClaim {
    const claim_segments = segment.split("><");
    const claimId = getClaimIdFromSubsegment(claim_segments[0]);
    const claimString = claim_segments[1];

    const subclaims: string[] = [];
    let claimProgressIndex = 3; // Start at 3 to skip the claim id, claim string and the subclaims tag
    for (let i = claimProgressIndex; i < claim_segments.length; i++) {
        const subsegment = claim_segments[i];
        if (subsegment.startsWith("end||subclaims")) {
            claimProgressIndex = i + 1;
            break;
        }
        else {
            subclaims.push(subsegment);
        }
    }

    let citation_index = -1
    let explanation_index = -1
    let label_index = -1
    for (let i = claimProgressIndex; i < claim_segments.length; i++) {
        const subsegment = claim_segments[i];
        if (subsegment.startsWith("|cite|")) {
            citation_index = i + 1;
        }
        else if (subsegment.startsWith("|explain|")) {
            explanation_index = i + 1;
        }
        else if (subsegment.startsWith("|supported|") || subsegment.startsWith("|unsupported|")) {
            label_index = i;
        }
    }
    
    const citations = getClaimCitationsFromSubsegment(claim_segments[citation_index]);
    const explanation = claim_segments[explanation_index];
    const supported = getSupportStatusFromSubsegment(claim_segments[label_index]);

    const claim: GenerativeClaim = {
        claimId: claimId,
        claimString: claimString,
        subclaims: subclaims,
        citations: citations,
        explanation: explanation,
        supported: supported,
        probabilties: new Map()
    }

    return claim;
}

/**
 * Gets all claims from a response.
 * @param response A string containing all claims and their information.
 * @returns A list of claim objects.
 */
export function getClaimsFromResponse(response: string): GenerativeClaim[] {
    // Example response: <|r1|><There is no information about the average lifespan of a giant squid in the deep waters of the Pacific Ocean in the provided document.><|subclaims|><The document contains information about the average lifespan of a giant squid.><The information about giant squid lifespan is related to the Pacific Ocean.><end||subclaims><|cite|><|s1 to s49|><end||cite><|explain|><Upon reviewing the entire document, there is no mention of giant squid or any related topic, including their average lifespan or the Pacific Ocean. The document is focused on international relations, diplomacy, and conflict resolution.><end||explain><|supported|><end||r><|r2|><The document is focused on international relations, diplomacy, and conflict resolution, and does not mention giant squid or any related topic.><|subclaims|><The document is focused on international relations, diplomacy, and conflict resolution.><The document does not mention giant squid or any related topic.><end||subclaims><|cite|><|s1|,|s2|,|s3|,|s4|><end||cite><|explain|><The first four sentences clearly establish the document's focus on international relations, diplomacy, and conflict resolution, and there is no mention of giant squid or any related topic throughout the document.><end||explain><|supported|><end||r><|r3|><The document mentions cats.><|subclaims|><The document makes some mention of cats.><end||subclaims><|cite|><None><end||cite><|explain|><There is no mention of cats anywhere in the document.><end||explain><|unsupported|><end||r>
    
    let segments: string[] = response.split("<end||r>");
    const claims: GenerativeClaim[] = [];

    for (const segment of segments) {
        if (segment.length === 0) {
            continue;
        }

        const claim = getClaimFromSegment(segment);
        claims.push(claim);
    }

    return claims
}

function exp(x: number): number {
    return Math.pow(Math.E, x);
}

function softmax(logits: number[]): number[] {
    const softmaxes: number[] = [];
    const exp_values: number[] = [];
    let total: number = 0;
    for(let i = 0; i < logits.length; i++){
        const exponential = exp(logits[i]);
        total += exponential;
        exp_values.push(exponential);
    }

    for(let i = 0; i < exp_values.length; i++){
        softmaxes.push(exp_values[i]/total)
    }
    return softmaxes;
}

function getTokenProbabilitiesFromLogit(logit: OpenAILogProb, tokenChoices: Set<string>): Map<string, number> {
    const tokenLogits: Map<string, number> = new Map();
    let smallestLogit: number = 1000000;
    for (const token of tokenChoices) {
        const tokenLogit = logit.top_logprobs.find((logit) => logit.token == token);
        if (tokenLogit !== undefined) {
            smallestLogit = Math.min(smallestLogit, tokenLogit.logprob);
            tokenLogits.set(token, tokenLogit.logprob);
        }
    }

    // If any class tokens aren't present, set them below the smallest logit.
    // Their true value is definitely <= the smallest logit value.
    for (const token of tokenChoices) {
        if (!tokenLogits.has(token)) {
            tokenLogits.set(token, smallestLogit - 1e-6);
        }
    }

    const classTokens = Array.from(tokenLogits.keys());
    const logitValues = Array.from(tokenLogits.values());
    const softmaxValues = softmax(logitValues);
    const tokenProbabilities: Map<string, number> = new Map();
    for (let i = 0; i < classTokens.length; i++) {
        tokenProbabilities.set(classTokens[i], softmaxValues[i]);
    }

    return tokenProbabilities;
}

export function getTokenProbabilitiesFromLogits(logits: OpenAILogProb[], tokenChoices: Set<string>): Map<string, number>[] {
    const tokenProbabilities: Map<string, number>[] = [];
    for (const logit of logits) {
        const tokenPresent = tokenChoices.has(logit.token);
        if (!tokenPresent) {
            continue;
        }

        const tokenProbability = getTokenProbabilitiesFromLogit(logit, tokenChoices);
        tokenProbabilities.push(tokenProbability);
    }
    return tokenProbabilities;
}
