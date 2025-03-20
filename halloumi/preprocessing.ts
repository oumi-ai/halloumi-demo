

/**
 * Splits a given text into sentences using sentence-splitter.
 * @param text The input string to split.
 * @returns An array of sentence strings.
 */
function splitIntoSentences(text: string): string[] {
    const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
    const segments = segmenter.segment(text);
    const sentences: string[] = [];

    for (const { segment } of segments) {
        sentences.push(segment.trim());
    }

    return sentences.filter(sentence => sentence.length > 0);
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

/**
 * Creates a Halloumi prompt from a given context, request and response.
 * @param context The context or document to reference.
 * @param response The response to the request.
 * @param request The request or question that was used to produce the response.
 * @returns 
 */
export function createHalloumiPrompt(
    context: string,
    response: string,
    request: string = "Make one or more claims about information in the documents."): string {
    const contextSentences = splitIntoSentences(context);
    const annotatedContextSentences = annotate(contextSentences, "s");
    const annotatedContext = `<|context|>${annotatedContextSentences}<end||context>`;

    const annotatedRequest = `<|request|><${request.trim()}><end||request>`;

    const responseSentences = splitIntoSentences(response);
    const annotatedResponseSentences = annotate(responseSentences, "r");
    const annotatedResponse = `<|response|>${annotatedResponseSentences}<end||response>`;

    const prompt = `${annotatedContext}${annotatedRequest}${annotatedResponse}`;
    return prompt;
}
