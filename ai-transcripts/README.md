# AI Conversation Evidence

## AI Tool

ChatGPT

## Evidence Files

- `manual-conversation-source.txt` — manually captured source containing the exact visible messages
- `chatgpt-assignment-visible-transcript.json` — machine-readable complete assignment transcript
- `../prompts/all-user-prompts.json` — every exact user prompt extracted from the transcript
- `../prompts/all-user-prompts.md` — human-readable prompt record

## Capture Method

The conversation was manually captured from the user-visible ChatGPT
conversation because the official account export was not available within
the assignment deadline.

The transcript is not represented as an official ChatGPT platform export.

## Scope

Only the SatSure autocomplete-assignment conversation is included. Unrelated
account conversations are excluded.

The transcript contains the original assignment request, generated guidance,
environment setup errors, corrections, requirement analysis, code review,
test modifications, local execution, GitHub setup and submission preparation.

## Integrity

The prompt files are generated directly from every transcript message whose
role is `user`. Prompt wording is not rewritten.

Failed attempts, debugging exchanges and corrections are retained.