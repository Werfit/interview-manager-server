import { PathLike } from 'node:fs';

export interface ITranscriptionSegment {
  start: number; // in milliseconds
  end: number; // in milliseconds
  text: string;
}

export interface ITranscriptionResult {
  segments: ITranscriptionSegment[];
  // combined text of all segments
  text: string;
}

export interface ITranscriptionProvider {
  transcribe(audioUrl: string | PathLike): Promise<ITranscriptionResult | null>;
}
