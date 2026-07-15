const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const sourcePath = path.join(
  projectRoot,
  "ai-transcripts",
  "manual-conversation-source.txt"
);

const transcriptPath = path.join(
  projectRoot,
  "ai-transcripts",
  "chatgpt-assignment-visible-transcript.json"
);

const promptJsonPath = path.join(
  projectRoot,
  "prompts",
  "all-user-prompts.json"
);

const promptMarkdownPath = path.join(
  projectRoot,
  "prompts",
  "all-user-prompts.md"
);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  fail(`Source file not found: ${sourcePath}`);
}

const source = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");

const messagePattern =
  /<<<MESSAGE role="(user|assistant)">>>\n([\s\S]*?)\n<<<END_MESSAGE>>>/g;

const messages = [];
let match;

while ((match = messagePattern.exec(source)) !== null) {
  const role = match[1];
  const content = match[2];

  if (!content.trim()) {
    fail(`Empty message detected after sequence ${messages.length}.`);
  }

  messages.push({
    sequence: messages.length + 1,
    role,
    content
  });
}

if (messages.length === 0) {
  fail("No valid transcript messages were found.");
}

const unmatchedSource = source
  .replace(messagePattern, "")
  .trim();

if (unmatchedSource.length > 0) {
  console.warn(
    "WARNING: Text was found outside the message delimiters. " +
      "Review manual-conversation-source.txt."
  );
}

const userMessages = messages.filter(message => message.role === "user");

const transcript = {
  transcript_metadata: {
    title: "SatSure Autocomplete Form Practical Assignment",
    ai_tool: "ChatGPT",
    capture_method:
      "Manually captured from the user-visible ChatGPT conversation",
    official_platform_export: false,
    scope:
      "Assignment-related messages only, from the original assignment prompt through final submission preparation",
    generated_from:
      "ai-transcripts/manual-conversation-source.txt",
    completeness_statement:
      "The transcript preserves the assignment-related visible conversation in chronological order, including failed setup attempts, corrections, debugging, requirement analysis, code review and submission preparation.",
    message_count: messages.length,
    user_message_count: userMessages.length,
    assistant_message_count: messages.length - userMessages.length
  },
  messages
};

const prompts = {
  prompt_metadata: {
    ai_tool: "ChatGPT",
    source_transcript:
      "ai-transcripts/chatgpt-assignment-visible-transcript.json",
    extraction_rule:
      "Every transcript message whose role is user is included without rewriting.",
    prompt_count: userMessages.length
  },
  prompts: userMessages.map((message, index) => ({
    prompt_number: index + 1,
    transcript_sequence: message.sequence,
    content: message.content
  }))
};

const promptMarkdown = [
  "# Complete User Prompt Record",
  "",
  "- AI tool: ChatGPT",
  "- Capture method: Extracted from the manually captured transcript",
  "- Editing applied: Headings only; prompt wording unchanged",
  `- Prompt count: ${userMessages.length}`,
  "",
  ...userMessages.flatMap((message, index) => [
    `## Prompt ${index + 1}`,
    "",
    `Transcript sequence: ${message.sequence}`,
    "",
    "```text",
    message.content,
    "```",
    ""
  ])
].join("\n");

fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
fs.mkdirSync(path.dirname(promptJsonPath), { recursive: true });

fs.writeFileSync(
  transcriptPath,
  JSON.stringify(transcript, null, 2),
  "utf8"
);

fs.writeFileSync(
  promptJsonPath,
  JSON.stringify(prompts, null, 2),
  "utf8"
);

fs.writeFileSync(
  promptMarkdownPath,
  promptMarkdown,
  "utf8"
);

console.log("AI evidence generated successfully.");
console.log(`Messages: ${messages.length}`);
console.log(`User prompts: ${userMessages.length}`);
console.log(
  `Assistant messages: ${messages.length - userMessages.length}`
);
console.log(`Transcript: ${transcriptPath}`);
console.log(`Prompt JSON: ${promptJsonPath}`);
console.log(`Prompt Markdown: ${promptMarkdownPath}`);