# 🚀 Introducing HallOumi - A State-of-the-Art Claim Verification Model

[![Made with Oumi](https://badgen.net/badge/Made%20with/Oumi/%23085CFF?icon=https%3A%2F%2Foumi.ai%2Flogo_dark.svg)](https://github.com/oumi-ai/oumi)

Introducing HallOumi, a state-of-the-art claim verification model, outperforming DeepSeek R1, OpenAI o1, Google Gemini 1.5 Pro, and Anthropic Sonnet 3.5 at only 8 billion parameters!

HallOumi, the hallucination detection model built with [Oumi](https://github.com/oumi-ai/oumi), is a system built specifically to enable per-sentence verification of any content (either AI or human-generated) with sentence-level citations and human-readable explanations.

Try a hosted version of this demo [on our website](https://oumi.ai/halloumi-demo)!

Read more in our blog post [here](https://oumi.ai/blog/posts/introducing-halloumi)!

# ⚡ Quickstart

## 🐳 Docker build

You can easily build and run the HallOumi demo via docker.
While inside the repo directory:
```
docker build -t halloumi-demo .
docker run -p 3000:3000 halloumi-demo
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the demo!

## 💻 Building from source

### Dev Environment Setup

1. Install NPM

   ```
   brew install npm
   ```

2. NextJS and React

   ```
   npm install next@latest react@latest react-dom@latest
   ```

### Running Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the demo!

## 🤖 Self-host Models

If you'd like to point the demo to your own self-hosted version of the models, simply
modify [data.json](https://github.com/oumi-ai/halloumi-demo/blob/main/app/data.json).

Below is a sample `data.json` assuming you've self hosted the generative model at `localhost:8000`:
```json
{
    "models": [
        {
            "displayName": "My custom hosted model",
            "name": "mymodel",
            "apiUrl": "http://localhost:8000/chat/completions",
            "isEmbeddingModel": false
        }
    ],
    "examples": [
        {
            "displayName": "Getting Started",
            "claim": "Text here appears in the 'Claims to verify' box.",
            "context": "This text will appear in the 'Context' box."
        }
    ]
}
```

The demo assumes that the target endpoint supports the standard OpenAI API for each
model. 

### Host the Generative HallOumi model
```bash
pip install sglang
python3 -m sglang.launch_server --model-path oumi-ai/HallOumi-8B --port 8000 --dtype auto --mem-fraction-static 0.9 --trust-remote-code
```

### Host the Classifier HallOumi model
Note that the classifier is hosted as an embeddings model. You can query it via the standard `/embeddings` endpoint in OpenAI-compatible API servers.
```bash
pip install sglang
python3 -m sglang.launch_server --model-path oumi-ai/HallOumi-8B-classifier --port 8001 --dtype auto --mem-fraction-static 0.9 --trust-remote-code --is-embedding
```
