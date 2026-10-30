import { describe, expect, it } from 'vitest';
import { youtubeVideoId } from './youtube';

describe('youtubeVideoId', () => {
  it('accepts supported YouTube video and live URLs', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=abcdefghijk&t=12')).toBe('abcdefghijk');
    expect(youtubeVideoId('https://youtube.com/live/abcdefghijk')).toBe('abcdefghijk');
    expect(youtubeVideoId('https://youtu.be/abcdefghijk')).toBe('abcdefghijk');
  });

  it('rejects unrelated and malformed embed sources', () => {
    expect(youtubeVideoId('https://youtube.com.evil.example/watch?v=abcdefghijk')).toBeNull();
    expect(youtubeVideoId('http://youtube.com/watch?v=abcdefghijk')).toBeNull();
    expect(youtubeVideoId('https://youtube.com/@channel/live')).toBeNull();
  });
});
