const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

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

const manualSourcePath = path.join(
  projectRoot,
  "ai-transcripts",
  "manual-conversation-source.txt"
);

const errors = [];
const warnings = [];

function fileExists(filePath, displayName) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${displayName}`);
    return false;
  }

  return true;
}

function readJson(filePath, displayName) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${displayName}: ${error.message}`);
    return null;
  }
}

console.log("Validating AI evidence...\n");

/*
 * 1. Check that required files exist.
 */
const transcriptExists = fileExists(
  transcriptPath,
  "ai-transcripts/chatgpt-assignment-visible-transcript.json"
);

const promptJsonExists = fileExists(
  promptJsonPath,
  "prompts/all-user-prompts.json"
);

fileExists(
  promptMarkdownPath,
  "prompts/all-user-prompts.md"
);

fileExists(
  manualSourcePath,
  "ai-transcripts/manual-conversation-source.txt"
);

/*
 * 2. Parse JSON files.
 */
const transcript = transcriptExists
  ? readJson(
      transcriptPath,
      "ai-transcripts/chatgpt-assignment-visible-transcript.json"
    )
  : null;

const promptRecord = promptJsonExists
  ? readJson(
      promptJsonPath,
      "prompts/all-user-prompts.json"
    )
  : null;

/*
 * 3. Validate transcript structure.
 */
if (transcript) {
  if (!transcript.transcript_metadata) {
    errors.push("Transcript metadata is missing.");
  }

  if (!Array.isArray(transcript.messages)) {
    errors.push("Transcript 'messages' must be an array.");
  } else if (transcript.messages.length === 0) {
    errors.push("Transcript contains no messages.");
  } else {
    transcript.messages.forEach((message, index) => {
      const expectedSequence = index + 1;

      if (message.sequence !== expectedSequence) {
        errors.push(
          `Transcript sequence error at index ${index}: ` +
          `expected ${expectedSequence}, received ${message.sequence}`
        );
      }

      if (!["user", "assistant"].includes(message.role)) {
        errors.push(
          `Invalid role at sequence ${message.sequence}: ${message.role}`
        );
      }

      if (
        typeof message.content !== "string" ||
        message.content.trim().length === 0
      ) {
        errors.push(
          `Empty or invalid content at sequence ${message.sequence}`
        );
      }
    });

    const userMessages = transcript.messages.filter(
      message => message.role === "user"
    );

    const assistantMessages = transcript.messages.filter(
      message => message.role === "assistant"
    );

    const metadata = transcript.transcript_metadata || {};

    if (
      metadata.message_count !== undefined &&
      metadata.message_count !== transcript.messages.length
    ) {
      errors.push(
        `Metadata message_count is ${metadata.message_count}, ` +
        `but transcript contains ${transcript.messages.length} messages.`
      );
    }

    if (
      metadata.user_message_count !== undefined &&
      metadata.user_message_count !== userMessages.length
    ) {
      errors.push(
        `Metadata user_message_count is ${metadata.user_message_count}, ` +
        `but transcript contains ${userMessages.length} user messages.`
      );
    }

    if (
      metadata.assistant_message_count !== undefined &&
      metadata.assistant_message_count !== assistantMessages.length
    ) {
      errors.push(
        `Metadata assistant_message_count is ` +
        `${metadata.assistant_message_count}, but transcript contains ` +
        `${assistantMessages.length} assistant messages.`
      );
    }

    if (metadata.official_platform_export !== false) {
      warnings.push(
        "Transcript should clearly state official_platform_export: false " +
        "because this is a manually captured transcript."
      );
    }
  }
}

/*
 * 4. Validate prompt-record structure.
 */
if (promptRecord) {
  if (!promptRecord.prompt_metadata) {
    errors.push("Prompt metadata is missing.");
  }

  if (!Array.isArray(promptRecord.prompts)) {
    errors.push("Prompt record 'prompts' must be an array.");
  } else if (promptRecord.prompts.length === 0) {
    errors.push("Prompt record contains no prompts.");
  } else {
    promptRecord.prompts.forEach((prompt, index) => {
      const expectedPromptNumber = index + 1;

      if (prompt.prompt_number !== expectedPromptNumber) {
        errors.push(
          `Prompt numbering error at index ${index}: expected ` +
          `${expectedPromptNumber}, received ${prompt.prompt_number}`
        );
      }

      if (
        typeof prompt.content !== "string" ||
        prompt.content.trim().length === 0
      ) {
        errors.push(
          `Empty or invalid prompt content at prompt ${prompt.prompt_number}`
        );
      }

      if (
        typeof prompt.transcript_sequence !== "number"
      ) {
        errors.push(
          `Prompt ${prompt.prompt_number} is missing transcript_sequence.`
        );
      }
    });
  }
}

/*
 * 5. Confirm that every user transcript message appears in the prompt file.
 */
if (
  transcript &&
  Array.isArray(transcript.messages) &&
  promptRecord &&
  Array.isArray(promptRecord.prompts)
) {
  const userMessages = transcript.messages.filter(
    message => message.role === "user"
  );

  if (userMessages.length !== promptRecord.prompts.length) {
    errors.push(
      `Prompt count mismatch: transcript contains ${userMessages.length} ` +
      `user messages, but prompt file contains ` +
      `${promptRecord.prompts.length} prompts.`
    );
  }

  const comparisonCount = Math.min(
    userMessages.length,
    promptRecord.prompts.length
  );

  for (let index = 0; index < comparisonCount; index += 1) {
    const transcriptMessage = userMessages[index];
    const prompt = promptRecord.prompts[index];

    if (
      transcriptMessage.sequence !== prompt.transcript_sequence
    ) {
      errors.push(
        `Prompt ${prompt.prompt_number} references transcript sequence ` +
        `${prompt.transcript_sequence}, but expected ` +
        `${transcriptMessage.sequence}.`
      );
    }

    if (transcriptMessage.content !== prompt.content) {
      errors.push(
        `Prompt ${prompt.prompt_number} content does not exactly match ` +
        `the corresponding transcript user message.`
      );
    }
  }

  const declaredPromptCount =
    promptRecord.prompt_metadata?.prompt_count;

  if (
    declaredPromptCount !== undefined &&
    declaredPromptCount !== promptRecord.prompts.length
  ) {
    errors.push(
      `Prompt metadata count is ${declaredPromptCount}, but the file ` +
      `contains ${promptRecord.prompts.length} prompts.`
    );
  }
}

/*
 * 6. Print the validation result.
 */
if (warnings.length > 0) {
  console.log("Warnings:");

  warnings.forEach(warning => {
    console.log(`- ${warning}`);
  });

  console.log();
}

if (errors.length > 0) {
  console.error("AI evidence validation failed:\n");

  errors.forEach(error => {
    console.error(`- ${error}`);
  });

  process.exit(1);
}

const messageCount = transcript?.messages?.length || 0;
const promptCount = promptRecord?.prompts?.length || 0;

console.log("AI evidence validation passed.");
console.log(`Transcript messages: ${messageCount}`);
console.log(`User prompts: ${promptCount}`);
console.log("All transcript user messages match the prompt record.");