
import { Citation, Claim, HalloumiClassifierResponse, Model, VerifyClaimResponse } from '../app/types';

import { createHalloumiClassifierPrompts, HalloumiClassifierPrompt, HalloumiGenerativePrompt, StringOffsetWindow } from './preprocessing';

import { GenerativeClaim, getClaimsFromResponse, getClassifierProbabilitiesFromLogits, getTokenProbabilitiesFromLogits, OpenAILogProb } from './postprocessing';

/**
 * Gets all claims from a response.
 * @param response A string containing all claims and their information.
 * @returns A list of claim objects.
 */
async function halloumiGenerativeAPI(model: Model, prompt: HalloumiGenerativePrompt): Promise<GenerativeClaim[]> {

    const data = {
        messages: [{ "role": "user", "content": prompt.prompt }],
        temperature: 0.0,
        model: model.name,
        logprobs: true,
        top_logprobs: 3
    };
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    };
    if (model.apiKey) {
        headers['Authorization'] = `BEARER ${model.apiKey}`;
    }

    const response = await fetch(model.apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    });

    const jsonData = await response.json();
    const tokenChoices = new Set<string>(["supported", "unsupported"]);
    const logits = jsonData.choices[0].logprobs.content as OpenAILogProb[];
    const tokenProbabilities = getTokenProbabilitiesFromLogits(logits, tokenChoices);
    const parsedResponse: GenerativeClaim[] = getClaimsFromResponse(jsonData.choices[0].message.content);

    if (parsedResponse.length != tokenProbabilities.length) {
        throw new Error("Token probabilities and claims do not match.");
    }

    for (let i = 0; i < parsedResponse.length; i++) {
        parsedResponse[i].probabilities = tokenProbabilities[i];
    }

    return parsedResponse;
}

export async function halloumiClassifierAPI(context: string, claims: string): Promise<HalloumiClassifierResponse> {
    const classifierPrompts: HalloumiClassifierPrompt = createHalloumiClassifierPrompts(context, claims);
    const responseClaims: Claim[] = [];

    for (let i = 0; i < classifierPrompts.prompts.length; i++) {
        const prompt = classifierPrompts.prompts[i];
        const apiEndpoint = 'https://api.oumi.ai/embeddings';
        const data = {
            input: prompt,
            model: 'halloumi-classifier',
        };

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'BEARER bd5784a355bbfd9146c555a70f00accb'
            },
            body: JSON.stringify(data),
        });

        const jsonData = await response.json();
        const embedding = jsonData.data[0].embedding;
        const probs = getClassifierProbabilitiesFromLogits(embedding);
        const offset = classifierPrompts.responseOffsets.get(i + 1)!;
        // 0-th index is the supported class.
        // 1-th index is the unsupported class.
        responseClaims.push({
            startOffset: offset.startOffset,
            endOffset: offset.endOffset,
            citationIds: [],
            score: probs[0],
            rationale: ""
        });
    }

    const response: HalloumiClassifierResponse = {
        claims: responseClaims
    };
    return response;
}

export function convertGenerativesClaimToVerifyClaimResponse(generativeClaims: GenerativeClaim[], prompt: HalloumiGenerativePrompt): VerifyClaimResponse {
    const citations: { [id: string]: Citation } = {};
    const claims: Claim[] = [];

    for (const offset of prompt.contextOffsets) {
        const citation: Citation = {
            startOffset: offset[1].startOffset,
            endOffset: offset[1].endOffset,
            id: offset[0].toString()
        };
        citations[offset[0].toString()] = citation;
    }

    for (const generativeClaim of generativeClaims) {
        const citationIds: string[] = [];
        for (const citation of generativeClaim.citations) {
            citationIds.push(citation.toString());
        }

        const claimId: number = generativeClaim.claimId;
        if (!prompt.responseOffsets.has(claimId)) {
            throw new Error(`Claim ${claimId} not found in response offsets.`);
        }

        const claimResponseWindow: StringOffsetWindow = prompt.responseOffsets.get(claimId)!;
        const score: number = generativeClaim.probabilities.get("supported")!;
        const claim: Claim = {
            startOffset: claimResponseWindow.startOffset,
            endOffset: claimResponseWindow.endOffset,
            citationIds: citationIds,
            score: score,
            rationale: generativeClaim.explanation
        };
        claims.push(claim);
    }

    const response: VerifyClaimResponse = {
        claims: claims,
        citations: citations
    };

    return response;
}

export async function getVerifyClaimResponse(model: Model, prompt: HalloumiGenerativePrompt): Promise<VerifyClaimResponse> {
    return halloumiGenerativeAPI(model, prompt).then((claims) => {
        return convertGenerativesClaimToVerifyClaimResponse(claims, prompt);
    });
}