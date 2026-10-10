import { readFile } from "node:fs/promises";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/audio/transcriptions";

type WordTimestamp = {
  word: string;
  start: number;
  end: number;
};

type TranscriptionResult = {
  text: string;
  words?: WordTimestamp[];
  duration?: number;
};

/**
 * Transcribes an audio file to text using the model configured in the
 * `AI_TRNASCRIPTION_MODEL` environment variable
 * via the OpenRouter audio transcription endpoint.
 *
 * Reads the file at `filePath` from disk, base64-encodes it, and sends it to
 * OpenRouter requesting word-level timestamps. The audio is sent
 * inline in the request body, so large files increase request size.
 *
 * @param filePath - Absolute or relative path to the audio file to transcribe.
 * @param format - Audio container/codec hint passed to the API (e.g. "mp3",
 *   "wav", "m4a"). Defaults to "mp3". Must match the actual file contents.
 * @returns A promise resolving to a transcription result:
 *   - `text`: the full transcript as a single string.
 *   - `words`: array of `{ word, start, end }` with times in seconds
 *     (empty array if the API returns none).
 *   - `duration`: total audio duration in seconds, or `undefined` if unknown.
 * @throws {Error} If the HTTP response is not ok, with the status code and
 *   response body in the message.
 *
 * @example
 * const { text, words, duration } = await transcribeAudio("clip.mp3");
 * console.log(text);   // "Spend a day with me as I try..."
 * console.log(words);  // [{ word: "Spend", start: 0.12, end: 0.34 }, ...]
 */
export async function transcribeAudio(filePath: string, format = "mp3") {
  const audio = await readFile(filePath);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_TRNASCRIPTION_MODEL,
      input_audio: {
        data: audio.toString("base64"),
        format,
      },
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Transcription failed (${response.status}): ${await response.text()}`,
    );
  }

  const result = (await response.json()) as TranscriptionResult;

  return {
    text: result.text,
    words: result.words ?? [],
    duration: result.duration,
  };
}
