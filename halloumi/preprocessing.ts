
/**
 * Represents a prompt with appropriate metadata
 */
export interface HalloumiGenerativePrompt {
    prompt: string;
    contextOffsets: Map<number, StringOffsetWindow>;
    responseOffsets: Map<number, StringOffsetWindow>;
}

export interface StringOffsetWindow {
    startOffset: number;
    endOffset: number;
}

export interface HalloumiClassifierPrompt {
    prompts: string[];
    sentences: string[];
    responseOffsets: Map<number, StringOffsetWindow>;
}

/**
 * Splits a given text into sentences using sentence-splitter.
 * @param text The input string to split.
 * @returns An array of sentence strings.
 */
function splitIntoSentences(text: string): string[] {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = segmenter.segment(text);

    const finalSentences = [];
    let shortSentenceString = "";
    for (const { segment } of segments) {
        // Assume that a sentence is more than 8 characters.
        if (segment.length > 8) {
            finalSentences.push(shortSentenceString + segment);
            shortSentenceString = "";
        }
        else {
            shortSentenceString += segment
        }
    }

    return finalSentences;
}

/**
 * Annotate a set of sentences with a given annotation character.
 * @param sentences A list of sentences to annotate.
 * @param annotationChar The character to use for annotation.
 * @returns The annotated string with annotation characters + sentence number.
 */
function annotate(sentences: string[], annotationChar: string): string {
    const annotatedSentences: string[] = [];

    let sentenceNumber: number = 0;
    for (const sentence of sentences) {
        sentenceNumber++;
        const annotatedSentence = `<|${annotationChar}${sentenceNumber}|><${sentence}><end||${annotationChar}>`;
        annotatedSentences.push(annotatedSentence);
    }

    return annotatedSentences.join("");
}

function getOffsets(originalString: string, sentences: string[]): Map<number, StringOffsetWindow> {
    const offsets: Map<number, StringOffsetWindow> = new Map();
    let stringProgressPointer: number = 0;
    let sentenceId: number = 1;
    for (const sentence of sentences) {
        const stringToSearch = originalString.slice(stringProgressPointer);
        const startOffset = stringToSearch.indexOf(sentence) + stringProgressPointer;
        const endOffset = startOffset + sentence.length;
        stringProgressPointer = endOffset;
        offsets.set(sentenceId,
            { startOffset: startOffset, endOffset: endOffset });
        sentenceId++;
    }
    return offsets;
}

/**
 * Creates a Halloumi prompt from a given context, request and response.
 * @param context The context or document to reference.
 * @param response The response to the request.
 * @param request The request or question that was used to produce the response.
 * @returns The Halloumi prompt.
 */
export function createHalloumiPrompt(
    context: string,
    response: string,
    request: string = "Make one or more claims about information in the documents."): HalloumiGenerativePrompt {
    const contextSentences = splitIntoSentences(context);
    const contextOffsets: Map<number, StringOffsetWindow> = getOffsets(context, contextSentences)
    const annotatedContextSentences = annotate(contextSentences, "s");
    const annotatedContext = `<|context|>${annotatedContextSentences}<end||context>`;

    const annotatedRequest = `<|request|><${request.trim()}><end||request>`;

    const responseSentences = splitIntoSentences(response);
    const responseOffsets: Map<number, StringOffsetWindow> = getOffsets(response, responseSentences)
    const annotatedResponseSentences = annotate(responseSentences, "r");
    const annotatedResponse = `<|response|>${annotatedResponseSentences}<end||response>`;

    const prompt = `${annotatedContext}${annotatedRequest}${annotatedResponse}`;
    const halloumiPrompt: HalloumiGenerativePrompt = {
        prompt: prompt,
        contextOffsets: contextOffsets,
        responseOffsets: responseOffsets
    };

    return halloumiPrompt;
}

/**
 * Creates a Halloumi prompt from a given context and response.
 * @param context The context or document to reference.
 * @param response The response to the request.
 * @returns The Halloumi Classifier prompt string.
 */
export function createHalloumiClassifierPrompt(
    context: string,
    response: string): string {
    const annotatedContext = `<context>\n${context.trim()}\n</context>`;
    const annotatedResponse = `<claims>\n${response.trim()}\n</claims>`;

    const prompt = `${annotatedContext}\n\n${annotatedResponse}`;
    return prompt;
}

/**
 * Creates a Halloumi prompt from a given context and response.
 * @param context The context or document to reference.
 * @param response The response to the request.
 * @returns The Halloumi Classifier prompt strings.
 */
export function createHalloumiClassifierPrompts(
    context: string,
    response: string): HalloumiClassifierPrompt {
    const responseSentences = splitIntoSentences(response);
    const responseOffsets: Map<number, StringOffsetWindow> = getOffsets(response, responseSentences)
    const prompts: string[] = [];
    for (const sentence of responseSentences) {
        const prompt = createHalloumiClassifierPrompt(context, sentence);
        prompts.push(prompt);
    }

    const halloumiPrompt: HalloumiClassifierPrompt = {
        prompts: prompts,
        sentences: responseSentences,
        responseOffsets: responseOffsets
    };

    return halloumiPrompt;
}
