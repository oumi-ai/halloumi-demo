export interface ExampleTemplates {
    displayName: string;
    claim: string;
    context: string;
}

export interface Platt {
    a: number;
    b: number;
}

export interface Model {
    name: string;
    displayName: string;
    apiUrl: string;
    apiKey?: string;
    isEmbeddingModel?: boolean;
    plattScaling?: Platt;
}

export interface Citation {
    startOffset: number;
    endOffset: number;
    id: string;
};

export interface Claim {
    startOffset: number;
    endOffset: number;
    citationIds: string[];
    score: number;
    rationale: string;
};

export interface VerifyClaimResponse {
    claims: Claim[];
    citations: { [id: string]: Citation };
}

export interface VerifyClaimRequest {
    input: string;
    context: string;
    model?: string;
}

export interface HalloumiGenerativeRequest {
    messages: Map<string, string>[];
    temperature: number;
    model: string;
}

export interface HalloumiGenerativeResponse {
    claims: Claim[];
    citations: { [id: string]: Citation };
}

export interface HalloumiClassifierRequest {
    input: string;
    model: string;
}

export interface HalloumiClassifierResponse {
    claims: Claim[];
}