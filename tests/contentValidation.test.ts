import {
  isValidImageUrl,
  isValidUrl,
  isValidVideoUrl,
} from '../src/utils/contentValidation';

describe('contentValidation', () => {
  it('accepts only http and https links', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/plain,hello')).toBe(false);
  });

  it('accepts registered bare asset keys and rejects missing ones', () => {
    expect(isValidImageUrl('infra.jpeg')).toBe(true);
    expect(isValidImageUrl('meta.avif')).toBe(true);
    expect(isValidVideoUrl('infra.mp4')).toBe(true);
    expect(isValidVideoUrl('meta.mp4')).toBe(true);
    expect(isValidImageUrl('missing.jpeg')).toBe(false);
    expect(isValidVideoUrl('missing.mp4')).toBe(false);
  });

  it('requires media extensions at the end of the path', () => {
    expect(isValidImageUrl('/images/example.jpeg?v=1')).toBe(true);
    expect(isValidVideoUrl('https://example.com/video.mp4?version=1')).toBe(
      true
    );
    expect(isValidImageUrl('/images/example.jpeg.js')).toBe(false);
    expect(isValidVideoUrl('https://example.com/video.mp4.js')).toBe(false);
  });
});
