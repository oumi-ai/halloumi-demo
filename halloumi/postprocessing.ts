
/**
 * Represents a claim object with all relevant information.
 */
class Claim {
    claim_id: number = -1;
    claim_string: string = "";
    subclaims: string[] = [];
    citations: number[] = [];
    explanation: string = "";
    supported: boolean = true;
}

/**
 * Gets the claim id from a subsegment.
 * @param subsegment A subsegment string of the form "<|r1|".
 * @returns The numeric claim id.
 */
function getClaimIdFromSubsegment(subsegment: string): number {
    const claim_id = subsegment.split("|")[1];
    const claim_id_no_r = claim_id.split("r")[1];
    return parseInt(claim_id_no_r);
}

/**
 * Gets the citations from a subsegment.
 * @param subsegment A subsegment string of the form "|s1|,|s2|,|s3|,|s4|".
 * @returns The list of numeric citations.
 */
function getClaimCitationsFromSubsegment(subsegment: string): number[] {
    const citation_segments = subsegment.split(",");
    const citations: number[] = [];
    for (const citation_segment of citation_segments) {
        const citation = citation_segment.replaceAll("|", "").replaceAll("s", "");
        if (citation.includes("-")) {
            const citation_range = citation.split("-");
            for (let i = parseInt(citation_range[0].trim()); i <= parseInt(citation_range[1].trim()); i++) {
                citations.push(i);
            }
        }
        else if (citation.includes("to")) {
            const citation_range = citation.split("to");
            for (let i = parseInt(citation_range[0].trim()); i <= parseInt(citation_range[1].trim()); i++) {
                citations.push(i);
            }
        }
        else {
            const citation_int = parseInt(citation);
            if (!isNaN(citation_int)) {
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
function getClaimFromSegment(segment: string): Claim {
    const claim_segments = segment.split("><");
    const claim = new Claim();
    claim.claim_id = getClaimIdFromSubsegment(claim_segments[0]);
    claim.claim_string = claim_segments[1];

    const subclaims: string[] = [];
    let claim_progress_index = 3; // Start at 3 to skip the claim id, claim string and the subclaims tag
    for (let i = claim_progress_index; i < claim_segments.length; i++) {
        const subsegment = claim_segments[i];
        if (subsegment.startsWith("end||subclaims")) {
            claim_progress_index = i + 1; // 
            break;
        }
        else {
            subclaims.push(subsegment);
        }
    }

    let citation_index = -1
    let explanation_index = -1
    let label_index = -1
    for (let i = claim_progress_index; i < claim_segments.length; i++) {
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
    
    claim.subclaims = subclaims;
    claim.citations = getClaimCitationsFromSubsegment(claim_segments[citation_index]);
    claim.explanation = claim_segments[explanation_index];
    claim.supported = getSupportStatusFromSubsegment(claim_segments[label_index]);

    return claim;
}

/**
 * Gets all claims from a response.
 * @param response A string containing all claims and their information.
 * @returns A list of claim objects.
 */
function getClaimsFromResponse(response: string): Claim[] {
    let segments: string[] = response.split("<end||r>");
    const claims: Claim[] = [];

    for (const segment of segments) {
        if (segment.length === 0) {
            continue;
        }

        const claim = getClaimFromSegment(segment);
        claims.push(claim);
    }

    return claims
}

const claim_verification = "<|r1|><There is no information about the average lifespan of a giant squid in the deep waters of the Pacific Ocean in the provided document.><|subclaims|><The document contains information about the average lifespan of a giant squid.><The information about giant squid lifespan is related to the Pacific Ocean.><end||subclaims><|cite|><|s1 to s49|><end||cite><|explain|><Upon reviewing the entire document, there is no mention of giant squid or any related topic, including their average lifespan or the Pacific Ocean. The document is focused on international relations, diplomacy, and conflict resolution.><end||explain><|supported|><end||r><|r2|><The document is focused on international relations, diplomacy, and conflict resolution, and does not mention giant squid or any related topic.><|subclaims|><The document is focused on international relations, diplomacy, and conflict resolution.><The document does not mention giant squid or any related topic.><end||subclaims><|cite|><|s1|,|s2|,|s3|,|s4|><end||cite><|explain|><The first four sentences clearly establish the document's focus on international relations, diplomacy, and conflict resolution, and there is no mention of giant squid or any related topic throughout the document.><end||explain><|supported|><end||r><|r3|><The document mentions cats.><|subclaims|><The document makes some mention of cats.><end||subclaims><|cite|><None><end||cite><|explain|><There is no mention of cats anywhere in the document.><end||explain><|unsupported|><end||r>";
const claims = getClaimsFromResponse(claim_verification);
console.log(claims);

