

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

function annotate(sentences: string[], annotation_char: string): string {
    const annotated_sentences: string[] = [];

    let counter: number = 0;
    for (const sentence of sentences) {
        counter++;
        annotated_sentences.push(`<|${annotation_char}${counter}|><${sentence}><end||${annotation_char}>`);
    }

    return annotated_sentences.join("");
}

function createPrompt(context: string, request: string, response: string): string {
    const context_sentences = splitIntoSentences(context);
    const annotated_context_sentences = annotate(context_sentences, "s");
    const annotated_context = `<|context|>${annotated_context_sentences}<end||context>`;

    const annotated_request = `<|request|><${request.trim()}><end||request>`;

    const response_sentences = splitIntoSentences(response);
    const annotated_response_sentences = annotate(response_sentences, "r");
    const annotated_response = `<|response|>${annotated_response_sentences}<end||response>`;

    return `${annotated_context}${annotated_request}${annotated_response}`;
}

const input = "It was the best of times. It was the worst of times.";
const request = "Make one or more claims about information in the document."
const response = "It was the okayest of times. Both best and worst at times.";
const annotated_prompt = createPrompt(input, request, response);
console.log(annotated_prompt);