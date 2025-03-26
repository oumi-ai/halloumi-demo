# 🚀 HallOumi - Build Trustworthy AI in the Age of Disinformation

Introducing HallOumi, a SOTA claim verification model, outperforming DeepSeek R1, OpenAI o1, Google Gemini 1.5 Pro, and Anthropic Sonnet 3.5 at only 8 billion parameters!

HallOumi, the hallucination detection model built with Oumi, is a system built specifically to enable per-sentence verification of any content (either AI or human-generated) with sentence-level citations and human-readable explanations.

Read more in our blog post [here](https://oumi.ai)!

# ⚡ Quickstart

## 🐳 Docker build

You can easily build and run the HallOumi demo via docker.
While inside the repo directory:
```
docker build -t halloumi-demo .
docker run -p 3000:3000 halloumi-demo
```

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

Open [http://localhost:3000](http://localhost:3000) with your browser to access the demo.

## 🤖 Self-host Models

If you'd like to point the demo to your own self-hosted version of the models, simply
modify [data.json](https://github.com/oumi-ai/halloumi-demo/blob/main/app/data.json).

The demo assumes that the target endpoint supports the standard OpenAI API for each
model. 

### Host the Generative HallOumi model
```bash
pip install sglang
python3 -m sglang.launch_server --model-path oumi-ai/Hall-Oumi-8B --port 8000 --dtype auto --mem-fraction-static 0.9 --trust-remote-code --is-embedding"
```